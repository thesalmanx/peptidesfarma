// Fires Klaviyo "Started Checkout" event when a cart qualifies as in-checkout
// (has email, shipping address, items). Triggers the Abandoned Cart flow.
//
// Deduped per cart via Redis: once fired, won't fire again for 7 days even if
// cart.updated keeps firing during the user's checkout flow.

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import Redis from "ioredis"
import { fireStartedCheckout } from "../utils/klaviyo-events"

let redis: Redis | null = null
function redisClient(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    })
  }
  return redis
}

const dedupKey = (cartId: string) => `klaviyo:started_checkout:${cartId}`
const DEDUP_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

export default async function cartStartedCheckoutHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  if (!data?.id) return

  // Dedup — only fire once per cart per 7 days
  try {
    const set = await redisClient().set(dedupKey(data.id), "1", "EX", DEDUP_TTL_SECONDS, "NX")
    if (set !== "OK") return // already fired
  } catch (err: any) {
    logger.warn(`[Klaviyo started-checkout] redis dedup failed: ${err.message}`)
    // Continue anyway — better to fire twice than not at all
  }

  // Fetch cart with items + address + completion status
  let cart: any
  try {
    const { data: [c] } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "email",
        "currency_code",
        "completed_at",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "shipping_address.phone",
        "items.id",
        "items.product_id",
        "items.variant_id",
        "items.product_handle",
        "items.title",
        "items.variant_title",
        "items.variant_sku",
        "items.thumbnail",
        "items.quantity",
        "items.unit_price",
      ],
      filters: { id: data.id },
    })
    cart = c
  } catch (err: any) {
    logger.warn(`[Klaviyo started-checkout] cart fetch failed (${data.id}): ${err.message}`)
    return
  }

  if (!cart) return

  // Qualify: must have email, shipping address, and items, and not be completed
  if (cart.completed_at) return
  if (!cart.email) return
  if (!cart.shipping_address) return
  const items = cart.items || []
  if (items.length === 0) return

  const storefrontUrl = process.env.STOREFRONT_URL || "https://www.peptidesfarma.com"
  const checkoutUrl = `${storefrontUrl}/checkout?cart_id=${cart.id}`

  const toNum = (v: any): number => {
    if (v == null) return 0
    if (typeof v === "object" && v.value != null) return Number(v.value)
    return Number(v) || 0
  }

  const formattedItems = items.map((item: any) => {
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
  })

  const cartTotal = formattedItems.reduce((s: number, i: any) => s + i.line_price, 0)

  fireStartedCheckout(logger, {
    profile: {
      email: cart.email,
      first_name: cart.shipping_address.first_name || undefined,
      last_name: cart.shipping_address.last_name || undefined,
      phone_number: cart.shipping_address.phone || undefined,
    },
    cartId: cart.id,
    cartTotal,
    currency: (cart.currency_code || "USD").toUpperCase(),
    checkoutUrl,
    items: formattedItems,
  }).catch((err) => logger.warn(`[Klaviyo started-checkout] fire failed: ${err.message}`))
}

export const config: SubscriberConfig = {
  event: "cart.updated",
}
