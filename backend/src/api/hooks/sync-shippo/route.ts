import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { getCarrierTrackingUrl } from "../../../utils/carrier-tracking-url"
import { createOrderFulfillmentWorkflow } from "@medusajs/medusa/core-flows"
import { syncTrackingToPayPal } from "../../../utils/paypal"

/**
 * GET /admin/sync-shippo?hours=5
 *
 * Polls Shippo for recent transactions (label purchases) and syncs them
 * to Medusa orders. This handles the case where Shippo's transaction_created
 * webhook doesn't fire for batch label purchases from the dashboard.
 *
 * For each Shippo transaction:
 *   1. Finds the matching Medusa order via Shippo order → order_number
 *   2. Checks if the order already has a fulfillment with that tracking number
 *   3. If not, creates a fulfillment + sends shipping confirmation email
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")
  const query = req.scope.resolve("query")
  const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const hours = parseInt((req.query as any)?.hours || "6")
  const shippoApiKey = process.env.SHIPPO_API_KEY

  if (!shippoApiKey) {
    return res.status(400).json({ error: "SHIPPO_API_KEY not configured" })
  }

  logger.info(`Sync Shippo: Checking transactions from last ${hours} hours`)

  try {
    // Fetch recent Shippo transactions (label purchases)
    const txRes = await fetch(
      `https://api.goshippo.com/transactions/?results=50&ordering=-created`,
      { headers: { Authorization: `ShippoToken ${shippoApiKey}` } }
    )
    const txData = await txRes.json()
    const transactions = txData?.results || []

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    const recentTx = transactions.filter((t: any) => {
      const created = new Date(t.object_created)
      return created >= cutoff && t.status === "SUCCESS" && t.tracking_number
    })

    logger.info(`Sync Shippo: Found ${recentTx.length} transactions in last ${hours}h`)

    const results: any[] = []

    for (const tx of recentTx) {
      const trackingNumber = tx.tracking_number
      const carrier = tx.rate?.provider || tx.carrier || ""
      const serviceName = tx.rate?.servicelevel?.name || ""
      const labelUrl = tx.label_url || ""
      const shippoOrderId = tx.order

      // Skip if no Shippo order linked
      if (!shippoOrderId) {
        results.push({ tracking: trackingNumber, status: "skipped", reason: "no_shippo_order" })
        continue
      }

      // Get the Shippo order to find the order_number (which maps to Medusa display_id)
      let displayId: string | null = null
      try {
        const orderRes = await fetch(
          `https://api.goshippo.com/orders/${shippoOrderId}`,
          { headers: { Authorization: `ShippoToken ${shippoApiKey}` } }
        )
        const orderData = await orderRes.json()
        const orderNumber = orderData?.order_number || ""
        displayId = orderNumber.replace("#", "").trim()
      } catch {
        results.push({ tracking: trackingNumber, status: "skipped", reason: "shippo_order_fetch_failed" })
        continue
      }

      if (!displayId) {
        results.push({ tracking: trackingNumber, status: "skipped", reason: "no_order_number" })
        continue
      }

      // Find Medusa order by display_id
      const parsedId = parseInt(displayId)
      let orderId: string | null = null

      const r1 = await pgConnection.raw(
        `SELECT id FROM "order" WHERE display_id = ? AND deleted_at IS NULL LIMIT 1`,
        [parsedId]
      ).catch(() => null)
      orderId = r1?.rows?.[0]?.id || null

      if (!orderId && parsedId - 11000 >= 0) {
        const r2 = await pgConnection.raw(
          `SELECT id FROM "order" WHERE display_id = ? AND deleted_at IS NULL LIMIT 1`,
          [parsedId - 11000]
        ).catch(() => null)
        orderId = r2?.rows?.[0]?.id || null
      }

      if (!orderId) {
        results.push({ tracking: trackingNumber, orderNumber: displayId, status: "skipped", reason: "medusa_order_not_found" })
        continue
      }

      // Check if fulfillment already exists with this tracking number
      const existingFul = await pgConnection.raw(
        `SELECT fl.tracking_number FROM fulfillment_label fl
         JOIN order_fulfillment of2 ON of2.fulfillment_id = fl.fulfillment_id
         WHERE of2.order_id = ? AND fl.tracking_number = ?`,
        [orderId, trackingNumber]
      ).catch(() => null)

      if (existingFul?.rows?.length > 0) {
        // Fulfillment exists in Medusa — but check if PayPal tracking needs syncing
        try {
          const { data: [orderForPP] } = await query.graph({ entity: "order", fields: ["metadata"], filters: { id: orderId } })
          const ppOrderId = (orderForPP as any)?.metadata?.paypal_order_id
          const metaCarrier = (orderForPP as any)?.metadata?.shippo_shipping_provider || (orderForPP as any)?.metadata?.shippo_carrier || carrier
          logger.info(`Sync Shippo: #${displayId} already_synced — paypal_order_id=${ppOrderId || "NONE"} carrier=${metaCarrier}`)
          if (ppOrderId) {
            const ppResult = await syncTrackingToPayPal(ppOrderId, trackingNumber, metaCarrier, logger, pgConnection, orderId)
            logger.info(`Sync Shippo: PayPal sync for #${displayId} — ${ppResult.synced ? "OK" : ppResult.reason}`)
          }
        } catch (ppErr: any) {
          logger.warn(`Sync Shippo: PayPal sync error for #${displayId} — ${ppErr.message}`)
        }
        results.push({ tracking: trackingNumber, orderNumber: displayId, status: "already_synced" })
        continue
      }

      // Update order metadata
      const trackingUrl = getCarrierTrackingUrl(trackingNumber, carrier)
      try {
        const orderModule = req.scope.resolve(Modules.ORDER)
        const { data: [existingOrder] } = await query.graph({
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
      } catch (metaErr: any) {
        logger.warn(`Sync Shippo: Metadata update failed for #${displayId} — ${metaErr.message}`)
      }

      // Create fulfillment
      try {
        const { data: [order] } = await query.graph({
          entity: "order",
          fields: ["id", "items.id", "items.quantity"],
          filters: { id: orderId },
        })

        if (!order?.items?.length) {
          results.push({ tracking: trackingNumber, orderNumber: displayId, status: "error", reason: "no_items" })
          continue
        }

        let locationId: string | undefined
        try {
          const stockLocationModule = req.scope.resolve("stock_location")
          const [loc] = await (stockLocationModule as any).listStockLocations({}, { take: 1 })
          locationId = loc?.id
        } catch {}

        const items = order.items.map((item: any) => ({
          id: item.id,
          quantity: Number(item.quantity) || 1,
        }))

        await createOrderFulfillmentWorkflow(req.scope).run({
          input: {
            order_id: orderId,
            items,
            location_id: locationId,
            labels: [{
              tracking_number: trackingNumber,
              tracking_url: trackingUrl,
              label_url: labelUrl,
            }],
            no_notification: false,
          },
        })

        logger.info(`Sync Shippo: Fulfillment created for #${displayId} — ${carrier} ${trackingNumber}`)

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
        } catch (shipErr: any) {
          logger.warn(`Sync Shippo: Could not mark fulfillment as shipped for #${displayId} — ${shipErr.message}`)
        }

        // Sync tracking to PayPal if this order was paid via PayPal
        const { data: [orderMeta] } = await query.graph({ entity: "order", fields: ["metadata"], filters: { id: orderId } })
        const paypalOrderId = (orderMeta as any)?.metadata?.paypal_order_id
        if (paypalOrderId) {
          const ppResult = await syncTrackingToPayPal(paypalOrderId, trackingNumber, carrier, logger, pgConnection, orderId)
          logger.info(`Sync Shippo: PayPal tracking sync for #${displayId} — ${ppResult.reason}`)
        }

        results.push({ tracking: trackingNumber, orderNumber: displayId, status: "synced", carrier })
      } catch (fulErr: any) {
        logger.error(`Sync Shippo: Fulfillment failed for #${displayId} — ${fulErr.message}`)
        results.push({ tracking: trackingNumber, orderNumber: displayId, status: "error", reason: fulErr.message })
      }
    }

    const synced = results.filter(r => r.status === "synced").length
    const alreadySynced = results.filter(r => r.status === "already_synced").length
    const skipped = results.filter(r => r.status === "skipped").length
    const errors = results.filter(r => r.status === "error").length

    logger.info(`Sync Shippo: Done — ${synced} synced, ${alreadySynced} already done, ${skipped} skipped, ${errors} errors`)

    return res.json({
      summary: { total: recentTx.length, synced, alreadySynced, skipped, errors },
      results,
    })
  } catch (error: any) {
    logger.error(`Sync Shippo error: ${error.message}`)
    return res.status(500).json({ error: error.message })
  }
}
