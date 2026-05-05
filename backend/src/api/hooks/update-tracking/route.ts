import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Update tracking on an order — both metadata AND fulfillment labels.
 * POST /hooks/update-tracking
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")
  const { order_id, tracking_number, tracking_url, secret } = req.body as any

  const expectedSecret = process.env.MEDUSA_WEBHOOK_SECRET
  if (!secret || secret !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (!order_id) {
    return res.status(400).json({ error: "order_id required" })
  }

  try {
    const query = req.scope.resolve("query")
    const orderModule = req.scope.resolve(Modules.ORDER)
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    // 1. Get order with metadata
    const {
      data: [order],
    } = await query.graph({
      entity: "order",
      fields: ["id", "metadata", "fulfillments.id", "fulfillments.labels.id"],
      filters: { id: order_id },
    })

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    // 2. Update order metadata
    const existingMeta = (order as any)?.metadata || {}
    await (orderModule as any).updateOrders(order_id, {
      metadata: {
        ...existingMeta,
        shippo_tracking_number: tracking_number || "",
        shippo_tracking_url: tracking_url || "",
      },
    })
    logger.info(`Update tracking: Metadata updated for ${order_id}`)

    // 3. Update ALL fulfillment labels on this order
    const fulfillments = (order as any)?.fulfillments || []
    let labelsUpdated = 0
    for (const ful of fulfillments) {
      const labels = ful.labels || []
      for (const label of labels) {
        try {
          await pgConnection.raw(
            `UPDATE fulfillment_label SET tracking_number = ?, tracking_url = ?, updated_at = NOW() WHERE id = ?`,
            [tracking_number || "", tracking_url || "", label.id]
          )
          labelsUpdated++
        } catch (e: any) {
          logger.warn(`Update tracking: Failed to update label ${label.id} — ${e.message}`)
        }
      }
    }
    logger.info(`Update tracking: ${labelsUpdated} label(s) updated for ${order_id}`)

    return res.json({ success: true, labelsUpdated })
  } catch (error: any) {
    logger.error(`Update tracking failed: ${error.message}`)
    return res.status(500).json({ error: error.message })
  }
}
