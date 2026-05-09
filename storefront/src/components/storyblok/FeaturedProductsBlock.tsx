"use client"

import { storyblokEditable } from "@storyblok/react/rsc"
import { useState, useEffect } from "react"
import ProductCard from "@/components/product/ProductCard"

interface FeaturedProductsBlok {
  title?: string
  subtitle?: string
  product_handles?: string
  limit?: number
  _uid: string
  component: string
  [key: string]: any
}

export default function FeaturedProductsBlock({ blok }: { blok: FeaturedProductsBlok }) {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (!medusaUrl || !pubKey) return

    const limit = blok.limit || 4
    const url = `${medusaUrl}/store/products?limit=${limit}&fields=id,handle,title,thumbnail,variants.id,variants.calculated_price`

    fetch(url, { headers: { "x-publishable-api-key": pubKey } })
      .then((r) => r.json())
      .then((data) => {
        if (data.products) setProducts(data.products)
      })
      .catch(() => {})
  }, [blok.limit])

  return (
    <section
      {...storyblokEditable(blok)}
      className="py-12 md:py-16 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-[#141414] tracking-[-0.02em] mb-2">
        {blok.title || "Featured Products"}
      </h2>
      {blok.subtitle && (
        <p className="text-[15px] leading-[22px] text-[#4A5568] mb-8">
          {blok.subtitle}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
