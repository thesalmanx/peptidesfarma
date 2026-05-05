"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import ProductHeroClient from "./ProductHeroClient"

interface ProductImage {
  id: string
  url: string
}

interface ProductOption {
  id: string
  title: string
  values: { id: string; value: string }[]
}

interface ProductVariant {
  id: string
  title: string
  options: Record<string, string>
  images?: ProductImage[]
  metadata_image?: string | null
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  }
  inventory_quantity?: number
}

interface HeroContent {
  title: string
  subtitle: string | null
  subscriptionText: string | null
  heroImage?: string | null
}

interface ProductHeroProps {
  product: {
    title: string
    description: string | null
    subtitle: string | null
    handle: string
  }
  images: ProductImage[]
  options: ProductOption[]
  variants: ProductVariant[]
  heroContent?: HeroContent | null
}

function isVariantOutOfStock(v: ProductVariant | undefined): boolean {
  if (!v) return false
  return v.inventory_quantity != null && v.inventory_quantity <= 0
}

function pickInitialOptions(
  options: ProductOption[],
  variants: ProductVariant[]
): Record<string, string> {
  const defaults: Record<string, string> = {}
  options.forEach((o) => {
    if (o.values.length > 0) defaults[o.title] = o.values[0].value
  })

  if (options.length === 1) {
    const option = options[0]
    for (const v of option.values) {
      const variant = variants.find((x) => x.options[option.title] === v.value)
      if (variant && !isVariantOutOfStock(variant)) {
        return { [option.title]: v.value }
      }
    }
    return defaults
  }

  const defaultVariant = variants.find((v) =>
    Object.entries(defaults).every(([k, val]) => v.options[k] === val)
  )
  if (defaultVariant && !isVariantOutOfStock(defaultVariant)) return defaults

  const firstInStock = variants.find(
    (v) => v.inventory_quantity == null || v.inventory_quantity > 0
  )
  return firstInStock ? { ...firstInStock.options } : defaults
}

export default function ProductHero({ product, images, options, variants, heroContent }: ProductHeroProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() =>
    pickInitialOptions(options, variants)
  )

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) =>
        Object.entries(selectedOptions).every(
          ([key, value]) => variant.options[key] === value
        )
      ),
    [variants, selectedOptions]
  )

  const heroImage = heroContent?.heroImage || null
  const fallbackMainImage = heroImage ? { url: heroImage } : (images[1] || images[0])
  const fallbackMobileImage = heroImage ? { url: heroImage } : (images[2] || fallbackMainImage)

  // Prefer metadata.image (the single URL we explicitly set per variant) since
  // variant.images may include legacy links from before per-variant uploads.
  const variantImage =
    selectedVariant?.metadata_image
    || selectedVariant?.images?.[selectedVariant.images.length - 1]?.url
    || null
  const mainImageUrl = variantImage || fallbackMainImage?.url || null
  const mobileImageUrl = variantImage || fallbackMobileImage?.url || null

  return (
    <section className="relative w-full overflow-hidden md:min-h-[calc(100svh-128px)] md:max-h-[900px]">
      <div className="relative max-w-[1440px] mx-auto px-5 md:px-6 lg:px-20 md:min-h-[calc(100svh-128px)] md:max-h-[900px]">

        {mainImageUrl && (
          <div
            className="hidden lg:block absolute z-[1] pointer-events-none"
            style={{
              height: "60%",
              top: "43%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Image
              key={mainImageUrl}
              src={mainImageUrl}
              alt={product.title}
              width={1024}
              height={2336}
              className="object-contain h-full w-auto animate-variant-swap"
              quality={100}
              unoptimized
              priority
            />
          </div>
        )}

        <div className="md:hidden relative z-[2]">
          <ProductHeroClient
            product={{ title: product.title, subtitle: product.subtitle }}
            handle={product.handle}
            options={options}
            variants={variants}
            layout="mobile"
            mobileImageUrl={mobileImageUrl || undefined}
            mobileImageAlt={product.title}
            heroContent={heroContent}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
          />
        </div>

        <div className="hidden md:flex relative z-[2] flex-col justify-between items-start py-12 lg:py-16 gap-10" style={{ minHeight: "calc(100svh - 128px)", maxHeight: "900px" }}>
          {mainImageUrl && (
            <div className="lg:hidden flex justify-center w-full">
              <Image
                key={mainImageUrl}
                src={mainImageUrl}
                alt={product.title}
                width={1024}
                height={2336}
                className="object-contain h-72 w-auto animate-variant-swap"
                quality={100}
                unoptimized
                priority
              />
            </div>
          )}
          <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-stretch w-full flex-1 gap-8 lg:gap-0">
            <ProductHeroClient
              product={{ title: product.title, subtitle: product.subtitle }}
              handle={product.handle}
              options={options}
              variants={variants}
              layout="desktop"
              heroContent={heroContent}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
