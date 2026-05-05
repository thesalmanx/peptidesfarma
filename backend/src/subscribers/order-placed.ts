import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { render } from "@react-email/render"
import OrderConfirmation from "../email-templates/order-confirmation"
import AdminOrderNotification from "../email-templates/admin-order-notification"
import VenmoPaymentInstructions from "../email-templates/venmo-payment-instructions"
import { debugLog } from "../utils/debug-log"
import { firePlacedOrder } from "../utils/klaviyo-events"

const ADMIN_EMAIL = "admin@peptidesfarma.com"
const ADMIN_CC = "admin-cc@peptidesfarma.com"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION)

  const query = container.resolve("query")
  const logger = container.resolve("logger")
  const pgConnection = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  await debugLog(pgConnection, "order_placed", data.id, `Order placed: ${data.id}`)

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
      "items.*",
      "items.thumbnail",
      "items.adjustments.*",
      "shipping_address.*",
      "metadata",
    ],
    filters: { id: data.id },
  })

  if (!order?.email) return

  const formatPrice = (value: any): string => {
    if (value == null) return "0.00"
    const num =
      typeof value === "object" && value.value != null
        ? Number(value.value)
        : Number(value)
    return isNaN(num) ? "0.00" : num.toFixed(2)
  }

  const addr = (order.shipping_address || {}) as any
  const meta = (order as any).metadata || {}
  const currency = (order.currency_code || "USD").toUpperCase()
  const ORDER_NUMBER_OFFSET = 11000
  const displayId = String(Number(order.display_id || 0) + ORDER_NUMBER_OFFSET)
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

  const storefrontUrl = process.env.STOREFRONT_URL || "https://www.peptidesfarma.com"
  const adminUrl = process.env.MEDUSA_ADMIN_URL || "http://localhost:9000/app"
  const fromEmail = `Peptidesfarma <${process.env.RESEND_ORDER_FROM_EMAIL || "support@peptidesfarma.com"}>`

  const toNum = (v: any): number => {
    if (v == null) return 0
    if (typeof v === "object" && v.value != null) return Number(v.value)
    return Number(v) || 0
  }

  // Use Shippo shipping cost from metadata if available, otherwise fallback to Medusa shipping_total
  const shippoShipping = meta.shippo_shipping_cost != null ? Number(meta.shippo_shipping_cost) : 0
  const medusaShipping = toNum(order.shipping_total)
  const shippingForDisplay = shippoShipping > 0 ? shippoShipping.toFixed(2) : formatPrice(order.shipping_total)

  // Tax from metadata (calculated via Zip-Tax at checkout)
  const taxAmount = meta.tax_amount != null ? Number(meta.tax_amount) : toNum(order.tax_total)
  const taxForDisplay = taxAmount > 0 ? taxAmount.toFixed(2) : formatPrice(order.tax_total)

  // Use customer_paid_total from metadata as the authoritative total (includes tax + shipping)
  // Fallback to Medusa total + adjustments if metadata not available
  const discountAmount = toNum(order.discount_total)
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

  // Extract discount code from item adjustments
  const discountCode = (() => {
    for (const item of order.items || []) {
      for (const adj of (item as any).adjustments || []) {
        if (adj.code) return adj.code
      }
    }
    return null
  })()

  // Fire Placed Order event to Klaviyo (triggers Post-Purchase Upsell + Winback flows).
  // Fire-and-forget so it never blocks email/Shippo sync.
  firePlacedOrder(logger, {
    profile: {
      email: order.email,
      first_name: addr.first_name || undefined,
      last_name: addr.last_name || undefined,
      phone_number: addr.phone || undefined,
    },
    orderId: order.id,
    displayId,
    total: Number(actualTotal),
    currency,
    items: (order.items || []).map((item: any) => {
      const unitPrice = toNum(item.unit_price)
      const qty = toNum(item.quantity) || 1
      const variantTitle = item.variant_title && item.variant_title.toLowerCase() !== "default"
        ? item.variant_title : undefined
      return {
        product_id: item.product_id,
        variant_id: item.variant_id,
        sku: item.variant_sku,
        title: String(item.title || ""),
        variant_title: variantTitle,
        quantity: qty,
        unit_price: unitPrice,
        line_price: unitPrice * qty,
        image_url: item.thumbnail || undefined,
        url: item.product_handle ? `${storefrontUrl}/product-page/${item.product_handle}` : undefined,
      }
    }),
    storefrontUrl,
  }).catch((err) => logger.warn(`[Klaviyo] Placed Order fire failed: ${err.message}`))

  // ── Determine if this is a card payment (Stripe/Square/PayPal) or Venmo/manual ──
  const isCardPayment = !!(meta.stripe_checkout_session_id || meta.stripe_payment_intent_id || meta.square_payment_id || meta.paypal_order_id || meta.payment_method === "card")
  const isVenmoOrder = !isCardPayment

  // ── Customer confirmation email (skip for Venmo orders — they get a separate email) ──
  if (!isVenmoOrder) try {
    const discountTotal = toNum(order.discount_total)
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

    logger.info(`Order #${displayId}: Confirmation email sent to ${order.email}`)
  } catch (error: any) {
    logger.error(`Order #${displayId}: Failed to send customer email — ${error.message}`)
  }

  // ── Venmo payment instructions email ──
  if (isVenmoOrder) {
    try {
      const discountTotal = toNum(order.discount_total)
      const venmoHtml = await render(
        VenmoPaymentInstructions({
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
          shippingAddress: addr
            ? {
                first_name: addr.first_name,
                last_name: addr.last_name,
                address_1: addr.address_1,
                address_2: addr.address_2,
                city: addr.city,
                province: addr.province,
                postal_code: addr.postal_code,
                country_code: addr.country_code,
                phone: addr.phone,
              }
            : undefined,
          storefrontUrl,
        })
      )

      await notificationService.createNotifications({
        to: order.email,
        from: fromEmail,
        channel: "email",
        template: "venmo-payment-instructions",
        content: {
          subject: `Peptidesfarma ORDER #${displayId} — Complete Your Payment`,
          html: venmoHtml,
        },
        resource_id: order.id,
        resource_type: "order",
      })

      logger.info(`Order #${displayId}: Venmo payment instructions email sent to ${order.email}`)
    } catch (error: any) {
      logger.error(`Order #${displayId}: Failed to send Venmo payment email — ${error.message}`)
    }
  }

  // ── Admin notification email ──
  try {
    const adminHtml = await render(
      AdminOrderNotification({
        displayId,
        orderId: order.id,
        email: order.email,
        items: formattedItems,
        subtotal: formatPrice(order.subtotal),
        shippingTotal: shippingForDisplay,
        taxTotal: taxForDisplay,
        discountTotal: discountAmount > 0 ? discountAmount.toFixed(2) : undefined,
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
        paymentMethod: meta.payment_method || undefined,
        adminUrl,
        orderDate,
      })
    )

    await notificationService.createNotifications({
      to: ADMIN_EMAIL,
      from: fromEmail,
      channel: "email",
      template: "admin-order-notification",
      content: {
        subject: `NICE! YOU JUST GOT AN ORDER (#${displayId}) - $${formatPrice(order.total)}`,
        html: adminHtml,
        cc: [ADMIN_CC],
      } as any,
      resource_id: order.id,
      resource_type: "order",
    })

    logger.info(`Order #${displayId}: Admin notification sent to ${ADMIN_EMAIL} (CC: ${ADMIN_CC})`)
  } catch (error: any) {
    logger.error(`Order #${displayId}: Failed to send admin email — ${error.message}`)
  }

  // ── Auto-capture payment (card payments only) ──
  if (!isCardPayment) {
    logger.info(`Order #${displayId}: Venmo/manual payment — skipping auto-capture`)
  }

  if (isCardPayment) try {
    const {
      data: [freshOrder],
    } = await query.graph({
      entity: "order",
      fields: ["id", "payment_collections.payments.id", "payment_collections.payments.captured_at"],
      filters: { id: order.id },
    })
  
    const paymentCollections = (freshOrder as any)?.payment_collections || []
    for (const pc of paymentCollections) {
      const payments = (pc as any)?.payments || []
      for (const payment of payments) {
        if (!payment?.id || payment.captured_at) continue // Already captured
        try {
          const paymentModule = container.resolve(Modules.PAYMENT)
          await (paymentModule as any).capturePayment({ payment_id: payment.id })
          logger.info(`Order #${displayId}: Auto-captured payment ${payment.id}`)
        } catch (capErr: any) {
          logger.error(`Order #${displayId}: Auto-capture failed for payment ${payment.id} — ${capErr.message}`)
        }
      }
    }
  } catch (capError: any) {
    logger.error(`Order #${displayId}: Auto-capture error — ${capError.message}`)
  }

  // ── Sync order to Shippo ──
  // Skip for Venmo orders — Shippo sync happens on payment.captured instead
  if (isVenmoOrder) {
    logger.info(`Order #${displayId}: Venmo order — Shippo sync deferred until payment capture`)
    return
  }

  // Manual recovery orders set metadata.skip_shippo_sync=true to prevent creating
  // a duplicate Shippo entry when Jake has already shipped outside Medusa.
  if (meta.skip_shippo_sync === true || meta.skip_shippo_sync === "true") {
    logger.info(`Order #${displayId}: skip_shippo_sync flag set — skipping Shippo sync`)
    return
  }

  // Jake buys labels manually in Shippo. We just create the order there.
  const shippoApiKey = process.env.SHIPPO_API_KEY
  if (!shippoApiKey) {
    logger.warn(`Order #${displayId}: SHIPPO_API_KEY not configured, skipping Shippo sync`)
    return
  }

  const shipAddr = order.shipping_address as any
  if (!shipAddr) {
    logger.warn(`Order #${displayId}: No shipping address, skipping Shippo sync`)
    return
  }

  const orderMeta = (order as any).metadata || {}
  const orderCurrency = (order.currency_code || "USD").toUpperCase()

  const numVal = (v: any): number => {
    if (v == null) return 0
    if (typeof v === "object" && v.value != null) return Number(v.value)
    return Number(v) || 0
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
        quantity: numVal(item.quantity) || 1,
        total_price: numVal(item.unit_price).toFixed(2),
        currency: orderCurrency,
        weight: "0.1",
        weight_unit: "lb",
      }
    })

    const totalItems = (order.items || []).reduce(
      (sum: number, item: any) => sum + (numVal(item.quantity) || 1), 0
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
          name: `${shipAddr.first_name || ""} ${shipAddr.last_name || ""}`.trim(),
          street1: shipAddr.address_1 || "",
          street2: shipAddr.address_2 || "",
          city: shipAddr.city || "",
          state: shipAddr.province || "",
          zip: shipAddr.postal_code || "",
          country: (shipAddr.country_code || "US").toUpperCase(),
          email: order.email,
          phone: shipAddr.phone || "+10000000000",
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
        shipping_cost: orderMeta.shippo_shipping_cost != null
          ? String(orderMeta.shippo_shipping_cost)
          : numVal(order.shipping_total).toFixed(2),
        shipping_cost_currency: orderCurrency,
        total_price: numVal(order.total).toFixed(2),
        weight: String(totalWeightLbs),
        weight_unit: "lb",
        currency: orderCurrency,
        shop_app: "Medusa",
        shipping_method: orderMeta.shippo_shipping_service
          ? `${orderMeta.shippo_shipping_provider || ""} ${orderMeta.shippo_shipping_service}`.trim()
          : "",
        notes: [
          `Medusa Order ${order.id}`,
          `Package: Vial Box 8x5x2 in`,
          orderMeta.shippo_shipping_service ? `Customer selected: ${orderMeta.shippo_shipping_provider || ""} ${orderMeta.shippo_shipping_service}` : "",
          orderMeta.shippo_shipping_cost != null ? `Shipping Cost: $${Number(orderMeta.shippo_shipping_cost).toFixed(2)}` : "",
          orderMeta.shippo_shipping_estimated_days ? `Est. ${orderMeta.shippo_shipping_estimated_days} business days` : "",
        ].filter(Boolean).join(" | "),
      }),
    })

    clearTimeout(shippoTimeout)

    if (shippoRes.ok) {
      const shippoOrder = await shippoRes.json().catch(() => null)
      logger.info(`Order #${displayId}: Synced to Shippo — ready for label purchase`)

      // Create a shipment with Vial Box parcel so rates auto-populate in Shippo
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
              name: `${shipAddr.first_name || ""} ${shipAddr.last_name || ""}`.trim(),
              street1: shipAddr.address_1 || "",
              street2: shipAddr.address_2 || "",
              city: shipAddr.city || "",
              state: shipAddr.province || "",
              zip: shipAddr.postal_code || "",
              country: (shipAddr.country_code || "US").toUpperCase(),
              email: order.email,
              phone: shipAddr.phone || "+10000000000",
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
        logger.info(`Order #${displayId}: Shippo shipment created with Vial Box parcel`)
      } catch (shipErr: any) {
        logger.warn(`Order #${displayId}: Shippo shipment creation failed — ${shipErr.message}`)
      }
    } else {
      const errText = await shippoRes.text()
      logger.error(`Order #${displayId}: Shippo sync failed — ${errText}`)
    }
  } catch (shippoErr: any) {
    logger.error(`Order #${displayId}: Shippo sync error — ${shippoErr.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
