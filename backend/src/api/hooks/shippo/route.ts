import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { getCarrierTrackingUrl } from "../../../utils/carrier-tracking-url"
import { createOrderFulfillmentWorkflow } from "@medusajs/medusa/core-flows"
import { syncTrackingToPayPal } from "../../../utils/paypal"

/**
 * Shippo webhook endpoint — lives OUTSIDE /store/ to avoid the
 * publishable-API-key requirement that Medusa enforces on store routes.
 *
 * Called when a label is purchased (transaction_created) or tracking updates.
 * Updates order metadata and creates a fulfillment so:
 *   1. The order shows "Fulfilled" in Medusa admin
 *   2. The shipment-created subscriber sends the shipping confirmation email
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")

  try {
    const body = req.body as any
    const event = body?.event
    const data = body?.data || {}

    logger.info(`Shippo webhook: event=${event}`)

    if (event === "transaction_created") {
      const trackingNumber = data.tracking_number
      const carrier = data.rate?.provider || data.carrier || ""
      const serviceName = data.rate?.servicelevel?.name || ""
      const labelUrl = data.label_url || ""

      // Extract order number from metadata or Shippo order
      const metadata = data.metadata || ""
      const orderNumberMatch = metadata.match(/#(\d+)/)
      const shippoOrderNumber = data.order?.order_number || ""
      const displayIdFromOrder = shippoOrderNumber.replace("#", "").trim()
      const displayId = orderNumberMatch?.[1] || displayIdFromOrder

      if (!displayId || !trackingNumber) {
        logger.warn(`Shippo webhook: Missing displayId (${displayId}) or tracking (${trackingNumber})`)
        return res.json({ received: true, action: "skipped" })
      }

      logger.info(`Shippo webhook: Label for order #${displayId} — ${carrier} ${serviceName} — tracking: ${trackingNumber}`)

      // Find Medusa order by display_id (try raw, then with offset)
      const query = req.scope.resolve("query")
      const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

      const parsedId = parseInt(displayId)
      let orderId: string | null = null

      const r1 = await pgConnection.raw(
        `SELECT id FROM "order" WHERE display_id = ? AND deleted_at IS NULL LIMIT 1`,
        [parsedId]
      )
      orderId = r1?.rows?.[0]?.id || null

      if (!orderId && parsedId - 11000 >= 0) {
        const r2 = await pgConnection.raw(
          `SELECT id FROM "order" WHERE display_id = ? AND deleted_at IS NULL LIMIT 1`,
          [parsedId - 11000]
        )
        orderId = r2?.rows?.[0]?.id || null
      }

      if (!orderId) {
        logger.warn(`Shippo webhook: Order #${displayId} not found`)
        return res.json({ received: true, action: "order_not_found" })
      }

      const trackingUrl = getCarrierTrackingUrl(trackingNumber, carrier)

      // ── 1. Update order metadata ──
      try {
        const orderModule = req.scope.resolve(Modules.ORDER)
        const {
          data: [existingOrder],
        } = await query.graph({
          entity: "order",
          fields: ["id", "metadata"],
          filters: { id: orderId },
        })
        const existingMeta = (existingOrder as any)?.metadata || {}

        await (orderModule as any).updateOrders(orderId, {
          metadata: {
            ...existingMeta,
            shippo_tracking_number: trackingNumber,
            shippo_label_url: labelUrl,
            shippo_carrier: carrier,
            shippo_service: serviceName,
            shippo_tracking_url: trackingUrl,
          },
        })
        logger.info(`Shippo webhook: Metadata updated for order #${displayId}`)
      } catch (metaErr: any) {
        logger.warn(`Shippo webhook: Metadata update failed — ${metaErr.message}`)
      }

      // ── 2. Create fulfillment via workflow ──
      // The Shippo provider is modified to detect existing_tracking_number in
      // the fulfillment data. When present, it skips the Shippo API call and
      // returns the existing tracking info (no label purchase).
      try {
        const {
          data: [order],
        } = await query.graph({
          entity: "order",
          fields: ["id", "items.id", "items.quantity"],
          filters: { id: orderId },
        })

        if (!order?.items?.length) {
          logger.warn(`Shippo webhook: No items on order #${displayId}`)
          return res.json({ received: true, action: "no_items" })
        }

        // Get a stock location
        let locationId: string | undefined
        try {
          const stockLocationModule = req.scope.resolve("stock_location")
          const [loc] = await (stockLocationModule as any).listStockLocations({}, { take: 1 })
          locationId = loc?.id
        } catch {
          // Stock location not required
        }

        const items = order.items.map((item: any) => ({
          id: item.id,
          quantity: Number(item.quantity) || 1,
        }))

        // The Shippo provider reads order.metadata.shippo_tracking_number
        // (set in step 1 above) and skips the Shippo API call — no label purchase.
        await createOrderFulfillmentWorkflow(req.scope).run({
          input: {
            order_id: orderId,
            items,
            location_id: locationId,
            labels: [
              {
                tracking_number: trackingNumber,
                tracking_url: trackingUrl,
                label_url: labelUrl,
              },
            ],
            no_notification: false,
          },
        })

        logger.info(`Shippo webhook: Fulfillment created for #${displayId} via workflow — no label purchased`)

        // Mark fulfillment as shipped (not just packed) so admin shows "fulfilled"
        try {
          await pgConnection.raw(
            `UPDATE fulfillment SET shipped_at = COALESCE(packed_at, NOW()), updated_at = NOW()
             WHERE id IN (
               SELECT f.id FROM fulfillment f
               JOIN order_fulfillment ofu ON ofu.fulfillment_id = f.id
               WHERE ofu.order_id = ? AND f.shipped_at IS NULL
             )`,
            [orderId]
          )
        } catch {}

        // Sync tracking to PayPal if this order was paid via PayPal
        const { data: [orderForMeta] } = await query.graph({ entity: "order", fields: ["id", "metadata"], filters: { id: orderId } })
        const paypalOrderId = (orderForMeta as any)?.metadata?.paypal_order_id
        if (paypalOrderId) {
          const ppResult = await syncTrackingToPayPal(paypalOrderId, trackingNumber, carrier, logger, pgConnection, orderId)
          logger.info(`Shippo webhook: PayPal tracking sync for #${displayId} — ${ppResult.reason}`)
        }
      } catch (fulfillErr: any) {
        logger.error(`Shippo webhook: Fulfillment failed — ${fulfillErr.message}`)
      }

      return res.json({ received: true, action: "processed", orderId, trackingNumber })
    }

    if (event === "track_updated") {
      logger.info(`Shippo webhook: Track update — ${data.tracking_number} status=${data.tracking_status?.status}`)
      return res.json({ received: true, action: "track_logged" })
    }

    return res.json({ received: true, action: "ignored" })
  } catch (error: any) {
    logger.error(`Shippo webhook error: ${error.message}`)
    return res.status(500).json({ error: "Webhook processing failed" })
  }
}
