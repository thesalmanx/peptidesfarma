import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"
import { getProduct, getCollectionProducts as getAllProducts } from "@/lib/data"
import ProductCard from "@/components/product/ProductCard"
import Link from "next/link"

interface FeaturedProductsBlok extends SbBlokData {
  heading?: string
  subtitle?: string
  highlight?: string
  layout?: string
  products?: any
  max_products_mobile?: number | string
  max_products_desktop?: number | string
}

type ProductType = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  variants: Array<{
    id: string
    title?: string
    inventory_quantity?: number | null
    manage_inventory?: boolean
    allow_backorder?: boolean
    calculated_price?: { calculated_amount: number; currency_code: string }
  }>
}

function mapProduct(p: any): ProductType {
  return {
    id: p.id,
    handle: p.handle || "",
    title: p.title || "",
    thumbnail: p.thumbnail || null,
    variants: (p.variants || []).map((v: any) => ({
      id: v.id,
      title: v.title || undefined,
      inventory_quantity: v.inventory_quantity ?? null,
      manage_inventory: v.manage_inventory ?? false,
      allow_backorder: v.allow_backorder ?? false,
      calculated_price: v.calculated_price
        ? { calculated_amount: v.calculated_price.calculated_amount as number, currency_code: v.calculated_price.currency_code as string }
        : undefined,
    })),
  }
}

function parseHandles(raw: any): string[] {
  if (!raw) return []
  if (typeof raw === "string" && raw.length > 0) {
    return raw.split(",").map((s: string) => s.trim()).filter(Boolean)
  }
  if (Array.isArray(raw)) {
    return raw.map((item: any) => {
      if (typeof item === "string") return item
      if (item?.handle) return item.handle
      return ""
    }).filter(Boolean)
  }
  return []
}

export default async function FeaturedProductsBlock({ blok }: { blok: FeaturedProductsBlok }) {
  const rawHeading = blok.heading || "Featured Products"
  const highlight = blok.highlight || "Products"
  const headingBase = rawHeading.replace(new RegExp(`\\s*${highlight}\\s*$`), "")
  const subtitle =
    blok.subtitle ||
    "Here is the selection of high-purity compounds designed for laboratory research."

  const maxProducts = 8
  const HIDDEN_HANDLES = ["bac-water", "test-order-qa"]
  const handles = parseHandles(blok.products).filter(h => !HIDDEN_HANDLES.includes(h))

  let products: ProductType[] = []

  if (handles.length > 0) {
    const allProducts = await getAllProducts()
    const byHandle = new Map<string, ProductType>()
    for (const p of allProducts) {
      byHandle.set(p.handle, mapProduct(p))
    }
    const seen = new Set<string>()
    for (const h of handles.slice(0, maxProducts)) {
      if (byHandle.has(h) && !seen.has(h)) {
        products.push(byHandle.get(h)!)
        seen.add(h)
        continue
      }
      if (!seen.has(h)) {
        const p = await getProduct(h)
        if (p) {
          products.push(mapProduct(p))
          seen.add(h)
        }
      }
    }
  }

  if (products.length === 0) {
    const all = await getAllProducts()
    products = all.filter(p => !HIDDEN_HANDLES.includes(p.handle)).slice(0, maxProducts).map(mapProduct)
  }

  return (
    <section
      {...storyblokEditable(blok)}
      style={{ padding: "80px 0", background: "var(--pf-paper)" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 700, fontSize: "clamp(28px, 3.5vw, 40px)", letterSpacing: "-0.025em", color: "var(--pf-ink)", margin: "0 0 12px" }}>
            {headingBase}{" "}
            <span style={{ color: "var(--pf-blue)" }}>{highlight}</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--pf-text-2)", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>
            {subtitle}
          </p>
        </div>

        {/* 4-column grid, 8 products */}
        {products.length > 0 ? (
          <>
            {/* Mobile: 2 cols */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {/* Desktop: 4 cols */}
            <div className="hidden md:grid md:grid-cols-4 gap-5">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <p style={{ textAlign: "center", color: "var(--pf-text-3)" }}>No products available</p>
        )}

        {/* View all button */}
        <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
          <Link
            href="/products"
            className="pf-btn pf-btn--primary pf-btn--lg"
            style={{ padding: "0 32px" }}
          >
            View all products
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
