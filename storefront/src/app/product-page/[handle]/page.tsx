import { getProduct, getAllProductHandles, getCollectionProducts } from "@/lib/data"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ProductDetailClient from "@/components/product/ProductDetailClient"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

export const revalidate = 3600

interface PageProps {
  params: Promise<{ handle: string }>
}

export async function generateStaticParams() {
  const handles = await getAllProductHandles()
  return handles.map((handle) => ({ handle }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) return { title: "Product Not Found" }

  const title = product.title || "Product"
  const rawDesc = product.description || ""
  const firstSentence = rawDesc.split(/[.\n]/).find((s) => s.trim().length > 20)?.trim()
  const seoDescription = firstSentence
    ? `${firstSentence}. 99%+ purity, lab-tested with COA. Buy from Peptidesfarma.`
    : `${title} - high-purity research compound from Peptidesfarma. 99%+ purity with certificate of analysis included.`
  const metaDescription = seoDescription.length > 160 ? seoDescription.slice(0, 157) + "..." : seoDescription
  const image = product.images?.[0]?.url || product.thumbnail || null
  const url = `${SITE_URL}/product-page/${handle}`

  return {
    title: `${title} Peptide | Research Grade`,
    description: metaDescription,
    openGraph: {
      title: `${title} | Peptidesfarma`,
      description: metaDescription,
      url,
      type: "article",
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: `${title} - Peptidesfarma` }] } : {}),
    },
    alternates: { canonical: url },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) notFound()

  const productImages = (product.images || []).map((img) => ({ id: img.id, url: img.url }))
  // If no images but thumbnail exists, use thumbnail as the image
  const images = productImages.length > 0 ? productImages : (product.thumbnail ? [{ id: "thumb", url: product.thumbnail }] : [])

  const options = (product.options || []).map((opt) => ({
    id: opt.id,
    title: opt.title,
    values: (opt.values || []).map((v) => ({ id: v.id, value: v.value })),
  }))

  const variants = (product.variants || []).map((v) => {
    const optionsMap: Record<string, string> = {}
    if (Array.isArray(v.options)) {
      for (const opt of v.options as Array<{ value: string; option?: { title: string } }>) {
        if (opt.option?.title) optionsMap[opt.option.title] = opt.value
      }
    }
    const variantImages = (((v as unknown as Record<string, unknown>).images as Array<{ id: string; url: string }> | undefined) || []).map((img) => ({ id: img.id, url: img.url }))
    const variantMetadataImage = ((v as unknown as Record<string, unknown>).metadata as Record<string, unknown> | undefined)?.image
    return {
      id: v.id,
      title: v.title || "",
      options: optionsMap,
      images: variantImages,
      metadata_image: typeof variantMetadataImage === "string" ? variantMetadataImage : null,
      calculated_price: v.calculated_price
        ? { calculated_amount: v.calculated_price.calculated_amount as number, currency_code: v.calculated_price.currency_code as string }
        : undefined,
      inventory_quantity: (v as unknown as Record<string, unknown>).manage_inventory
        ? ((v as unknown as Record<string, unknown>).inventory_quantity as number) ?? 0
        : undefined,
    }
  })

  const lowestPrice = variants.map((v) => v.calculated_price?.calculated_amount).filter((p): p is number => p != null).sort((a, b) => a - b)[0]

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || `${product.title} - high-purity research compound from Peptidesfarma.`,
    image: product.images?.[0]?.url || product.thumbnail || undefined,
    url: `${SITE_URL}/product-page/${handle}`,
    sku: handle,
    brand: { "@type": "Brand", name: "Peptidesfarma" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: lowestPrice?.toFixed(2) || "0",
      highPrice: variants.map((v) => v.calculated_price?.calculated_amount).filter((p): p is number => p != null).sort((a, b) => b - a)[0]?.toFixed(2) || "0",
      offerCount: variants.length,
      availability: variants.some((v) => v.inventory_quantity !== 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  }

  // Fetch related products (all products minus current, take 4)
  const allProducts = await getCollectionProducts().catch(() => [])
  const relatedProducts = allProducts
    .filter((p) => p.handle !== handle)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      thumbnail: p.thumbnail || null,
      variants: (p.variants || []).map((v) => ({
        id: v.id,
        title: v.title || undefined,
        inventory_quantity: (v as any).manage_inventory ? ((v as any).inventory_quantity ?? 0) : undefined,
        manage_inventory: (v as any).manage_inventory,
        allow_backorder: (v as any).allow_backorder,
        calculated_price: v.calculated_price
          ? { calculated_amount: v.calculated_price.calculated_amount as number, currency_code: v.calculated_price.currency_code as string }
          : undefined,
      })),
    }))

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <ProductDetailClient
        product={{
          title: product.title || "",
          description: product.description || null,
          handle: product.handle || "",
        }}
        images={images}
        options={options}
        variants={variants}
        relatedProducts={relatedProducts}
      />
    </div>
  )
}
