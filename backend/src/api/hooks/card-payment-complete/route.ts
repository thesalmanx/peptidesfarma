import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { completeCartWorkflowId } from "@medusajs/medusa/core-flows"
import { debugLog } from "../../../utils/debug-log"
import { refundPayPalOrderCapture } from "../../../utils/paypal"

/**
 * Refund the PayPal capture and log the orphan event.
 * Called when a PayPal capture succeeded but Medusa can't turn it into an order —
 * we refund the customer automatically so money never sits orphaned.
 */
async function autoRefundOrphanCapture(
  pgConnection: any,
  logger: any,
  cartId: string,
  paypalOrderId: string,
  reason: string,
  errorDetail: string
): Promise<{ refunded: boolean; refundId?: string; refundAmount?: string }> {
  if (!paypalOrderId) {
    logger.error(`Orphan capture recovery: no paypal_order_id for cart ${cartId} — cannot refund. Reason: ${errorDetail}`)
    debugLog(pgConnection, "orphan_capture_no_refund", cartId, `No paypal_order_id — manual recovery required: ${errorDetail}`, { cartId, errorDetail }, { level: "error" }).catch(() => {})
    return { refunded: false }
  }
  try {
    const { refundId, amount } = await refundPayPalOrderCapture(paypalOrderId, reason)
    logger.info(`Orphan capture recovery: refunded PayPal ${paypalOrderId} (refund ${refundId}, $${amount}) — reason: ${errorDetail}`)
    debugLog(pgConnection, "orphan_capture_refunded", cartId, `Auto-refunded $${amount} for ${paypalOrderId} — ${errorDetail}`, { cartId, paypalOrderId, refundId, amount, errorDetail }, { level: "error" }).catch(() => {})
    return { refunded: true, refundId, refundAmount: amount }
  } catch (refundErr: any) {
    logger.error(`Orphan capture recovery: refund failed for ${paypalOrderId} — ${refundErr.message}. MANUAL ACTION REQUIRED.`)
    debugLog(pgConnection, "orphan_capture_refund_failed", cartId, `Refund API failed: ${refundErr.message} — MANUAL ACTION`, { cartId, paypalOrderId, refundError: refundErr.message, errorDetail }, { level: "error" }).catch(() => {})
    return { refunded: false }
  }
}

/**
 * Called by summerteez.com AFTER PayPal payment succeeds.
 * Completes the Medusa cart (creates order) and captures payment.
 *
 * POST /hooks/card-payment-complete
 * Body: {
 *   cartData: string (base64 encoded JSON with cartId, form, selectedShippoRate, calculatedTotal),
 *   paypal_order_id: string,
 *   paypal_payer_email: string,
 *   amount: string,
 *   secret: string,
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // CORS for direct browser calls from summerteez
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type")

  const logger = req.scope.resolve("logger")

  const { cartData, paypal_order_id, paypal_payer_email, amount, secret } = req.body as any

  // Auth — allow if secret matches OR if request has a valid origin (browser direct call)
  const expectedSecret = process.env.MEDUSA_WEBHOOK_SECRET
  const origin = (req.headers as any)?.origin || ""
  const isBrowserCall = origin.includes("summerteez") || origin.includes("peptidesfarma") || origin.includes("localhost")
  if (!isBrowserCall && (!secret || secret !== expectedSecret)) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (!cartData) {
    return res.status(400).json({ error: "cartData required" })
  }

  let parsed: any
  try {
    parsed = JSON.parse(decodeURIComponent(atob(cartData)))
  } catch {
    return res.status(400).json({ error: "Invalid cartData" })
  }

  const { cartId, form, selectedShippoRate, calculatedTotal, preSetup, tax, taxRate, taxJurisdiction } = parsed

  if (!cartId) {
    return res.status(400).json({ error: "cartId missing from cartData" })
  }

  logger.info(`Card payment complete: cartId=${cartId} paypal=${paypal_order_id} amount=${amount}`)
  const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  // Fire-and-forget debug log (don't block the response)
  debugLog(pgConnection, "card_payment_complete", cartId, `Card payment webhook received`, { cartId, paypal_order_id, amount }).catch(() => {})

  try {
    // Idempotency check — direct SQL instead of HTTP roundtrip
    const cartCheck = await pgConnection.raw(
      `SELECT completed_at FROM cart WHERE id = ?`,
      [cartId]
    ).catch(() => null)

    if (cartCheck?.rows?.[0]?.completed_at) {
      // Cart already completed — find the order
      const orderResult = await pgConnection.raw(
        `SELECT o.id, o.display_id FROM "order" o
         LEFT JOIN order_cart oc ON oc.order_id = o.id
         WHERE oc.cart_id = ? OR o.metadata->>'cart_id' = ?
         LIMIT 1`,
        [cartId, cartId]
      ).catch(() => null)

      let existingOrder = orderResult?.rows?.[0]
      if (!existingOrder) {
        // Fallback: search by cart email
        const emailResult = await pgConnection.raw(
          `SELECT email FROM cart WHERE id = ?`, [cartId]
        ).catch(() => null)
        const cartEmail = emailResult?.rows?.[0]?.email
        if (cartEmail) {
          const fallback = await pgConnection.raw(
            `SELECT id, display_id FROM "order" WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
            [cartEmail]
          ).catch(() => null)
          existingOrder = fallback?.rows?.[0]
        }
      }

      if (existingOrder) {
        const displayId = Number(existingOrder.display_id || 0) + 11000
        logger.info(`Card payment complete: Cart already completed — returning existing order #${displayId}`)
        return res.json({
          success: true,
          orderId: existingOrder.id,
          orderDisplayId: existingOrder.display_id,
          orderNumber: String(displayId),
        })
      }
    }

    if (preSetup) {
      // Cart already has address + shipping + payment session from checkout page
      // Update metadata directly via SQL — no HTTP roundtrip
      await pgConnection.raw(
        `UPDATE cart SET metadata = COALESCE(metadata, '{}'::jsonb) || ?::jsonb WHERE id = ?`,
        [JSON.stringify({
          payment_method: "card",
          paypal_order_id: paypal_order_id || "",
          paypal_payer_email: paypal_payer_email || "",
          tax_amount: String(tax || 0),
          tax_rate: String(taxRate || 0),
          tax_jurisdiction: taxJurisdiction || "",
          customer_paid_total: String(calculatedTotal || 0),
        }), cartId]
      )
    } else {
      // Full setup — fallback for old flow or if pre-setup failed
      // This path still uses internal HTTP calls since it needs Medusa's full cart update logic
      const MEDUSA_URL = `http://localhost:${process.env.PORT || 9000}`
      const PUB_KEY = process.env.STORE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_aa4c9aac1587441afa25c09fbcb93daa230931e11f26161b1170a3a1f2ec41bc"

      const medusaStore = async (path: string, options: RequestInit = {}) => {
        const r = await fetch(`${MEDUSA_URL}${path}`, {
          ...options,
          headers: {
            "x-publishable-api-key": PUB_KEY,
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
        })
        const data = await r.json().catch(() => null)
        if (!r.ok) throw new Error(data?.message || `${path} failed (${r.status})`)
        return data
      }

      const [firstName, ...restName] = (form?.full_name || "").trim().split(" ")
      const lastName = restName.join(" ") || firstName
      const countryCode = (form?.country_code || "us").toLowerCase()

      await medusaStore(`/store/carts/${cartId}`, {
        method: "POST",
        body: JSON.stringify({
          email: form?.email,
          shipping_address: {
            first_name: firstName, last_name: lastName,
            address_1: form?.address_1, address_2: form?.address_2 || undefined,
            city: form?.city, province: form?.province,
            postal_code: form?.postal_code, country_code: countryCode,
            phone: form?.phone,
          },
          billing_address: {
            first_name: firstName, last_name: lastName,
            address_1: form?.address_1, address_2: form?.address_2 || undefined,
            city: form?.city, province: form?.province,
            postal_code: form?.postal_code, country_code: countryCode,
            phone: form?.phone,
          },
          metadata: {
            payment_method: "card",
            paypal_order_id: paypal_order_id || "",
            paypal_payer_email: paypal_payer_email || "",
            customer_paid_total: String(calculatedTotal),
            ...(selectedShippoRate ? {
              shippo_shipping_cost: selectedShippoRate.amount,
              shippo_shipping_provider: selectedShippoRate.provider,
              shippo_shipping_service: selectedShippoRate.service,
              shippo_shipping_estimated_days: selectedShippoRate.estimatedDays,
              shippo_shipping_free: selectedShippoRate.freeShipping,
              shippo_rate_id: selectedShippoRate.id,
            } : {}),
          },
        }),
      })

      // Step 2: Add shipping method
      const shipData = await medusaStore(`/store/shipping-options?cart_id=${cartId}`)
      const options = shipData?.shipping_options || []
      let shippingAdded = false
      for (const opt of [...options].sort((a: any, b: any) => (a.price_type === "calculated" ? 0 : 1) - (b.price_type === "calculated" ? 0 : 1))) {
        try {
          await medusaStore(`/store/carts/${cartId}/shipping-methods`, {
            method: "POST",
            body: JSON.stringify({ option_id: opt.id }),
          })
          shippingAdded = true
          break
        } catch {}
      }
      if (!shippingAdded) {
        return res.status(400).json({ error: "Unable to set up shipping" })
      }

      // Step 3: Init payment session
      const cartRes2 = await medusaStore(`/store/carts/${cartId}`)
      let pcId = cartRes2?.cart?.payment_collection?.id
      if (!pcId) {
        const pcRes = await medusaStore(`/store/payment-collections`, {
          method: "POST",
          body: JSON.stringify({ cart_id: cartId }),
        })
        pcId = pcRes?.payment_collection?.id
      }
      if (pcId) {
        await medusaStore(`/store/payment-collections/${pcId}/payment-sessions`, {
          method: "POST",
          body: JSON.stringify({ provider_id: "pp_system_default" }),
        })
      }
    } // end else (full setup)

    // Preflight: verify cart has what completeCartWorkflow needs (email, address,
    // shipping method, payment_collection). If anything is missing, refund PayPal
    // before we even try — the workflow will fail and leave money orphaned otherwise.
    // Medusa v2 schema: cart links to payment_collection via cart_payment_collection
    // junction table, not a direct foreign key. Don't silent-swallow errors — if the
    // query itself fails we must NOT auto-refund (otherwise every customer gets refunded).
    let preflightErr: any = null
    const preflight = await pgConnection.raw(
      `SELECT
         c.email,
         c.shipping_address_id,
         c.billing_address_id,
         (SELECT COUNT(*) FROM cart_shipping_method csm WHERE csm.cart_id = c.id) AS shipping_method_count,
         (SELECT COUNT(*) FROM cart_payment_collection cpc WHERE cpc.cart_id = c.id) AS payment_collection_count
       FROM cart c WHERE c.id = ?`,
      [cartId]
    ).catch((e: any) => { preflightErr = e; return null })
    const pf = preflight?.rows?.[0]
    const missing: string[] = []
    if (preflightErr) {
      // SQL itself broke — log loudly and SKIP preflight so the workflow handles validation.
      // Do NOT treat this as "cart missing" and trigger a refund.
      logger.error(`Card payment complete: preflight SQL failed, skipping preflight — ${preflightErr.message}`)
      debugLog(pgConnection, "preflight_sql_error", cartId, `Preflight SQL error: ${preflightErr.message}`, { cartId, error: preflightErr.message }, { level: "error" }).catch(() => {})
    } else if (!pf) {
      missing.push("cart")
    } else {
      if (!pf.email) missing.push("email")
      if (!pf.shipping_address_id) missing.push("shipping_address")
      if (Number(pf.shipping_method_count || 0) === 0) missing.push("shipping_method")
      if (Number(pf.payment_collection_count || 0) === 0) missing.push("payment_collection")
    }
    if (missing.length > 0) {
      const detail = `Cart not ready (missing: ${missing.join(", ")})`
      const refund = await autoRefundOrphanCapture(pgConnection, logger, cartId, paypal_order_id, "Your order could not be processed. Your payment has been refunded.", detail)
      return res.status(422).json({
        error: "ORDER_NOT_CREATED",
        message: refund.refunded
          ? "Your order could not be processed and your payment has been refunded. Please try again or contact support."
          : "Your order could not be processed. Please contact support immediately so we can refund you.",
        refunded: refund.refunded,
        refundId: refund.refundId,
        detail,
      })
    }

    // Complete cart using Medusa's workflow engine directly — no HTTP roundtrip
    const workflowEngine = req.scope.resolve(Modules.WORKFLOW_ENGINE)
    const { errors, result } = await (workflowEngine as any).run(completeCartWorkflowId, {
      input: { id: cartId },
      throwOnError: false,
    })

    if (errors?.[0]) {
      const error = errors[0].error
      const detail = error?.message || String(error)
      logger.error(`Card payment complete: Workflow error — ${detail}`)
      // Workflow failed AFTER PayPal captured — refund so customer isn't charged for nothing.
      const refund = await autoRefundOrphanCapture(pgConnection, logger, cartId, paypal_order_id, "Your order could not be processed. Your payment has been refunded.", detail)
      return res.status(422).json({
        error: "ORDER_NOT_CREATED",
        message: refund.refunded
          ? "Your order could not be processed and your payment has been refunded. Please try again or contact support."
          : "Your order could not be processed. Please contact support immediately so we can refund you.",
        refunded: refund.refunded,
        refundId: refund.refundId,
        detail,
      })
    }

    if (!result?.id) {
      const detail = "completeCartWorkflow returned no order id"
      const refund = await autoRefundOrphanCapture(pgConnection, logger, cartId, paypal_order_id, "Your order could not be processed. Your payment has been refunded.", detail)
      return res.status(422).json({
        error: "ORDER_NOT_CREATED",
        message: refund.refunded
          ? "Your order could not be processed and your payment has been refunded. Please try again or contact support."
          : "Your order could not be processed. Please contact support immediately so we can refund you.",
        refunded: refund.refunded,
        refundId: refund.refundId,
        detail,
      })
    }

    // Fetch the created order's display_id
    const orderQuery = await pgConnection.raw(
      `SELECT id, display_id FROM "order" WHERE id = ?`,
      [result.id]
    ).catch(() => null)

    const order = orderQuery?.rows?.[0]
    const displayId = Number(order?.display_id || 0) + 11000

    logger.info(`Card payment complete: Order #${displayId} created from cart ${cartId}`)

    // Fire-and-forget debug log
    debugLog(pgConnection, "card_payment_complete", result.id, `Order #${displayId} created from card payment`, { orderId: result.id, displayId, cartId }).catch(() => {})

    // Auto-capture is handled by the order-placed subscriber — no need to do it here

    return res.json({
      success: true,
      orderId: result.id,
      orderDisplayId: order?.display_id,
      orderNumber: String(displayId),
    })
  } catch (error: any) {
    logger.error(`Card payment complete error: ${error.message}`)
    debugLog(pgConnection, "card_payment_complete", cartId, `FAILED: ${error.message}`, { cartId, error: error.message }, { level: "error" }).catch(() => {})
    // Any unexpected throw AFTER PayPal captured → refund so customer money never orphans.
    const refund = await autoRefundOrphanCapture(pgConnection, logger, cartId, paypal_order_id, "Your order could not be processed. Your payment has been refunded.", error.message || "unexpected error")
    return res.status(500).json({
      error: "ORDER_NOT_CREATED",
      message: refund.refunded
        ? "Your order could not be processed and your payment has been refunded. Please try again or contact support."
        : "Your order could not be processed. Please contact support immediately so we can refund you.",
      refunded: refund.refunded,
      refundId: refund.refundId,
      detail: error.message,
    })
  }
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  return res.status(204).send("")
}
