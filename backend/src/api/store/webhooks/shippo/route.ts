import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { getCarrierTrackingUrl } from "../../../../utils/carrier-tracking-url"

/**
 * Shippo webhook endpoint.
 * Called when a label is purchased (transaction_created) or tracking updates.
 * Creates a fulfillment in Medusa with the tracking number so:
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

    // We care about transaction_created (label purchased) and track_updated
    if (event === "transaction_created") {
      const trackingNumber = data.tracking_number
      const carrier = data.rate?.provider || data.carrier || ""
      const serviceName = data.rate?.servicelevel?.name || ""
      const labelUrl = data.label_url || ""

      // Extract order number from metadata or Shippo order
      // Shippo transaction metadata format: "Order #XXXXX | order_id"
      const metadata = data.metadata || ""
      const orderNumberMatch = metadata.match(/#(\d+)/)

      // Also try to get from the Shippo order linked to this transaction
      const shippoOrderNumber = data.order?.order_number || ""
      const displayIdFromOrder = shippoOrderNumber.replace("#", "").trim()

      const displayId = orderNumberMatch?.[1] || displayIdFromOrder

      if (!displayId || !trackingNumber) {
        logger.warn(`Shippo webhook: Missing displayId (${displayId}) or tracking (${trackingNumber})`)
        return res.json({ received: true, action: "skipped" })
      }

      logger.info(`Shippo webhook: Label purchased for order #${displayId} — ${carrier} ${serviceName} — tracking: ${trackingNumber}`)

      // Find the Medusa order by display_id
      const query = req.scope.resolve("query")
      const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

      // Try the raw displayId first (in case it's already a Medusa display_id)
      const parsedId = parseInt(displayId)
      const orderResult = await pgConnection.raw(
        `SELECT id FROM "order" WHERE display_id = ? AND deleted_at IS NULL LIMIT 1`,
        [parsedId]
      )

      // Try both with and without offset
      let orderId: string | null = orderResult?.rows?.[0]?.id || null
      if (!orderId && parsedId - 11000 >= 0) {
        // Try with the display_id offset (customer-facing = Medusa display_id + 11000)
        const altResult = await pgConnection.raw(
          `SELECT id FROM "order" WHERE display_id = ? AND deleted_at IS NULL LIMIT 1`,
          [parsedId - 11000]
        )
        orderId = altResult?.rows?.[0]?.id || null
      }

      if (!orderId) {
        logger.warn(`Shippo webhook: Order #${displayId} not found in Medusa`)
        return res.json({ received: true, action: "order_not_found" })
      }

      // Update order metadata with tracking info (merge with existing metadata)
      try {
        const orderModule = req.scope.resolve(Modules.ORDER)

        // Fetch existing metadata to avoid overwriting
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
            shippo_tracking_url: getCarrierTrackingUrl(trackingNumber, carrier),
          },
        })
        logger.info(`Shippo webhook: Order #${displayId} metadata updated with tracking`)
      } catch (metaErr: any) {
        logger.warn(`Shippo webhook: Failed to update metadata — ${metaErr.message}`)
      }

      // Create fulfillment in Medusa (triggers shipment-created subscriber → email)
      try {
        const orderModule = req.scope.resolve(Modules.ORDER)
        const fulfillmentModule = req.scope.resolve(Modules.FULFILLMENT)

        // Get order items for fulfillment
        const {
          data: [order],
        } = await query.graph({
          entity: "order",
          fields: ["id", "items.id", "items.quantity"],
          filters: { id: orderId },
        })

        if (order?.items?.length) {
          // Create fulfillment with all order items
          const items = order.items.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
          }))

          await (orderModule as any).createFulfillment({
            order_id: orderId,
            items,
            labels: [
              {
                tracking_number: trackingNumber,
                tracking_url: getCarrierTrackingUrl(trackingNumber, carrier),
                label_url: labelUrl,
              },
            ],
          })

          logger.info(`Shippo webhook: Fulfillment created for order #${displayId} — email will be sent`)
        }
      } catch (fulfillErr: any) {
        // Fulfillment creation might fail if order doesn't support it yet
        // Still ok — metadata is updated
        logger.warn(`Shippo webhook: Could not create fulfillment — ${fulfillErr.message}`)
      }

      return res.json({ received: true, action: "processed", orderId, trackingNumber })
    }

    // track_updated — could update metadata with latest tracking status
    if (event === "track_updated") {
      logger.info(`Shippo webhook: Track updated — ${data.tracking_number} status=${data.tracking_status?.status}`)
      return res.json({ received: true, action: "track_logged" })
    }

    return res.json({ received: true, action: "ignored" })
  } catch (error: any) {
    logger.error(`Shippo webhook error: ${error.message}`)
    return res.status(500).json({ error: "Webhook processing failed" })
  }
}
