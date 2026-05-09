"use client"

import { storyblokEditable } from "@storyblok/react/rsc"
import { useState, useEffect } from "react"
import ProductCard from "@/components/product/ProductCard"

interface CollectionProductsBlok {
  collection_handle?: string
  title?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function CollectionProductsBlock({ blok }: { blok: CollectionProductsBlok }) {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (!medusaUrl || !pubKey) return

    let url = `${medusaUrl}/store/products?fields=id,handle,title,thumbnail,variants.id,variants.calculated_price`
    if (blok.collection_handle) {
      url += `&collection_handle[]=${blok.collection_handle}`
    }

    fetch(url, { headers: { "x-publishable-api-key": pubKey } })
      .then((r) => r.json())
      .then((data) => {
        if (data.products) setProducts(data.products)
      })
      .catch(() => {})
  }, [blok.collection_handle])

  return (
    <section
      {...storyblokEditable(blok)}
      className="py-12 md:py-16 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      {blok.title && (
        <h2 className="text-2xl md:text-3xl font-bold text-[#141414] tracking-[-0.02em] mb-8">
          {blok.title}
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
