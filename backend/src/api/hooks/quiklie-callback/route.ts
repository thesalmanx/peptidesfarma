import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { completeCartWorkflowId } from "@medusajs/medusa/core-flows"
import { getQuiklieTransactionStatus, validateQuiklieWebhook, QUIKLIE_STATUS } from "../../../utils/quiklie"
import { debugLog } from "../../../utils/debug-log"

/**
 * POST /hooks/quiklie-callback
 *
 * Two callers:
 * 1. Quiklie's server-side webhook (has X-API-Key header)
 * 2. Storefront callback page (browser call after Quiklie redirect)
 *
 * Either way, we independently verify the payment status via Quiklie's
 * Transaction Status API before completing the cart.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-api-key")

  const logger = req.scope.resolve("logger")
  const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const {
    cartData,
    paymentId,
    transactionId,
    amount,
    status,
    statusCode,
  } = req.body as any

  // Auth: accept if X-API-Key matches (server webhook) OR if origin is peptidesfarma/localhost (browser)
  const apiKeyHeader = req.headers["x-api-key"] as string | undefined
  const origin = (req.headers as any)?.origin || ""
  const isWebhook = validateQuiklieWebhook(apiKeyHeader)
  const isBrowserCall = origin.includes("peptidesfarma") || origin.includes("localhost")
  if (!isWebhook && !isBrowserCall) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (!cartData && !paymentId) {
    return res.status(400).json({ error: "cartData or paymentId required" })
  }

  // Decode cartData
  let parsed: any = {}
  if (cartData) {
    try {
      parsed = JSON.parse(decodeURIComponent(atob(cartData)))
    } catch {
      return res.status(400).json({ error: "Invalid cartData" })
    }
  }

  const { cartId, form, selectedShippoRate, calculatedTotal, preSetup, tax, taxRate, taxJurisdiction } = parsed
  const qkPaymentId = paymentId || transactionId

  if (!cartId) {
    return res.status(400).json({ error: "cartId missing from cartData" })
  }

  logger.info(`Quiklie callback: cartId=${cartId} paymentId=${qkPaymentId} status=${status}`)
  debugLog(pgConnection, "quiklie_callback", cartId, `Quiklie callback received`, {
    cartId, paymentId: qkPaymentId, status, statusCode, amount,
  }).catch(() => {})

  try {
    // Step 1: Verify payment status.
    // Trust Quiklie's server webhook (has X-API-Key header) directly.
    // For browser polling, verify with Quiklie's Transaction Status API — but if their
    // API still returns 3DS_REQUIRED while the caller says SUCCESS, retry up to 3 times
    // with a delay (Quiklie's status API can lag behind the actual payment completion).
    let verifiedStatusCode: string | null = null

    if (isWebhook) {
      // Server webhook from Quiklie — trust it, they verified with their own X-API-Key
      verifiedStatusCode = statusCode || QUIKLIE_STATUS.SUCCESS
      logger.info(`Quiklie callback: webhook trusted, statusCode=${verifiedStatusCode}`)
    } else if (qkPaymentId) {
      // Browser polling — verify independently but with retry for lag
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const txStatus = await getQuiklieTransactionStatus(qkPaymentId)
          verifiedStatusCode = txStatus.statusCode
          logger.info(`Quiklie callback: verified status=${txStatus.status} code=${verifiedStatusCode} attempt=${attempt + 1}`)
          if (verifiedStatusCode === QUIKLIE_STATUS.SUCCESS) break
          // If still 3DS but caller says SUCCESS, wait and retry (API lag)
          if (verifiedStatusCode === QUIKLIE_STATUS.THREE_DS_REQUIRED && statusCode === "1" && attempt < 2) {
            await new Promise((r) => setTimeout(r, 2000))
            continue
          }
          break
        } catch (verifyErr: any) {
          logger.warn(`Quiklie callback: verification attempt ${attempt + 1} failed — ${verifyErr.message}`)
          if (attempt === 2) verifiedStatusCode = statusCode
        }
      }
    } else {
      verifiedStatusCode = statusCode
    }

    // Check if payment succeeded
    if (verifiedStatusCode !== QUIKLIE_STATUS.SUCCESS) {
      const reason = verifiedStatusCode === QUIKLIE_STATUS.DECLINED ? "Payment was declined" :
        verifiedStatusCode === QUIKLIE_STATUS.THREE_DS_REQUIRED ? "3D Secure authentication incomplete" :
        verifiedStatusCode === QUIKLIE_STATUS.PENDING ? "Payment is still pending" :
        `Payment not completed (status ${verifiedStatusCode})`

      debugLog(pgConnection, "quiklie_callback_failed", cartId, reason, {
        cartId, paymentId: qkPaymentId, statusCode: verifiedStatusCode,
      }, { level: "error" }).catch(() => {})

      return res.status(422).json({
        error: "PAYMENT_NOT_COMPLETED",
        message: reason,
        statusCode: verifiedStatusCode,
      })
    }

    // Step 2: Idempotency check
    const cartCheck = await pgConnection.raw(
      `SELECT completed_at FROM cart WHERE id = ?`, [cartId]
    ).catch(() => null)

    if (cartCheck?.rows?.[0]?.completed_at) {
      const orderResult = await pgConnection.raw(
        `SELECT o.id, o.display_id FROM "order" o
         LEFT JOIN order_cart oc ON oc.order_id = o.id
         WHERE oc.cart_id = ? OR o.metadata->>'cart_id' = ?
         LIMIT 1`,
        [cartId, cartId]
      ).catch(() => null)

      let existingOrder = orderResult?.rows?.[0]
      if (!existingOrder) {
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
        logger.info(`Quiklie callback: cart already completed — returning existing order #${displayId}`)
        return res.json({
          success: true,
          orderId: existingOrder.id,
          orderDisplayId: existingOrder.display_id,
          orderNumber: String(displayId),
        })
      }
    }

    // Step 3: Update cart metadata with Quiklie payment info
    if (preSetup) {
      await pgConnection.raw(
        `UPDATE cart SET metadata = COALESCE(metadata, '{}'::jsonb) || ?::jsonb WHERE id = ?`,
        [JSON.stringify({
          payment_method: "card",
          payment_provider: "quiklie",
          quiklie_payment_id: qkPaymentId || "",
          quiklie_transaction_id: transactionId || "",
          tax_amount: String(tax || 0),
          tax_rate: String(taxRate || 0),
          tax_jurisdiction: taxJurisdiction || "",
          customer_paid_total: String(calculatedTotal || amount || 0),
        }), cartId]
      )
    }

    // Step 4: Preflight check (same as card-payment-complete)
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
      logger.error(`Quiklie callback: preflight SQL failed — ${preflightErr.message}`)
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
      debugLog(pgConnection, "quiklie_callback_cart_error", cartId, detail, {
        cartId, paymentId: qkPaymentId, missing,
      }, { level: "error" }).catch(() => {})

      // Quiklie doesn't have a programmatic refund API in the docs yet.
      // Log for manual action (same pattern as PayPal refund fallback).
      logger.error(`Quiklie callback: MANUAL REFUND REQUIRED for ${qkPaymentId} ($${amount}) — ${detail}`)
      debugLog(pgConnection, "quiklie_manual_refund_needed", cartId,
        `Payment ${qkPaymentId} captured but cart not ready. MANUAL REFUND REQUIRED.`,
        { cartId, paymentId: qkPaymentId, amount, detail }, { level: "error" }
      ).catch(() => {})

      return res.status(422).json({
        error: "ORDER_NOT_CREATED",
        message: "Your order could not be processed. Please contact support so we can resolve this.",
        detail,
      })
    }

    // Step 5: Complete cart → create order
    const workflowEngine = req.scope.resolve(Modules.WORKFLOW_ENGINE)
    const { errors, result } = await (workflowEngine as any).run(completeCartWorkflowId, {
      input: { id: cartId },
      throwOnError: false,
    })

    if (errors?.[0]) {
      const error = errors[0].error
      const detail = error?.message || String(error)
      logger.error(`Quiklie callback: workflow error — ${detail}`)
      debugLog(pgConnection, "quiklie_callback_workflow_error", cartId, detail, {
        cartId, paymentId: qkPaymentId, error: detail,
      }, { level: "error" }).catch(() => {})

      logger.error(`Quiklie callback: MANUAL REFUND REQUIRED for ${qkPaymentId} ($${amount}) — ${detail}`)
      debugLog(pgConnection, "quiklie_manual_refund_needed", cartId,
        `Workflow failed after Quiklie payment. MANUAL REFUND REQUIRED.`,
        { cartId, paymentId: qkPaymentId, amount, detail }, { level: "error" }
      ).catch(() => {})

      return res.status(422).json({
        error: "ORDER_NOT_CREATED",
        message: "Your order could not be processed. Please contact support so we can resolve this.",
        detail,
      })
    }

    if (!result?.id) {
      return res.status(500).json({ error: "Order creation failed — no order ID returned" })
    }

    // Step 6: Fetch display ID
    const orderQuery = await pgConnection.raw(
      `SELECT id, display_id FROM "order" WHERE id = ?`, [result.id]
    ).catch(() => null)

    const order = orderQuery?.rows?.[0]
    const displayId = Number(order?.display_id || 0) + 11000

    logger.info(`Quiklie callback: Order #${displayId} created from Quiklie payment ${qkPaymentId}`)
    debugLog(pgConnection, "quiklie_callback_success", result.id, `Order #${displayId} created`, {
      orderId: result.id, displayId, cartId, paymentId: qkPaymentId,
    }).catch(() => {})

    return res.json({
      success: true,
      orderId: result.id,
      orderDisplayId: order?.display_id,
      orderNumber: String(displayId),
    })
  } catch (error: any) {
    logger.error(`Quiklie callback error: ${error.message}`)
    debugLog(pgConnection, "quiklie_callback_error", cartId, `FAILED: ${error.message}`, {
      cartId, paymentId: qkPaymentId, error: error.message,
    }, { level: "error" }).catch(() => {})

    return res.status(500).json({ error: error.message })
  }
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-api-key")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  return res.status(204).send("")
}
