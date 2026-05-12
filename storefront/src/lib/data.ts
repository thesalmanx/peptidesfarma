import { unstable_cache } from "next/cache"
import { sdk } from "@/lib/medusa"

// Best-sellers order based on actual sales data.
// Products not in this list appear at the end alphabetically.
// BAC Water excluded — only available as add-on with peptide purchase
const HIDDEN_FROM_PRODUCTS = ["bac-water", "test-order-qa"]

const BEST_SELLERS_ORDER = [
  "glp-3", "wolverine", "ara-290", "tesamorelin",
  "nad", "bpc-157", "epithalon", "glow", "mt-2",
  "cjc-1295-ipamorelin", "aod-9604", "selank", "glutathione", "dsip-1",
  "kpv-1", "tb-500", "klow", "cagri-10", "igf-1lr3",
  "mots-c", "ss-31", "semax", "pt-141", "slu-pp-332",
  "5-amino-1mq", "dihexa",
]

function sortByBestSellers<T extends { handle: string }>(products: T[]): T[] {
  const orderMap = new Map(BEST_SELLERS_ORDER.map((h, i) => [h, i]))
  return [...products].sort((a, b) => {
    const ia = orderMap.get(a.handle) ?? 999
    const ib = orderMap.get(b.handle) ?? 999
    return ia - ib
  })
}

export const getRegionId = unstable_cache(
  async (): Promise<string | undefined> => {
    try {
      const { regions } = await sdk.store.region.list({ limit: 10 })
      const usdRegion = regions?.find((r) => r.currency_code === "usd")
      return usdRegion?.id || regions?.[0]?.id
    } catch {
      return undefined
    }
  },
  ["region-id"],
  { revalidate: 300, tags: ["regions"] }
)

export function getProduct(handle: string) {
  return unstable_cache(
    async () => {
      try {
        const regionId = await getRegionId()
        const { products } = await sdk.store.product.list({
          handle,
          region_id: regionId,
          fields: "+variants.calculated_price,+variants.options,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.images.id,+variants.images.url,+variants.metadata,+metadata",
        })
        return products?.[0] || null
      } catch {
        return null
      }
    },
    ["product-v2", handle],
    { revalidate: 60, tags: ["products", `product-${handle}`] }
  )()
}

export const getCollectionProducts = unstable_cache(
  async () => {
    try {
      const regionId = await getRegionId()

      const { products } = await sdk.store.product.list({
        region_id: regionId,
        fields: "+variants.calculated_price,+categories,+variants.options,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+metadata",
        limit: 50,
      })

      return sortByBestSellers((products || []).filter((p) => !HIDDEN_FROM_PRODUCTS.includes(p.handle || "")).map((p) => ({
        id: p.id,
        handle: p.handle || "",
        title: p.title || "",
        thumbnail: p.thumbnail || null,
        collection_id: p.collection_id || null,
        metadata: (p as any).metadata || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        categories: (
          ((p as any).categories || []) as Array<{ id: string; name: string }>
        ).map((c) => ({
          id: c.id,
          name: c.name,
        })),
        variants: (p.variants || []).map((v) => ({
          id: v.id,
          title: (v as any).title || undefined,
          inventory_quantity: (v as any).inventory_quantity ?? null,
          manage_inventory: (v as any).manage_inventory ?? false,
          allow_backorder: (v as any).allow_backorder ?? false,
          calculated_price: v.calculated_price
            ? {
                calculated_amount: v.calculated_price
                  .calculated_amount as number,
                currency_code: v.calculated_price.currency_code as string,
              }
            : undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options: (
            ((v as any).options || []) as Array<{
              value: string
              option?: { title: string }
            }>
          ).map((opt) => ({
            value: opt.value,
            option_title: opt.option?.title || "",
          })),
        })),
      })))
    } catch (e) {
      console.error("Failed to fetch collection products:", e)
      return []
    }
  },
  ["collection-products"],
  { revalidate: 60, tags: ["products"] }
)

export const getFeaturedProducts = unstable_cache(
  async () => {
    try {
      const regionId = await getRegionId()
      const { products } = await sdk.store.product.list({
        limit: 10,
        region_id: regionId,
        fields: "+variants.calculated_price,+variants.title,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
      })
      return sortByBestSellers(
        (products || [])
          .filter(p => !HIDDEN_FROM_PRODUCTS.includes(p.handle || ""))
          .map(p => ({
            id: p.id,
            handle: p.handle || "",
            title: p.title || "",
            thumbnail: p.thumbnail || null,
            variants: (p.variants || []).map(v => ({
              id: v.id,
              title: (v as any).title || undefined,
              inventory_quantity: (v as any).inventory_quantity ?? null,
              manage_inventory: (v as any).manage_inventory ?? false,
              allow_backorder: (v as any).allow_backorder ?? false,
              calculated_price: v.calculated_price
                ? {
                    calculated_amount: v.calculated_price.calculated_amount as number,
                    currency_code: v.calculated_price.currency_code as string,
                  }
                : undefined,
            })),
          }))
      )
    } catch {
      return []
    }
  },
  ["featured-products"],
  { revalidate: 60, tags: ["products"] }
)

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

async function getAdminToken(): Promise<string | null> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.MEDUSA_ADMIN_EMAIL || "",
        password: process.env.MEDUSA_ADMIN_PASSWORD || "",
      }),
      cache: "no-store",
    })
    if (!res.ok) return null
    const { token } = await res.json()
    return token
  } catch {
    return null
  }
}

/** Returns a map of variantId → available inventory quantity (-1 means unmanaged/unlimited) */
export function getProductStock(productId: string) {
  return unstable_cache(
    async (): Promise<Record<string, number>> => {
      try {
        const token = await getAdminToken()
        if (!token) return {}

        const res = await fetch(
          `${MEDUSA_BACKEND_URL}/admin/products/${productId}?fields=variants.id,variants.manage_inventory,variants.allow_backorder,variants.inventory_items.inventory_item_id`,
          { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
        )
        if (!res.ok) return {}
        const { product } = await res.json()

        const stock: Record<string, number> = {}
        for (const v of product.variants || []) {
          if (!v.manage_inventory) {
            stock[v.id] = -1
            continue
          }
          if (v.allow_backorder) {
            stock[v.id] = -1
            continue
          }
          const invItems = v.inventory_items || []
          if (invItems.length === 0) {
            stock[v.id] = -1
            continue
          }
          let totalAvailable = 0
          for (const link of invItems) {
            const itemRes = await fetch(
              `${MEDUSA_BACKEND_URL}/admin/inventory-items/${link.inventory_item_id}`,
              { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
            )
            if (itemRes.ok) {
              const { inventory_item } = await itemRes.json()
              for (const level of inventory_item.location_levels || []) {
                totalAvailable += level.available_quantity || 0
              }
            }
          }
          stock[v.id] = totalAvailable
        }
        return stock
      } catch {
        return {}
      }
    },
    ["product-stock-v2", productId],
    { revalidate: 30, tags: ["products", `product-${productId}`] }
  )()
}

export const getAllProductHandles = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const { products } = await sdk.store.product.list({
        limit: 100,
        fields: "handle",
      })
      return (products || [])
        .map((p) => p.handle)
        .filter((h): h is string => !!h)
    } catch {
      return []
    }
  },
  ["all-product-handles"],
  { revalidate: 300, tags: ["products"] }
)
