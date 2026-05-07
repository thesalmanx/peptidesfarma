"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import ProductCard from "@/components/product/ProductCard"
import { getWishlist } from "@/lib/wishlist"

interface Product {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  variants: Array<{
    id: string
    calculated_price?: {
      calculated_amount: number
      currency_code: string
    }
  }>
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWishlistProducts = useCallback(async () => {
    const ids = getWishlist()
    if (ids.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      const { sdk } = await import("@/lib/medusa")

      let regionId: string | undefined
      try {
        const { regions } = await sdk.store.region.list({ limit: 10 })
        const usdRegion = regions?.find((r: { currency_code: string }) => r.currency_code === "usd")
        regionId = usdRegion?.id || regions?.[0]?.id
      } catch {
      }

      const { products: fetched } = await sdk.store.product.list({
        id: ids,
        limit: 50,
        region_id: regionId,
        fields: "+variants.calculated_price",
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setProducts((fetched || []) as any as Product[])
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWishlistProducts()
  }, [fetchWishlistProducts])

  useEffect(() => {
    const onWishlistChange = () => {
      const ids = getWishlist()
      setProducts((prev) => prev.filter((p) => ids.includes(p.id)))
    }
    window.addEventListener("wishlist-change", onWishlistChange)
    return () => window.removeEventListener("wishlist-change", onWishlistChange)
  }, [])

  return (
    <div className="w-full max-w-[1280px] flex flex-col gap-4">
      <div className="flex items-center gap-1 text-[14px] font-medium leading-[22px] tracking-[0.02em] text-[var(--pf-ink)]">
        <Link href="/" className="hover:underline">Home</Link>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.67} stroke="currentColor" className="w-3.5 h-3.5 -rotate-90">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
        <span>Account</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.67} stroke="currentColor" className="w-3.5 h-3.5 -rotate-90">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
        <span>My wishlist</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-[20px] lg:text-[24px] font-semibold leading-[30px] lg:leading-[36px] tracking-[-0.03em] text-[var(--pf-ink)]">
          My Wishlist
        </h1>
        <p className="text-[12px] lg:text-[14px] font-medium leading-[18px] lg:leading-[22px] tracking-[-0.02em] text-[var(--pf-text-2)]">
          Products you&apos;ve saved for later.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--pf-blue)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 border border-[var(--pf-line)] rounded-[24px]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[var(--pf-line)] mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          <p className="text-[16px] font-semibold text-[var(--pf-ink)] mb-1">Your wishlist is empty</p>
          <p className="text-[14px] text-[var(--pf-text-2)] mb-4">Save items you love to your wishlist.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 h-[40px] rounded-[110px] bg-[var(--pf-ink)] text-[14px] font-bold leading-[24px] tracking-[-0.01em] text-white"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
