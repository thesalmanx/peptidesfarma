import { getCollectionProducts } from "@/lib/data"
import type { Metadata } from "next"
import ProductGrid from "@/components/product/ProductGrid"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Research Peptides & Compounds",
  description:
    "Browse Peptidesfarma's full catalog of high-purity research peptides and laboratory compounds. 99%+ purity, certificates of analysis, same-day shipping available.",
  openGraph: {
    title: "Research Peptides & Compounds | Peptidesfarma",
    description: "Browse our full catalog of high-purity research peptides and laboratory compounds.",
    url: `${SITE_URL}/products`,
    siteName: "Peptidesfarma",
  },
  alternates: { canonical: `${SITE_URL}/products` },
}

type ProductType = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  collection_id: string | null
  categories?: Array<{ id: string; name: string }>
  variants: Array<{
    id: string
    calculated_price?: { calculated_amount: number; currency_code: string }
    options?: Array<{ value: string; option_title: string }>
  }>
}

export default async function ProductCollectionPage() {
  const products = (await getCollectionProducts()) as ProductType[]

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
    ],
  }

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Research Peptides & Compounds",
    description: "Browse Peptidesfarma's full catalog of high-purity research peptides and laboratory compounds.",
    url: `${SITE_URL}/products`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        url: `${SITE_URL}/product-page/${p.handle}`,
      })),
    },
  }

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <section
        className="product-hero-bg relative flex flex-col justify-center items-center w-full h-[320px] md:h-[300px]"
        style={{ padding: "24px 20px", gap: "12px" }}
      >
        <div className="flex flex-col items-center gap-1 md:gap-5">
          <h1
            className="text-[32px] leading-[56px] md:text-[48px] md:leading-[56px]"
            style={{ fontWeight: 700, textAlign: "center", letterSpacing: "-0.03em" }}
          >
            <span style={{ color: "#0E1A33" }}>Featured </span>
            <span style={{ color: "#4F8AF7" }}>Products</span>
          </h1>
          <p
            className="max-w-[330px] md:max-w-[471px]"
            style={{ fontWeight: 400, fontSize: "18px", lineHeight: "28px", textAlign: "center", letterSpacing: "-0.01em", color: "#44516B" }}
          >
            Here is the selection of high-purity compounds designed for laboratory research.
          </p>
        </div>
      </section>

      <section className="px-5 py-5 md:px-20 md:py-8">
        <div className="max-w-[1280px] mx-auto">
          <ProductGrid products={products} showSeeAll={false} />
        </div>
      </section>
    </div>
  )
}
