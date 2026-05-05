import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /hooks/cleanup-reservations
 *
 * Releases inventory reservations for orders that have already been fulfilled.
 * Medusa creates reservations when an order is placed but doesn't always
 * release them when the order is fulfilled/shipped. This cron cleans those up
 * so inventory isn't permanently locked.
 *
 * Called by the same cron that runs sync-shippo (every 10 min on DO).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")
  const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  try {
    // Release reservations for orders that have at least one fulfillment
    const result = await pgConnection.raw(`
      UPDATE reservation_item
      SET deleted_at = NOW()
      WHERE id IN (
        SELECT DISTINCT r.id
        FROM reservation_item r
        JOIN order_item oi ON oi.item_id = r.line_item_id
        JOIN "order" o ON o.id = oi.order_id
        JOIN order_fulfillment f ON f.order_id = o.id
        WHERE r.deleted_at IS NULL
      )
    `)

    const released = result?.rowCount || 0

    if (released > 0) {
      logger.info(`Cleanup reservations: Released ${released} reservations for fulfilled orders`)
    }

    return res.json({ released })
  } catch (error: any) {
    logger.error(`Cleanup reservations error: ${error.message}`)
    return res.status(500).json({ error: error.message })
  }
}
