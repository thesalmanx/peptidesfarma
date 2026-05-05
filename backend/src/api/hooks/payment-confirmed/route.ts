import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Called by the external payment domain (vulaskin.com) after PayPal
 * payment succeeds. Captures the order payment in Medusa so the
 * payment-captured subscriber fires (sends email + syncs to Shippo).
 *
 * POST /hooks/payment-confirmed
 * Body: {
 *   order_id: string,          // Medusa order ID
 *   paypal_order_id: string,   // PayPal order/capture ID
 *   paypal_payer_email: string, // Payer's PayPal email
 *   amount: string,            // Amount paid
 *   secret: string,            // Webhook secret for auth
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")

  const { order_id, paypal_order_id, paypal_payer_email, amount, secret } = req.body as any

  // Auth check
  const expectedSecret = process.env.MEDUSA_WEBHOOK_SECRET
  if (!secret || secret !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (!order_id) {
    return res.status(400).json({ error: "order_id required" })
  }

  logger.info(`Payment confirmed: order=${order_id} paypal=${paypal_order_id} amount=${amount} payer=${paypal_payer_email}`)

  try {
    const query = req.scope.resolve("query")
    const orderModule = req.scope.resolve(Modules.ORDER)
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    // 1. Find the order and its payment
    const {
      data: [order],
    } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "metadata",
        "payment_collections.id",
        "payment_collections.payments.id",
        "payment_collections.payments.captured_at",
      ],
      filters: { id: order_id },
    })

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    const displayId = Number((order as any).display_id || 0) + 11000

    // 2. Update order metadata with PayPal info
    const existingMeta = (order as any)?.metadata || {}
    await (orderModule as any).updateOrders(order_id, {
      metadata: {
        ...existingMeta,
        paypal_order_id: paypal_order_id || "",
        paypal_payer_email: paypal_payer_email || "",
        paypal_amount: amount || "",
        paypal_confirmed_at: new Date().toISOString(),
        payment_method: "paypal",
      },
    })

    // 3. Capture the payment (triggers payment.captured subscriber → email + Shippo sync)
    const payments = (order as any).payment_collections
      ?.flatMap((pc: any) => pc.payments || []) || []

    const uncaptured = payments.find((p: any) => !p.captured_at)
    if (uncaptured) {
      try {
        // Use the payment module to capture
        const paymentModule = req.scope.resolve(Modules.PAYMENT)
        await (paymentModule as any).capturePayment({ payment_id: uncaptured.id })
        logger.info(`Payment confirmed: Captured payment ${uncaptured.id} for order #${displayId}`)
      } catch (captureErr: any) {
        // Try admin-style capture as fallback
        logger.warn(`Payment confirmed: Module capture failed (${captureErr.message}), trying direct capture`)
        try {
          await pgConnection.raw(
            `UPDATE payment SET captured_at = NOW() WHERE id = ? AND captured_at IS NULL`,
            [uncaptured.id]
          )
          await pgConnection.raw(
            `UPDATE payment_collection SET status = 'completed', captured_amount = authorized_amount WHERE id = ?`,
            [(order as any).payment_collections?.[0]?.id]
          )
          logger.info(`Payment confirmed: Direct capture for order #${displayId}`)
        } catch (directErr: any) {
          logger.error(`Payment confirmed: Direct capture also failed — ${directErr.message}`)
        }
      }
    } else {
      logger.info(`Payment confirmed: Payment already captured for order #${displayId}`)
    }

    return res.json({
      success: true,
      order_id,
      display_id: displayId,
      message: `Order #${displayId} payment confirmed`,
    })
  } catch (error: any) {
    logger.error(`Payment confirmed error: ${error.message}`)
    return res.status(500).json({ error: error.message })
  }
}
