/**
 * Shared PayPal utilities for server-side API calls.
 */

const PAYPAL_API = "https://api-m.paypal.com"

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getPayPalAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token
  }

  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET
  if (!clientId || !secret) throw new Error("PAYPAL_CLIENT_ID or PAYPAL_SECRET not configured")

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64")
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  })

  const data = await res.json()
  if (!res.ok || !data.access_token) {
    throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`)
  }

  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 }
  return data.access_token
}

function toPayPalCarrier(shippoCarrier: string): string {
  const c = shippoCarrier.toUpperCase().trim()
  if (c.includes("FEDEX") || c.includes("FED EX")) return "FEDEX"
  if (c.includes("UPS")) return "UPS"
  if (c.includes("USPS")) return "USPS"
  if (c.includes("DHL")) return "DHL"
  return c
}

export async function syncTrackingToPayPal(
  paypalOrderId: string, trackingNumber: string, carrier: string,
  logger?: { info: (...args: any[]) => void; warn: (...args: any[]) => void; error: (...args: any[]) => void },
  pgConnection?: any, orderId?: string
): Promise<{ synced: boolean; reason: string }> {
  const log = logger || { info: console.log, warn: console.warn, error: console.error }

  const dbLog = async (event: string, message: string, data?: Record<string, any>, level?: string) => {
    if (!pgConnection) return
    try {
      const { debugLog } = await import("./debug-log.js")
      await debugLog(pgConnection, event, orderId || null, message, { paypalOrderId, trackingNumber, carrier, ...data }, level ? { level: level as "error" | "warn" | "info" } : undefined)
    } catch {}
  }

  if (!paypalOrderId || !trackingNumber || !carrier) {
    await dbLog("paypal_tracking_skip", `Missing params: ppid=${!!paypalOrderId} tn=${!!trackingNumber} carrier=${!!carrier}`)
    return { synced: false, reason: "missing_params" }
  }

  try {
    const token = await getPayPalAccessToken()
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }

    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}`, { headers })
    if (!orderRes.ok) {
      await dbLog("paypal_tracking_skip", `PayPal order lookup failed: ${orderRes.status}`)
      return { synced: false, reason: `paypal_order_lookup_failed_${orderRes.status}` }
    }
    const orderData = await orderRes.json()
    const captures = orderData?.purchase_units?.[0]?.payments?.captures || []
    const capture = captures.find((c: any) => c.status === "COMPLETED") || captures[0]

    if (!capture?.id) { await dbLog("paypal_tracking_skip", "No capture found"); return { synced: false, reason: "no_capture_found" } }
    if (capture.status !== "COMPLETED" && capture.status !== "PARTIALLY_REFUNDED") {
      await dbLog("paypal_tracking_skip", `Capture status: ${capture.status}`)
      return { synced: false, reason: `capture_status_${capture.status}` }
    }

    const captureId = capture.id
    const trackersRes = await fetch(`${PAYPAL_API}/v1/shipping/trackers?transaction_id=${captureId}`, { headers })
    if (trackersRes.ok) {
      const trackersData = await trackersRes.json()
      if (trackersData?.trackers?.length > 0) return { synced: false, reason: "already_has_tracking" }
    }

    const syncRes = await fetch(`${PAYPAL_API}/v1/shipping/trackers-batch`, {
      method: "POST", headers,
      body: JSON.stringify({ trackers: [{ transaction_id: captureId, tracking_number: trackingNumber, carrier: toPayPalCarrier(carrier), status: "SHIPPED" }] }),
    })

    const syncData = await syncRes.json().catch(() => null)
    const errors = syncData?.errors || []
    if (errors.length > 0) {
      log.warn(`PayPal tracking sync failed: ${JSON.stringify(errors)}`)
      await dbLog("paypal_tracking_error", `Sync failed: ${JSON.stringify(errors)}`, { captureId }, "error")
      return { synced: false, reason: `paypal_api_error: ${JSON.stringify(errors)}` }
    }

    log.info(`PayPal tracking synced: capture=${captureId} tracking=${trackingNumber} carrier=${toPayPalCarrier(carrier)}`)
    await dbLog("paypal_tracking_synced", `Tracking pushed to PayPal`, { captureId, carrierMapped: toPayPalCarrier(carrier) })
    return { synced: true, reason: "ok" }
  } catch (err: any) {
    log.error(`PayPal tracking sync error: ${err.message}`)
    await dbLog("paypal_tracking_error", `Error: ${err.message}`, {}, "error")
    return { synced: false, reason: err.message }
  }
}

export { PAYPAL_API }

export async function refundPayPalOrderCapture(
  paypalOrderId: string, reason: string = "Order could not be processed"
): Promise<{ refundId: string; amount: string; captureId: string }> {
  const token = await getPayPalAccessToken()
  const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}`, { headers: { Authorization: `Bearer ${token}` } })
  const orderData = await orderRes.json()
  if (!orderRes.ok) throw new Error(`PayPal order lookup failed: ${JSON.stringify(orderData)}`)

  const captures = orderData?.purchase_units?.[0]?.payments?.captures || []
  const completedCapture = captures.find((c: any) => c.status === "COMPLETED")
  if (!completedCapture) throw new Error(`No completed capture found for PayPal order ${paypalOrderId}`)
  const captureId = completedCapture.id
  const amount = completedCapture.amount?.value

  const refundRes = await fetch(`${PAYPAL_API}/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "PayPal-Request-Id": `refund_${captureId}` },
    body: JSON.stringify({ note_to_payer: reason }),
  })
  const refundData = await refundRes.json()
  if (!refundRes.ok) throw new Error(`PayPal refund failed: ${JSON.stringify(refundData)}`)

  return { refundId: refundData.id, amount: refundData.amount?.value || amount, captureId }
}
