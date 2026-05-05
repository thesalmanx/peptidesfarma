import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { render } from "@react-email/render"
import ShippingConfirmation from "../email-templates/shipping-confirmation"
import { getCarrierTrackingUrl } from "../utils/carrier-tracking-url"

const ADMIN_EMAIL = "admin@peptidesfarma.com"
const ADMIN_CC = "admin-cc@peptidesfarma.com"

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  order_id: string
  fulfillment_id: string
  no_notification?: boolean
}>) {
  if (data.no_notification) return

  const query = container.resolve("query")
  const logger = container.resolve("logger")

  // ── Fetch order data ──
  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "total",
      "subtotal",
      "shipping_total",
      "tax_total",
      "discount_total",
      "currency_code",
      "created_at",
      "metadata",
      "items.*",
      "items.thumbnail",
      "items.adjustments.*",
      "shipping_address.*",
      "fulfillments.*",
      "fulfillments.labels.*",
    ],
    filters: { id: data.order_id },
  })

  if (!order?.email || !order?.shipping_address) {
    logger.warn("Shipping subscriber: No email or shipping address on order, skipping")
    return
  }

  // ── Get tracking info from fulfillment ──
  let trackingNumber = ""
  let trackingUrl = ""
  let carrier = ""

  const fulfillments = (order as any).fulfillments || []
  for (const fulfillment of fulfillments) {
    if (fulfillment.id === data.fulfillment_id) {
      const labels = fulfillment.labels || []
      if (labels.length > 0) {
        trackingNumber = labels[0].tracking_number || ""
        trackingUrl = labels[0].tracking_url || ""
      }
      carrier = fulfillment.provider_id || ""
      break
    }
  }

  // Also check tracking_links if labels are empty
  if (!trackingNumber) {
    for (const fulfillment of fulfillments) {
      if (fulfillment.id === data.fulfillment_id) {
        const trackingLinks = fulfillment.tracking_links || []
        if (trackingLinks.length > 0) {
          trackingNumber = trackingLinks[0].tracking_number || ""
          trackingUrl = trackingLinks[0].url || ""
        }
        break
      }
    }
  }

  // ── Build email data ──
  const formatPrice = (value: any): string => {
    if (value == null) return "0.00"
    const num =
      typeof value === "object" && value.value != null
        ? Number(value.value)
        : Number(value)
    return isNaN(num) ? "0.00" : num.toFixed(2)
  }

  const addr = order.shipping_address as any
  const ORDER_NUMBER_OFFSET = 11000
  const displayId = String(Number(order.display_id || 0) + ORDER_NUMBER_OFFSET)
  const currency = (order.currency_code || "USD").toUpperCase()
  const storefrontUrl = process.env.STOREFRONT_URL || "https://www.peptidesfarma.com"
  const fromEmail = `Peptidesfarma <${process.env.RESEND_ORDER_FROM_EMAIL || "support@peptidesfarma.com"}>`

  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })

  const toNum = (v: any): number => {
    if (v == null) return 0
    if (typeof v === "object" && v.value != null) return Number(v.value)
    return Number(v) || 0
  }

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

  // Mirror order-placed.ts: real shipping comes from Shippo metadata, not Medusa's shipping_total
  const meta = (order as any).metadata || {}
  const shippoShipping = meta.shippo_shipping_cost != null ? Number(meta.shippo_shipping_cost) : 0
  const medusaShipping = toNum(order.shipping_total)
  const shippingForDisplay = shippoShipping > 0 ? shippoShipping.toFixed(2) : formatPrice(order.shipping_total)

  const taxAmount = meta.tax_amount != null ? Number(meta.tax_amount) : toNum(order.tax_total)
  const taxForDisplay = taxAmount > 0 ? taxAmount.toFixed(2) : formatPrice(order.tax_total)

  const discountAmount = toNum(order.discount_total)
  const customerPaidTotal = meta.customer_paid_total != null ? Number(meta.customer_paid_total) : 0
  const actualTotal = customerPaidTotal > 0
    ? customerPaidTotal.toFixed(2)
    : (toNum(order.total) + taxAmount + (shippoShipping > medusaShipping ? shippoShipping - medusaShipping : 0)).toFixed(2)

  const discountCodeFromItems = (() => {
    for (const item of order.items || []) {
      for (const adj of (item as any).adjustments || []) {
        if (adj.code) return adj.code as string
      }
    }
    return null
  })()

  const shippingAddress = {
    first_name: addr.first_name,
    last_name: addr.last_name,
    address_1: addr.address_1,
    address_2: addr.address_2,
    city: addr.city,
    province: addr.province,
    postal_code: addr.postal_code,
    country_code: addr.country_code,
  }

  // Also check order metadata for tracking (set by Shippo webhook or manual update)
  if (!trackingNumber && meta.shippo_tracking_number) {
    trackingNumber = meta.shippo_tracking_number
  }

  const carrierTrackingUrl = trackingNumber
    ? getCarrierTrackingUrl(trackingNumber, carrier)
    : `${storefrontUrl}/account/orders`

  // ── Send shipping confirmation to customer ──
  try {
    const notificationService: INotificationModuleService =
      container.resolve(Modules.NOTIFICATION)

    const shippingHtml = await render(
      ShippingConfirmation({
        displayId,
        orderDate,
        items: formattedItems,
        subtotal: formatPrice(order.subtotal),
        shippingTotal: shippingForDisplay,
        taxTotal: taxForDisplay,
        discountTotal: discountAmount > 0 ? discountAmount.toFixed(2) : undefined,
        discountCode: discountCodeFromItems || undefined,
        total: actualTotal,
        currency,
        shippingAddress,
        trackingNumber: trackingNumber || "Pending",
        trackingUrl: carrierTrackingUrl,
        carrier: carrier || (trackingNumber.startsWith("1Z") ? "UPS" : undefined),
        storefrontUrl,
      })
    )

    await notificationService.createNotifications({
      to: order.email,
      from: fromEmail,
      channel: "email",
      template: "shipping-confirmation",
      content: {
        subject: "Your Order Has Been Shipped!",
        html: shippingHtml,
      },
      resource_id: order.id,
      resource_type: "order",
    })

    logger.info(`Shipping subscriber: Confirmation email sent to ${order.email}`)

    // ── Send admin copy ──
    await notificationService.createNotifications({
      to: ADMIN_EMAIL,
      from: fromEmail,
      channel: "email",
      template: "shipping-confirmation-admin",
      content: {
        subject: `Shipped: Order #${displayId}${trackingNumber ? ` — ${trackingNumber}` : ""}`,
        html: shippingHtml,
        cc: [ADMIN_CC],
      } as any,
      resource_id: order.id,
      resource_type: "order",
    })

    logger.info(`Shipping subscriber: Admin notification sent to ${ADMIN_EMAIL} (CC: ${ADMIN_CC})`)
  } catch (error: any) {
    logger.error(
      `Shipping subscriber: Failed to send email — ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
}
