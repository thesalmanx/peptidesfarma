import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { render } from "@react-email/render"
import OrderConfirmation from "../email-templates/order-confirmation"
import { debugLog } from "../utils/debug-log"

const ADMIN_EMAIL = "salman@neuroscript.co"
const ADMIN_CC = "salman@neuroscript.co"

/**
 * payment.captured fires when admin manually captures payment (Venmo)
 * OR when auto-capture runs (Stripe). For Stripe orders, order-placed
 * already sent confirmation + synced Shippo, so we skip. For Venmo
 * orders, this is where we send the order confirmation + sync Shippo.
 */
export default async function paymentCapturedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const logger = container.resolve("logger")
  const pgConnection = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const paymentId = data.id
  logger.info(`Payment captured: Processing payment ${paymentId}`)
  await debugLog(pgConnection, "payment_captured", null, `Processing payment ${paymentId}`, { paymentId })

  // Resolve order ID from payment via SQL
  let orderId: string | null = null
  try {
    const result = await pgConnection.raw(`
      SELECT o.id as order_id
      FROM payment p
      JOIN payment_collection pc ON pc.id = p.payment_collection_id
      JOIN order_payment_collection opc ON opc.payment_collection_id = pc.id
      JOIN "order" o ON o.id = opc.order_id
      WHERE p.id = ?
      LIMIT 1
    `, [paymentId])
    orderId = result?.rows?.[0]?.order_id || null
  } catch (err: any) {
    logger.warn(`Payment captured: SQL lookup failed for payment ${paymentId}: ${err.message}`)
  }

  if (!orderId) {
    orderId = paymentId
    logger.warn(`Payment captured: Using payment ID as order ID fallback: ${paymentId}`)
  } else {
    logger.info(`Payment captured: Resolved order ${orderId} from payment ${paymentId}`)
  }

  // Fetch the full order
  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "id", "display_id", "email", "total", "subtotal",
      "shipping_total", "tax_total", "discount_total",
      "currency_code", "created_at",
      "items.*", "items.thumbnail", "items.adjustments.*",
      "shipping_address.*", "metadata",
    ],
    filters: { id: orderId },
  })

  if (!order?.email) {
    logger.warn(`Payment captured: Could not find order for payment ${paymentId}`)
    return
  }

  const meta = (order as any).metadata || {}

  // ── Check if this is a card payment (Stripe/Square) ──
  // If so, order-placed already sent confirmation + synced Shippo → skip
  const isCardPayment = !!meta.stripe_checkout_session_id
    || !!meta.stripe_payment_intent_id
    || !!meta.square_payment_id

  if (isCardPayment) {
    logger.info(`Payment captured: Card payment for order — confirmation already sent by order.placed`)
    await debugLog(pgConnection, "payment_captured", orderId, "Skipped — card payment, already handled by order.placed", { paymentId, paymentMethod: "card" })
    return
  }

  // ── Venmo/manual order — pp_system_default auto-captures on cart.complete ──
  // Always sync to Shippo (idempotent — checks metadata to avoid duplicates).
  // Only send confirmation email if this is a genuine manual capture (>10s after creation).
  // Auto-capture (<10s) = Venmo instructions already sent by order.placed, skip email only.
  const orderCreatedAt = order.created_at ? new Date(order.created_at).getTime() : 0
  const timeSinceCreation = Date.now() - orderCreatedAt
  const isAutoCapture = timeSinceCreation < 10_000
  const alreadySyncedToShippo = !!meta.shippo_order_id

  await debugLog(pgConnection, "payment_captured", orderId, `Venmo capture — auto=${isAutoCapture} (${Math.round(timeSinceCreation / 1000)}s), shippoSynced=${alreadySyncedToShippo}`, { paymentId, email: order.email, displayId: order.display_id, isAutoCapture, alreadySyncedToShippo })

  const ORDER_NUMBER_OFFSET = 11000
  const displayId = String(Number(order.display_id || 0) + ORDER_NUMBER_OFFSET)
  const currency = (order.currency_code || "USD").toUpperCase()
  const storefrontUrl = process.env.STOREFRONT_URL || "https://www.peptidesfarma.com"
  const fromEmail = `Peptidesfarma <${process.env.RESEND_ORDER_FROM_EMAIL || "support@peptidesfarma.com"}>`

  const toNum = (v: any): number => {
    if (v == null) return 0
    if (typeof v === "object" && v.value != null) return Number(v.value)
    return Number(v) || 0
  }
  const formatPrice = (value: any): string => {
    const num = toNum(value)
    return isNaN(num) ? "0.00" : num.toFixed(2)
  }

  const addr = (order.shipping_address || {}) as any
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  const shippoShipping = meta.shippo_shipping_cost != null ? Number(meta.shippo_shipping_cost) : 0
  const medusaShipping = toNum(order.shipping_total)
  const shippingForDisplay = shippoShipping > 0 ? shippoShipping.toFixed(2) : formatPrice(order.shipping_total)
  const taxAmount = meta.tax_amount != null ? Number(meta.tax_amount) : toNum(order.tax_total)
  const taxForDisplay = taxAmount > 0 ? taxAmount.toFixed(2) : formatPrice(order.tax_total)
  const customerPaidTotal = meta.customer_paid_total != null ? Number(meta.customer_paid_total) : 0
  const actualTotal = customerPaidTotal > 0
    ? customerPaidTotal.toFixed(2)
    : (toNum(order.total) + taxAmount + (shippoShipping > medusaShipping ? shippoShipping - medusaShipping : 0)).toFixed(2)

  const formattedItems = (order.items || []).map((item: any) => {
    const unitPrice = toNum(item.unit_price)
    const qty = toNum(item.quantity) || 1
    return {
      title: String(item.title || ""),
      variant_title: item.variant_title ? String(item.variant_title) : undefined,
      quantity: qty,
      unit_price: unitPrice.toFixed(2),
      line_total: (unitPrice * qty).toFixed(2),
      thumbnail: item.thumbnail ? String(item.thumbnail) : undefined,
    }
  })

  const discountCode = (() => {
    for (const item of order.items || []) {
      for (const adj of (item as any).adjustments || []) {
        if (adj.code) return adj.code
      }
    }
    return null
  })()
  const discountTotal = toNum(order.discount_total)

  // ── Send order confirmation email (only on genuine manual capture, not auto) ──
  if (!isAutoCapture) {
    const notificationService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
    try {
      const customerHtml = await render(
        OrderConfirmation({
          displayId,
          orderDate,
          email: order.email,
          items: formattedItems,
          subtotal: formatPrice(order.subtotal),
          shippingTotal: shippingForDisplay,
          taxTotal: taxForDisplay,
          discountTotal: discountTotal > 0 ? discountTotal.toFixed(2) : undefined,
          discountCode: discountCode || undefined,
          total: actualTotal,
          currency,
          shippingAddress: addr.address_1
            ? {
                first_name: addr.first_name || "",
                last_name: addr.last_name || "",
                address_1: addr.address_1,
                address_2: addr.address_2 || "",
                city: addr.city || "",
                province: addr.province || "",
                postal_code: addr.postal_code || "",
                country_code: addr.country_code || "",
                phone: addr.phone || "",
              }
            : undefined,
          shippingMethod: meta.shippo_shipping_provider && meta.shippo_shipping_service
            ? `${meta.shippo_shipping_provider} ${meta.shippo_shipping_service}`
            : meta.shippo_shipping_service || undefined,
          shippingEstimate: meta.shippo_shipping_estimated_days
            ? `Est. ${meta.shippo_shipping_estimated_days} business days`
            : undefined,
          storefrontUrl,
        })
      )

      await notificationService.createNotifications({
        to: order.email,
        from: fromEmail,
        channel: "email",
        template: "order-confirmation",
        content: {
          subject: `Order Confirmed (#${displayId})`,
          html: customerHtml,
        },
        resource_id: order.id,
        resource_type: "order",
      })

      logger.info(`Payment captured: Order #${displayId} confirmation email sent to ${order.email}`)
      await debugLog(pgConnection, "confirmation_email", orderId, `Confirmation email sent to ${order.email}`)
    } catch (error: any) {
      logger.error(`Payment captured: Failed to send confirmation email for order #${displayId} — ${error.message}`)
      await debugLog(pgConnection, "confirmation_email", orderId, `FAILED: ${error.message}`, {}, { level: "error" })
    }
  } else {
    logger.info(`Payment captured: Auto-capture for #${displayId} — skipping confirmation email (Venmo instructions already sent by order.placed)`)
    await debugLog(pgConnection, "payment_captured", orderId, `Auto-capture — skipping confirmation email`, { timeSinceCreation })
  }

  // ── Sync order to Shippo (always, unless already synced) ──
  if (alreadySyncedToShippo) {
    logger.info(`Payment captured: Order #${displayId} already synced to Shippo — skipping`)
    await debugLog(pgConnection, "shippo_sync", orderId, `SKIPPED — already synced (shippo_order_id: ${meta.shippo_order_id})`)
    return
  }

  const shippoApiKey = process.env.SHIPPO_API_KEY
  if (!shippoApiKey) {
    logger.warn(`Payment captured: SHIPPO_API_KEY not configured`)
    await debugLog(pgConnection, "shippo_sync", orderId, "SKIPPED — SHIPPO_API_KEY not configured", {}, { level: "warn" })
    return
  }

  if (!addr.address_1) {
    logger.warn(`Payment captured: No shipping address on order #${displayId}`)
    await debugLog(pgConnection, "shippo_sync", orderId, `SKIPPED — no shipping address on order #${displayId}`, { addr }, { level: "warn" })
    return
  }

  try {
    const shippoItems = (order.items || []).map((item: any) => {
      const variantTitle = item.variant_title && item.variant_title.toLowerCase() !== "default"
        ? item.variant_title : null
      const fullTitle = variantTitle
        ? `${item.title || "Product"} — ${variantTitle}`
        : String(item.title || "Product")
      return {
        title: fullTitle,
        quantity: toNum(item.quantity) || 1,
        total_price: toNum(item.unit_price).toFixed(2),
        currency,
        weight: "0.1",
        weight_unit: "lb",
      }
    })

    const totalItems = (order.items || []).reduce(
      (sum: number, item: any) => sum + (toNum(item.quantity) || 1), 0
    ) || 1
    // Package weight: 1 lb (box) + 0.1 lb per item
    const totalWeightLbs = 1 + totalItems * 0.1

    const shippoController = new AbortController()
    const shippoTimeout = setTimeout(() => shippoController.abort(), 10000)
    const shippoRes = await fetch("https://api.goshippo.com/orders/", {
      method: "POST",
      signal: shippoController.signal,
      headers: {
        Authorization: `ShippoToken ${shippoApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_number: `#${displayId}`,
        order_status: "PAID",
        to_address: {
          name: `${addr.first_name || ""} ${addr.last_name || ""}`.trim(),
          street1: addr.address_1 || "",
          street2: addr.address_2 || "",
          city: addr.city || "",
          state: addr.province || "",
          zip: addr.postal_code || "",
          country: (addr.country_code || "US").toUpperCase(),
          email: order.email,
          phone: addr.phone || "+10000000000",
        },
        from_address: {
          name: "Peptidesfarma",
          street1: "123 Commerce St",
          city: "San Francisco",
          state: "CA",
          zip: "94105",
          country: "US",
          phone: "+10000000000",
          email: "support@peptidesfarma.com",
        },
        placed_at: new Date().toISOString(),
        line_items: shippoItems,
        shipping_cost: meta.shippo_shipping_cost != null
          ? String(meta.shippo_shipping_cost)
          : toNum(order.shipping_total).toFixed(2),
        shipping_cost_currency: currency,
        total_price: toNum(order.total).toFixed(2),
        weight: String(totalWeightLbs),
        weight_unit: "lb",
        currency,
        shop_app: "Medusa",
        shipping_method: meta.shippo_shipping_service
          ? `${meta.shippo_shipping_provider || ""} ${meta.shippo_shipping_service}`.trim()
          : "",
        notes: [
          `Medusa Order ${order.id}`,
          `Package: Vial Box 8x5x2 in`,
          meta.shippo_shipping_service ? `Customer selected: ${meta.shippo_shipping_provider || ""} ${meta.shippo_shipping_service}` : "",
          meta.shippo_shipping_cost != null ? `Shipping Cost: $${Number(meta.shippo_shipping_cost).toFixed(2)}` : "",
          meta.shippo_shipping_estimated_days ? `Est. ${meta.shippo_shipping_estimated_days} business days` : "",
        ].filter(Boolean).join(" | "),
      }),
    })

    clearTimeout(shippoTimeout)

    if (shippoRes.ok) {
      const shippoOrder = await shippoRes.json().catch(() => null)
      logger.info(`Payment captured: Order #${displayId} synced to Shippo`)
      await debugLog(pgConnection, "shippo_sync", orderId, `Order #${displayId} synced to Shippo`, { shippoOrderId: shippoOrder?.object_id })

      // Save Shippo order ID to metadata for idempotency
      if (shippoOrder?.object_id) {
        try {
          await pgConnection.raw(
            `UPDATE "order" SET metadata = metadata || ?::jsonb WHERE id = ?`,
            [JSON.stringify({ shippo_order_id: shippoOrder.object_id }), orderId]
          )
        } catch {}
      }

      // Create shipment with Vial Box parcel so rates auto-populate
      try {
        const weightLbs = totalWeightLbs
        await fetch("https://api.goshippo.com/shipments/", {
          method: "POST",
          headers: {
            Authorization: `ShippoToken ${shippoApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address_from: {
              name: "Peptidesfarma",
              street1: "123 Commerce St",
              city: "San Francisco",
              state: "CA",
              zip: "94105",
              country: "US",
              phone: "+10000000000",
              email: "support@peptidesfarma.com",
            },
            address_to: {
              name: `${addr.first_name || ""} ${addr.last_name || ""}`.trim(),
              street1: addr.address_1 || "",
              street2: addr.address_2 || "",
              city: addr.city || "",
              state: addr.province || "",
              zip: addr.postal_code || "",
              country: (addr.country_code || "US").toUpperCase(),
              email: order.email,
              phone: addr.phone || "+10000000000",
            },
            parcels: [{
              length: "8",
              width: "5",
              height: "2",
              distance_unit: "in",
              weight: String(weightLbs),
              weight_unit: "lb",
            }],
            order: shippoOrder?.object_id || undefined,
            async: true,
          }),
        })
        logger.info(`Payment captured: Shippo shipment created with Vial Box parcel for #${displayId}`)
      } catch (shipErr: any) {
        logger.warn(`Payment captured: Shippo shipment creation failed for #${displayId} — ${shipErr.message}`)
      }
    } else {
      const errText = await shippoRes.text()
      logger.error(`Payment captured: Shippo sync failed for order #${displayId} — ${errText}`)
      await debugLog(pgConnection, "shippo_sync", orderId, `FAILED — Shippo API returned ${shippoRes.status}`, { status: shippoRes.status, error: errText }, { level: "error" })
    }
  } catch (error: any) {
    logger.error(`Payment captured: Shippo sync error for order #${displayId} — ${error.message}`)
    await debugLog(pgConnection, "shippo_sync", orderId, `ERROR — ${error.message}`, { error: error.message }, { level: "error" })
  }
}

export const config: SubscriberConfig = {
  event: "payment.captured",
}
