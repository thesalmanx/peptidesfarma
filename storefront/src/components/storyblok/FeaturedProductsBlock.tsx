import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"
import { getProduct, getCollectionProducts as getAllProducts } from "@/lib/data"
import ProductCard from "@/components/product/ProductCard"
import ProductSlider from "@/components/product/ProductSlider"
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

  const isGrid = blok.layout === "grid"
  const maxMobile = Number(blok.max_products_mobile) || 8
  const maxDesktop = Number(blok.max_products_desktop) || 8
  const maxProducts = Math.max(maxMobile, maxDesktop)

  // BAC Water is only available as cart add-on, never shown in product listings
  const HIDDEN_HANDLES = ["bac-water", "test-order-qa"]
  const handles = parseHandles(blok.products).filter(h => !HIDDEN_HANDLES.includes(h))

  let products: ProductType[] = []

  if (handles.length > 0) {
    // Fetch all products for fast lookup
    const allProducts = await getAllProducts()
    const byHandle = new Map<string, ProductType>()
    for (const p of allProducts) {
      byHandle.set(p.handle, mapProduct(p))
    }

    // Maintain Storyblok ordering
    const seen = new Set<string>()
    for (const h of handles.slice(0, maxProducts)) {
      if (byHandle.has(h) && !seen.has(h)) {
        products.push(byHandle.get(h)!)
        seen.add(h)
        continue
      }
      // Direct fetch as fallback
      if (!seen.has(h)) {
        const p = await getProduct(h)
        if (p) {
          products.push(mapProduct(p))
          seen.add(h)
        }
      }
    }
  }

  // Fallback to all products if none selected
  if (products.length === 0) {
    const all = await getAllProducts()
    products = all.slice(0, maxProducts).map(mapProduct)
  }

  const mobileProducts = products.slice(0, maxMobile)
  const desktopProducts = products.slice(0, maxDesktop)
  const sliderProducts = products.slice(0, maxProducts)

  return (
    <section
      className="relative py-5 lg:py-6 px-5 lg:px-20 bg-white overflow-hidden"
      {...storyblokEditable(blok)}
    >
      <div className="relative z-10 max-w-[1280px] mx-auto flex flex-col items-center gap-8">
        <div className="flex flex-col items-start md:items-center gap-3 md:gap-5 max-w-[350px] md:max-w-[666px]">
          <h2 className="text-[40px] md:text-[48px] font-bold leading-[48px] md:leading-[56px] tracking-[-0.03em] text-[#14213D] text-left md:text-center">
            {headingBase}{" "}
            <span style={{ background: "linear-gradient(90deg, #4F8AF7 0%, #7AA2FF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {highlight}
            </span>
          </h2>
          <p className="text-[16px] md:text-[18px] font-normal leading-[24px] md:leading-[28px] tracking-[-0.01em] text-[#44516B] text-left md:text-center">
            {subtitle}
          </p>
        </div>

        {sliderProducts.length > 0 ? (
          isGrid ? (
            <>
              <div className="w-full grid grid-cols-2 gap-4 md:hidden">
                {mobileProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="w-full hidden md:grid md:grid-cols-4 gap-4">
                {desktopProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <ProductSlider products={sliderProducts} />
          )
        ) : (
          <p className="text-gray-400 text-center">No products available</p>
        )}

        <Link
          href="/products"
          className="btn-primary group inline-flex items-center justify-center rounded-[110px] h-12 text-base font-bold leading-6 tracking-[-0.01em] text-white hover:opacity-90 transition-opacity"
          style={{ padding: "12px 28px 12px 24px" }}
        >
          See all products
          <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>
      </div>
    </section>
  )
}
