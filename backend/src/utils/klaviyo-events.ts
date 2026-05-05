// Helpers for firing Klaviyo events from the Medusa backend.

const KLAVIYO_BASE = "https://a.klaviyo.com/api"
const KLAVIYO_REVISION = "2024-10-15"

type FetchResult = { ok: boolean; status: number; body?: any }

async function klaviyoFetch(
  apiKey: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<FetchResult> {
  const res = await fetch(`${KLAVIYO_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      "Content-Type": "application/json",
      accept: "application/json",
      revision: KLAVIYO_REVISION,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text().catch(() => "")
  let parsed: any
  try { parsed = text ? JSON.parse(text) : undefined } catch { parsed = text }
  return { ok: res.ok, status: res.status, body: parsed }
}

export type KlaviyoProfile = {
  email: string
  first_name?: string
  last_name?: string
  phone_number?: string
}

async function fireEvent(
  apiKey: string,
  metricName: string,
  profile: KlaviyoProfile,
  properties: Record<string, any>,
  value?: number,
): Promise<FetchResult> {
  const profileAttrs: any = { email: profile.email }
  if (profile.first_name) profileAttrs.first_name = profile.first_name
  if (profile.last_name) profileAttrs.last_name = profile.last_name
  if (profile.phone_number) profileAttrs.phone_number = profile.phone_number

  const eventAttrs: any = {
    properties,
    metric: { data: { type: "metric", attributes: { name: metricName } } },
    profile: { data: { type: "profile", attributes: profileAttrs } },
  }
  if (value != null) eventAttrs.value = value

  return klaviyoFetch(apiKey, "POST", "/events/", { data: { type: "event", attributes: eventAttrs } })
}

function getApiKey(logger?: any): string | null {
  const k = process.env.KLAVIYO_PRIVATE_KEY
  if (!k && logger) logger.warn("[Klaviyo events] KLAVIYO_PRIVATE_KEY not set, skipping")
  return k || null
}

// Placed Order
export async function firePlacedOrder(
  logger: any,
  args: {
    profile: KlaviyoProfile
    orderId: string
    displayId: string
    total: number
    currency: string
    items: Array<{
      product_id?: string; variant_id?: string; sku?: string; title: string
      variant_title?: string; quantity: number; unit_price: number; line_price: number
      image_url?: string; url?: string
    }>
    storefrontUrl?: string
  },
): Promise<void> {
  const apiKey = getApiKey(logger)
  if (!apiKey) return
  const properties = {
    OrderId: args.orderId, DisplayId: args.displayId, OrderNumber: args.displayId,
    $value: args.total, Total: args.total, Currency: args.currency,
    ItemCount: args.items.reduce((s, i) => s + i.quantity, 0),
    extra: {
      line_items: args.items.map((i) => ({
        product: { title: i.title, images: i.image_url ? [{ src: i.image_url }] : [], url: i.url },
        variant_options: i.variant_title || "", sku: i.sku,
        quantity: i.quantity, unit_price: i.unit_price, line_price: i.line_price,
      })),
    },
  }
  const result = await fireEvent(apiKey, "Placed Order", args.profile, properties, args.total)
  if (result.ok) {
    logger.info(`[Klaviyo events] Placed Order fired for ${args.profile.email} (order #${args.displayId})`)
  } else {
    logger.warn(`[Klaviyo events] Placed Order failed (${result.status}): ${JSON.stringify(result.body).slice(0, 300)}`)
  }
}

// Started Checkout
export async function fireStartedCheckout(
  logger: any,
  args: {
    profile: KlaviyoProfile; cartId: string; cartTotal: number; currency: string; checkoutUrl: string
    items: Array<{
      product_id?: string; variant_id?: string; sku?: string; title: string
      variant_title?: string; quantity: number; unit_price: number; line_price: number
      image_url?: string; url?: string
    }>
  },
): Promise<void> {
  const apiKey = getApiKey(logger)
  if (!apiKey) return
  const properties = {
    CartId: args.cartId, $value: args.cartTotal, Total: args.cartTotal, Currency: args.currency,
    ItemCount: args.items.reduce((s, i) => s + i.quantity, 0),
    extra: {
      responsive_checkout_url: args.checkoutUrl,
      line_items: args.items.map((i) => ({
        product: { title: i.title, images: i.image_url ? [{ src: i.image_url }] : [], url: i.url },
        variant_options: i.variant_title || "", sku: i.sku,
        quantity: i.quantity, unit_price: i.unit_price, line_price: i.line_price,
      })),
    },
  }
  const result = await fireEvent(apiKey, "Started Checkout", args.profile, properties, args.cartTotal)
  if (result.ok) {
    logger.info(`[Klaviyo events] Started Checkout fired for ${args.profile.email} (cart ${args.cartId})`)
  } else {
    logger.warn(`[Klaviyo events] Started Checkout failed (${result.status}): ${JSON.stringify(result.body).slice(0, 300)}`)
  }
}

// Viewed Product
export async function fireViewedProduct(
  logger: any,
  args: {
    profile: KlaviyoProfile; productId: string; productName: string
    variantId?: string; variantName?: string; sku?: string; price?: number
    currency?: string; url: string; imageUrl?: string
  },
): Promise<void> {
  const apiKey = getApiKey(logger)
  if (!apiKey) return
  const properties: Record<string, any> = {
    ProductID: args.productId, ProductName: args.productName, VariantId: args.variantId,
    VariantName: args.variantName, SKU: args.sku, Price: args.price,
    Currency: args.currency || "USD", URL: args.url, ImageURL: args.imageUrl,
  }
  const result = await fireEvent(apiKey, "Viewed Product", args.profile, properties, args.price)
  if (result.ok) {
    logger.info(`[Klaviyo events] Viewed Product fired for ${args.profile.email} (${args.productName})`)
  } else {
    logger.warn(`[Klaviyo events] Viewed Product failed (${result.status}): ${JSON.stringify(result.body).slice(0, 300)}`)
  }
}

// Back-in-Stock subscription
export async function subscribeToBackInStock(
  logger: any,
  args: { profile: KlaviyoProfile; variantId: string },
): Promise<void> {
  const apiKey = getApiKey(logger)
  if (!apiKey) return
  const klaviyoVariantId = `$custom:::$default:::${args.variantId}`
  const profileAttrs: any = { email: args.profile.email }
  if (args.profile.first_name) profileAttrs.first_name = args.profile.first_name
  if (args.profile.last_name) profileAttrs.last_name = args.profile.last_name
  if (args.profile.phone_number) profileAttrs.phone_number = args.profile.phone_number

  const result = await klaviyoFetch(apiKey, "POST", "/back-in-stock-subscriptions/", {
    data: {
      type: "back-in-stock-subscription",
      attributes: {
        channels: ["EMAIL"],
        profile: { data: { type: "profile", attributes: profileAttrs } },
      },
      relationships: {
        variant: { data: { type: "catalog-variant", id: klaviyoVariantId } },
      },
    },
  })
  if (result.ok) {
    logger.info(`[Klaviyo events] Back-in-stock subscription created for ${args.profile.email} on variant ${args.variantId}`)
  } else {
    logger.warn(`[Klaviyo events] Back-in-stock subscription failed (${result.status}): ${JSON.stringify(result.body).slice(0, 300)}`)
  }
}

// Subscribed to Email Marketing
export async function fireSubscribedToEmailMarketing(
  logger: any,
  args: { profile: KlaviyoProfile; listId?: string; source?: string },
): Promise<void> {
  const apiKey = getApiKey(logger)
  if (!apiKey) return

  const subscribePayload: any = {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        profiles: {
          data: [{
            type: "profile",
            attributes: {
              email: args.profile.email,
              ...(args.profile.first_name && { first_name: args.profile.first_name }),
              ...(args.profile.last_name && { last_name: args.profile.last_name }),
              ...(args.profile.phone_number && { phone_number: args.profile.phone_number }),
              subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
            },
          }],
        },
        ...(args.source && { custom_source: args.source }),
      },
    },
  }
  if (args.listId) {
    subscribePayload.data.relationships = { list: { data: { type: "list", id: args.listId } } }
  }

  const subResult = await klaviyoFetch(apiKey, "POST", "/profile-subscription-bulk-create-jobs/", subscribePayload)
  if (!subResult.ok) {
    logger.warn(`[Klaviyo events] Marketing-subscribe failed (${subResult.status}): ${JSON.stringify(subResult.body).slice(0, 300)}`)
  } else {
    logger.info(`[Klaviyo events] Marketing-subscribed ${args.profile.email}`)
  }

  const evt = await fireEvent(apiKey, "Subscribed to Email Marketing", args.profile, { Source: args.source || "Medusa" })
  if (evt.ok) {
    logger.info(`[Klaviyo events] Subscribed to Email Marketing fired for ${args.profile.email}`)
  } else {
    logger.warn(`[Klaviyo events] Subscribed to Email Marketing event failed (${evt.status})`)
  }
}
