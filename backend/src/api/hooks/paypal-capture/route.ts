import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getPayPalAccessToken, PAYPAL_API } from "../../../utils/paypal"
import { debugLog } from "../../../utils/debug-log"

/**
 * POST /hooks/paypal-capture
 * Captures an approved PayPal order. Checks for DECLINED captures.
 * Called from summerteez.com frontend after customer approves payment.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type")

  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const { orderId } = req.body as any

  if (!orderId) {
    return res.status(400).json({ error: "orderId required" })
  }

  await debugLog(pg, "paypal_capture_start", null, `Capturing PayPal order: ${orderId}`, { orderId })

  try {
    const accessToken = await getPayPalAccessToken()

    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    const data = await captureRes.json()

    if (!captureRes.ok) {
      // Extract PayPal's specific issue so the client UI can show a useful message
      // instead of a generic "failed" that encourages retry loops.
      const issue = data?.details?.[0]?.issue || data?.name || "UNKNOWN"
      const description = data?.details?.[0]?.description || data?.message || ""

      // Map PayPal issues to user-friendly messages. The key ones we see in prod:
      //   TRANSACTION_REFUSED       — PayPal risk engine blocked this card
      //   INSTRUMENT_DECLINED       — card issuer declined
      //   PAYER_ACTION_REQUIRED     — 3DS/SCA challenge needed
      //   COMPLIANCE_VIOLATION      — something about payee/payer compliance
      //   PAYEE_ACCOUNT_RESTRICTED  — merchant account flagged
      let userMessage = "Payment could not be completed. Please try a different card or pay with Venmo."
      if (issue === "TRANSACTION_REFUSED" || issue === "INSTRUMENT_DECLINED") {
        userMessage = "Your card was declined by PayPal. Please try a different card or pay with Venmo."
      } else if (issue === "PAYER_ACTION_REQUIRED") {
        userMessage = "Your bank needs to verify this payment. Please try again and complete any verification step."
      } else if (issue === "PAYEE_ACCOUNT_RESTRICTED") {
        userMessage = "Card payments are temporarily unavailable. Please pay with Venmo, or try again shortly."
      }

      await debugLog(pg, "paypal_capture_error", null, `PayPal capture API failed: ${captureRes.status} — ${issue}`, { orderId, status: captureRes.status, issue, description, error: data }, { level: "error" })
      return res.status(422).json({
        error: `PayPal capture failed`,
        issue,
        description,
        userMessage,
        retryable: issue !== "TRANSACTION_REFUSED" && issue !== "PAYEE_ACCOUNT_RESTRICTED",
      })
    }

    // Check actual capture status (not just order status)
    const captures = data.purchase_units?.[0]?.payments?.captures || []
    const lastCapture = captures[captures.length - 1]
    const captureStatus = lastCapture?.status || "UNKNOWN"
    const isDeclined = captureStatus === "DECLINED" || captureStatus === "FAILED"

    if (isDeclined) {
      const reason = lastCapture?.status_details?.reason || "unknown"
      await debugLog(pg, "paypal_capture_declined", null, `DECLINED: ${orderId} — reason: ${reason}`, { orderId, captureStatus, reason }, { level: "error" })
    } else {
      await debugLog(pg, "paypal_capture_success", null, `Captured ${orderId} — status: ${captureStatus}`, { orderId, captureStatus, captureId: lastCapture?.id })
    }

    return res.json({
      id: data.id,
      status: isDeclined ? "DECLINED" : data.status,
      captureStatus,
      payer: data.payer,
    })
  } catch (err: any) {
    await debugLog(pg, "paypal_capture_error", null, `Error: ${err.message}`, { orderId, error: err.message }, { level: "error" })
    return res.status(500).json({ error: err.message })
  }
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  return res.status(204).send("")
}
