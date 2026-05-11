import { getCollectionProducts } from "@/lib/data"
import type { Metadata } from "next"
import ProductsPageClient from "@/components/product/ProductsPageClient"

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

export default async function ProductCollectionPage() {
  const products = await getCollectionProducts()

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
      itemListElement: products.slice(0, 20).map((p: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        url: `${SITE_URL}/product/${p.handle}`,
      })),
    },
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <ProductsPageClient products={products} />
    </div>
  )
}
