import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { getCarrierTrackingUrl } from "../../../utils/carrier-tracking-url"

/**
 * One-time migration endpoint to fix all existing orders with incorrect
 * Shippo tracking URLs (track.goshippo.com → carrier-specific URLs).
 *
 * Also patches fulfillment labels stored in the database.
 *
 * Usage: POST /admin/fix-tracking-urls
 * Requires admin authentication.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")
  const query = req.scope.resolve("query")
  const orderModule = req.scope.resolve(Modules.ORDER)
  const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const results: {
    ordersUpdated: string[]
    labelsUpdated: string[]
    errors: string[]
  } = { ordersUpdated: [], labelsUpdated: [], errors: [] }

  try {
    // ── 1. Fix order metadata ──
    // Find all orders that have a shippo_tracking_number in metadata
    const orderRows = await pgConnection.raw(`
      SELECT id, display_id, metadata
      FROM "order"
      WHERE deleted_at IS NULL
        AND metadata IS NOT NULL
        AND metadata::text LIKE '%shippo_tracking_number%'
    `)

    const orders = orderRows?.rows || []
    logger.info(`fix-tracking-urls: Found ${orders.length} orders with Shippo tracking metadata`)

    for (const row of orders) {
      try {
        const meta = typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata
        const trackingNumber = meta?.shippo_tracking_number
        const carrier = meta?.shippo_carrier || meta?.shippo_shipping_provider || ""
        const currentUrl = meta?.shippo_tracking_url || ""

        if (!trackingNumber) continue

        const correctUrl = getCarrierTrackingUrl(trackingNumber, carrier)

        // Skip if already correct
        if (currentUrl === correctUrl) {
          logger.info(`fix-tracking-urls: Order ${row.display_id} already has correct URL, skipping`)
          continue
        }

        await (orderModule as any).updateOrders(row.id, {
          metadata: {
            ...meta,
            shippo_tracking_url: correctUrl,
          },
        })

        results.ordersUpdated.push(`#${Number(row.display_id) + 11000} (${trackingNumber}): ${currentUrl} → ${correctUrl}`)
        logger.info(`fix-tracking-urls: Fixed order #${Number(row.display_id) + 11000} — ${currentUrl} → ${correctUrl}`)
      } catch (err: any) {
        results.errors.push(`Order ${row.id}: ${err.message}`)
        logger.error(`fix-tracking-urls: Failed to update order ${row.id} — ${err.message}`)
      }
    }

    // ── 2. Fix fulfillment labels ──
    // Find all fulfillment labels with goshippo.com tracking URLs
    const labelRows = await pgConnection.raw(`
      SELECT fl.id, fl.tracking_number, fl.tracking_url, fl.fulfillment_id
      FROM fulfillment_label fl
      WHERE fl.deleted_at IS NULL
        AND fl.tracking_number IS NOT NULL
        AND fl.tracking_number != ''
        AND (fl.tracking_url LIKE '%track.goshippo.com%' OR fl.tracking_url IS NULL)
    `)

    const labels = labelRows?.rows || []
    logger.info(`fix-tracking-urls: Found ${labels.length} fulfillment labels to fix`)

    for (const label of labels) {
      try {
        // Look up the carrier from the order metadata via the fulfillment
        let carrier = ""
        try {
          const fulfillmentOrder = await pgConnection.raw(`
            SELECT o.metadata
            FROM "order" o
            JOIN order_fulfillment of2 ON of2.order_id = o.id
            WHERE of2.fulfillment_id = ?
            LIMIT 1
          `, [label.fulfillment_id])
          const orderMeta = fulfillmentOrder?.rows?.[0]?.metadata
          if (orderMeta) {
            const meta = typeof orderMeta === "string" ? JSON.parse(orderMeta) : orderMeta
            carrier = meta?.shippo_carrier || meta?.shippo_shipping_provider || ""
          }
        } catch {
          // If we can't find the carrier from metadata, heuristic will handle it
        }

        const correctUrl = getCarrierTrackingUrl(label.tracking_number, carrier)

        await pgConnection.raw(`
          UPDATE fulfillment_label
          SET tracking_url = ?
          WHERE id = ?
        `, [correctUrl, label.id])

        results.labelsUpdated.push(`${label.id} (${label.tracking_number}): ${label.tracking_url} → ${correctUrl}`)
        logger.info(`fix-tracking-urls: Fixed label ${label.id} — ${label.tracking_url} → ${correctUrl}`)
      } catch (err: any) {
        results.errors.push(`Label ${label.id}: ${err.message}`)
        logger.error(`fix-tracking-urls: Failed to update label ${label.id} — ${err.message}`)
      }
    }

    logger.info(`fix-tracking-urls: Done — ${results.ordersUpdated.length} orders, ${results.labelsUpdated.length} labels fixed, ${results.errors.length} errors`)

    return res.json({
      success: true,
      summary: {
        orders_fixed: results.ordersUpdated.length,
        labels_fixed: results.labelsUpdated.length,
        errors: results.errors.length,
      },
      details: results,
    })
  } catch (error: any) {
    logger.error(`fix-tracking-urls: Fatal error — ${error.message}`)
    return res.status(500).json({ error: error.message })
  }
}
