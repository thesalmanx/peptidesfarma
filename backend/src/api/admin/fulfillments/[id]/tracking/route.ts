import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Update tracking info on a fulfillment's labels.
 * POST /admin/fulfillments/:id/tracking
 * Body: { tracking_number, tracking_url, label_url }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")
  const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const fulfillmentId = req.params.id

  const { tracking_number, tracking_url, label_url } = req.body as any

  if (!fulfillmentId) {
    return res.status(400).json({ error: "Fulfillment ID required" })
  }

  try {
    // Update all labels on this fulfillment
    const updates: string[] = []
    const values: any[] = []
    let paramIdx = 1

    if (tracking_number !== undefined) {
      updates.push(`tracking_number = $${paramIdx++}`)
      values.push(tracking_number)
    }
    if (tracking_url !== undefined) {
      updates.push(`tracking_url = $${paramIdx++}`)
      values.push(tracking_url)
    }
    if (label_url !== undefined) {
      updates.push(`label_url = $${paramIdx++}`)
      values.push(label_url)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" })
    }

    values.push(fulfillmentId)
    const result = await pgConnection.raw(
      `UPDATE fulfillment_label SET ${updates.join(", ")} WHERE fulfillment_id = $${paramIdx} AND deleted_at IS NULL`,
      values
    )

    const rowsUpdated = result?.rowCount || 0

    // If no labels exist, create one
    if (rowsUpdated === 0 && tracking_number) {
      await pgConnection.raw(
        `INSERT INTO fulfillment_label (id, tracking_number, tracking_url, label_url, fulfillment_id, created_at, updated_at)
         VALUES (CONCAT('flabel_', REPLACE(gen_random_uuid()::text, '-', '')), $1, $2, $3, $4, NOW(), NOW())`,
        [tracking_number, tracking_url || "", label_url || "", fulfillmentId]
      )
      logger.info(`Admin: Created new label for fulfillment ${fulfillmentId}`)
    } else {
      logger.info(`Admin: Updated ${rowsUpdated} label(s) on fulfillment ${fulfillmentId}`)
    }

    // Also update order metadata if this fulfillment is linked to an order
    try {
      const orderResult = await pgConnection.raw(
        `SELECT o.id, o.metadata FROM "order" o
         JOIN order_fulfillment of2 ON of2.order_id = o.id
         WHERE of2.fulfillment_id = $1 LIMIT 1`,
        [fulfillmentId]
      )
      const order = orderResult?.rows?.[0]
      if (order && tracking_number) {
        const meta = typeof order.metadata === "string" ? JSON.parse(order.metadata) : (order.metadata || {})
        const newMeta = {
          ...meta,
          shippo_tracking_number: tracking_number,
          ...(tracking_url ? { shippo_tracking_url: tracking_url } : {}),
        }
        await pgConnection.raw(
          `UPDATE "order" SET metadata = $1 WHERE id = $2`,
          [JSON.stringify(newMeta), order.id]
        )
      }
    } catch {
      // Non-critical — label is updated regardless
    }

    return res.json({ success: true, updated: Math.max(rowsUpdated, 1) })
  } catch (error: any) {
    logger.error(`Admin: Failed to update fulfillment tracking — ${error.message}`)
    return res.status(500).json({ error: error.message })
  }
}
