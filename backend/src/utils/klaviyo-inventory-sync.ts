// Pushes a variant's current inventory to Klaviyo's catalog and fires
// a "Back in Stock" event when stock transitions from 0 to >0.

import { getSubscribers, clearSubscribers } from "./back-in-stock-store"

const KLAVIYO_BASE = "https://a.klaviyo.com/api"
const KLAVIYO_REVISION = "2024-10-15"

const klaviyoVariantId = (variantId: string) => `$custom:::$default:::${variantId}`

type FetchResult = { ok: boolean; status: number; body?: any }

async function klaviyoFetch(
  apiKey: string, method: string, path: string, body?: unknown,
): Promise<FetchResult> {
  const res = await fetch(`${KLAVIYO_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`, "Content-Type": "application/json",
      accept: "application/json", revision: KLAVIYO_REVISION,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text().catch(() => "")
  let parsed: any
  try { parsed = text ? JSON.parse(text) : undefined } catch { parsed = text }
  return { ok: res.ok, status: res.status, body: parsed }
}

async function getCatalogVariantInventory(apiKey: string, variantExternalId: string): Promise<number | null> {
  const id = klaviyoVariantId(variantExternalId)
  const result = await klaviyoFetch(apiKey, "GET", `/catalog-variants/${encodeURIComponent(id)}/`)
  if (!result.ok) return null
  const qty = result.body?.data?.attributes?.inventory_quantity
  return typeof qty === "number" ? qty : null
}

async function patchCatalogVariantInventory(apiKey: string, variantExternalId: string, qty: number): Promise<FetchResult> {
  const id = klaviyoVariantId(variantExternalId)
  return klaviyoFetch(apiKey, "PATCH", `/catalog-variants/${encodeURIComponent(id)}/`, {
    data: { type: "catalog-variant", id, attributes: { inventory_quantity: qty, inventory_policy: 1, published: true } },
  })
}

async function fireBackInStockEvent(
  apiKey: string, email: string,
  variantData: { productId: string; productName: string; variantId: string; variantName: string; sku?: string; price?: number; url?: string; imageUrl?: string },
): Promise<FetchResult> {
  return klaviyoFetch(apiKey, "POST", "/events/", {
    data: {
      type: "event", attributes: {
        properties: {
          ProductID: variantData.productId, ProductName: variantData.productName,
          VariantId: variantData.variantId, VariantName: variantData.variantName,
          SKU: variantData.sku, Price: variantData.price, URL: variantData.url, ImageURL: variantData.imageUrl,
        },
        metric: { data: { type: "metric", attributes: { name: "Back in Stock" } } },
        profile: { data: { type: "profile", attributes: { email } } },
      },
    },
  })
}

export async function syncVariantInventoryToKlaviyo(container: any, inventoryItemId: string): Promise<void> {
  const logger = container.resolve("logger")
  const apiKey = process.env.KLAVIYO_PRIVATE_KEY
  if (!apiKey) { logger.warn("[Klaviyo sync] KLAVIYO_PRIVATE_KEY not set, skipping"); return }

  const query = container.resolve("query")

  let variantIds: string[] = []
  try {
    const { data: links } = await query.graph({
      entity: "product_variant_inventory_item", fields: ["variant_id"],
      filters: { inventory_item_id: inventoryItemId },
    })
    variantIds = (links as any[]).map((l) => l.variant_id).filter(Boolean)
  } catch (err: any) { logger.warn(`[Klaviyo sync] variant lookup failed: ${err.message}`); return }
  if (variantIds.length === 0) return

  let availableQty = 0
  try {
    const { data: levels } = await query.graph({
      entity: "inventory_level", fields: ["stocked_quantity", "reserved_quantity"],
      filters: { inventory_item_id: inventoryItemId },
    })
    for (const lvl of levels as any[]) {
      availableQty += Math.max(0, (Number(lvl.stocked_quantity) || 0) - (Number(lvl.reserved_quantity) || 0))
    }
  } catch (err: any) { logger.warn(`[Klaviyo sync] inventory_level read failed: ${err.message}`); return }

  let variantsData: any[] = []
  if (availableQty > 0) {
    try {
      const { data: vData } = await query.graph({
        entity: "product_variant",
        fields: ["id", "title", "sku", "product.id", "product.title", "product.handle", "product.thumbnail"],
        filters: { id: variantIds },
      })
      variantsData = vData as any[]
    } catch {}
  }

  const storefrontUrl = process.env.STOREFRONT_URL || "https://www.peptidesfarma.com"

  for (const variantId of variantIds) {
    const previousQty = await getCatalogVariantInventory(apiKey, variantId)
    const patchResult = await patchCatalogVariantInventory(apiKey, variantId, availableQty)
    if (!patchResult.ok) { logger.warn(`[Klaviyo sync] PATCH failed for ${variantId} (${patchResult.status})`); continue }
    logger.info(`[Klaviyo sync] ${variantId}: previous=${previousQty} → new=${availableQty}`)

    const wasOutOfStock = previousQty === 0
    const nowInStock = availableQty > 0
    if (!wasOutOfStock || !nowInStock) continue

    let subscribers: string[] = []
    try { subscribers = await getSubscribers(variantId) } catch (err: any) {
      logger.warn(`[Klaviyo sync] redis getSubscribers failed for ${variantId}: ${err.message}`); continue
    }
    if (subscribers.length === 0) { logger.info(`[Klaviyo sync] no subscribers for ${variantId}, skipping events`); continue }

    const variantInfo = variantsData.find((v) => v.id === variantId)
    const productHandle = variantInfo?.product?.handle
    const productUrl = productHandle ? `${storefrontUrl}/product-page/${productHandle}` : storefrontUrl
    const fullVariantName = variantInfo?.title && variantInfo.title.toLowerCase() !== "default"
      ? `${variantInfo.product?.title || ""} — ${variantInfo.title}`.trim()
      : variantInfo?.product?.title || "Variant"

    let fired = 0
    for (const email of subscribers) {
      const evt = await fireBackInStockEvent(apiKey, email, {
        productId: variantInfo?.product?.id || "", productName: variantInfo?.product?.title || "",
        variantId, variantName: fullVariantName, sku: variantInfo?.sku, url: productUrl,
        imageUrl: variantInfo?.product?.thumbnail,
      })
      if (evt.ok) fired++
      else logger.warn(`[Klaviyo sync] event fire failed for ${email} (${evt.status})`)
    }
    logger.info(`[Klaviyo sync] fired Back in Stock for ${fired}/${subscribers.length} subscribers of ${variantId}`)
    if (fired > 0) { try { await clearSubscribers(variantId) } catch {} }
  }
}
