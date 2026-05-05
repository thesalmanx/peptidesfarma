"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { sdk } from "@/lib/medusa"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"

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

interface SearchOverlayProps {
  onClose: () => void
}

function SearchProductCard({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const [adding, setAdding] = useState(false)
  const { addItem } = useCart()

  const lowestPrice = (() => {
    const prices = product.variants
      .map((v) => v.calculated_price?.calculated_amount)
      .filter((p): p is number => p != null)
    if (!prices.length) return null
    return {
      amount: Math.min(...prices),
      currency: product.variants[0]?.calculated_price?.currency_code || "usd",
    }
  })()

  const handleAddToCart = async () => {
    const variant = product.variants[0]
    if (!variant || adding) return
    setAdding(true)
    try {
      await addItem(variant.id, 1)
    } catch {
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col items-start" style={{ gap: "6px", borderRadius: "16px" }}>
      <Link
        href={`/product-page/${product.handle}`}
        onClick={onClose}
        className="relative w-full block overflow-hidden"
        style={{ borderRadius: "12px", background: "#F2F7FD", aspectRatio: "1 / 1" }}
      >
        {product.thumbnail && (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover"
            sizes="200px"
          />
        )}
        <div
          className="absolute flex items-center justify-center"
          style={{
            width: "32px",
            height: "32px",
            right: "8px",
            top: "8px",
            background: "rgba(255, 255, 255, 0.12)",
            borderRadius: "999px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
      </Link>

      <div className="w-full flex items-center justify-between" style={{ gap: "6px" }}>
        <Link
          href={`/product-page/${product.handle}`}
          onClick={onClose}
          className="flex-1 min-w-0"
        >
          <span
            className="block truncate"
            style={{
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.02em",
              color: "#141414",
            }}
          >
            {product.title}
          </span>
        </Link>
        {lowestPrice && (
          <div className="flex flex-col items-start shrink-0">
            <span
              style={{
                fontWeight: 400,
                fontSize: "10px",
                lineHeight: "14px",
                color: "#333333",
              }}
            >
              From
            </span>
            <span
              style={{
                fontWeight: 600,
                fontSize: "15px",
                lineHeight: "20px",
                letterSpacing: "-0.02em",
                color: "#141414",
              }}
            >
              {formatPrice(lowestPrice.amount, lowestPrice.currency)}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={handleAddToCart}
        disabled={adding}
        className="w-full flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
        style={{
          padding: "6px 16px",
          height: "34px",
          background: "#242424",
          borderRadius: "110px",
          fontWeight: 700,
          fontSize: "12px",
          lineHeight: "20px",
          letterSpacing: "-0.01em",
          color: "#FFFFFF",
        }}
      >
        {adding ? "Adding..." : "Add to cart"}
      </button>
    </div>
  )
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [trending, setTrending] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const regionIdRef = useRef<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      window.scrollTo(0, scrollY)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const cachedRid = sessionStorage.getItem("peptidesfarma_region_id")
        let rid = cachedRid || ""
        if (!rid) {
          const { regions } = await sdk.store.region.list({ limit: 10 })
          const usd = regions?.find((r) => r.currency_code === "usd")
          rid = usd?.id || regions?.[0]?.id || ""
          if (rid) sessionStorage.setItem("peptidesfarma_region_id", rid)
        }
        regionIdRef.current = rid

        const { products: initial } = await sdk.store.product.list({
          limit: 8,
          region_id: rid,
          fields: "+variants.calculated_price",
        })
        if (cancelled) return
        const items = (initial || []) as Product[]
        setTrending(items)
        setProducts(items)
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  const search = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)

      if (!q.trim()) {
        setProducts(trending)
        return
      }

      debounceRef.current = setTimeout(async () => {
        try {
          setLoading(true)
          const { products: results } = await sdk.store.product.list({
            q,
            limit: 6,
            region_id: regionIdRef.current || undefined,
            fields: "+variants.calculated_price",
          })
          setProducts((results || []) as Product[])
        } catch {
        } finally {
          setLoading(false)
        }
      }, 300)
    },
    [trending]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    search(val)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          opacity: visible ? 1 : 0,
          transition: "opacity 300ms ease",
        }}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Product search"
        className="fixed inset-x-0 z-50 flex flex-col items-center px-4"
        style={{
          top: "50px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-20px)",
          transition: "opacity 300ms ease, transform 300ms ease",
          pointerEvents: "none",
        }}
      >
        <div
          className="w-full flex items-center h-11 md:h-14 px-4 md:px-6"
          style={{
            maxWidth: "780px",
            gap: "12px",
            background: "#FFFFFF",
            borderRadius: "16px",
            pointerEvents: "auto",
          }}
        >
          <Image src="/icons/search-01.svg" alt="" width={32} height={32} className="shrink-0 w-6 h-6 md:w-8 md:h-8" />
          <label htmlFor="search-input" className="sr-only">Search for products</label>
          <input
            id="search-input"
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for products"
            autoComplete="off"
            className="no-focus-ring flex-1 bg-transparent text-[16px] leading-[24px] md:text-[20px] md:leading-[30px]"
            style={{
              fontWeight: 500,
              color: "#242424",
              border: "none",
              outline: "none",
              boxShadow: "none",
            }}
          />
          <button
            onClick={onClose}
            className="shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Close search"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="#52525B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div
          className="w-full overflow-y-auto px-4 py-4 md:px-6 md:py-5"
          style={{
            maxWidth: "780px",
            maxHeight: "calc(100vh - 180px)",
            marginTop: "10px",
            gap: "20px",
            background: "#FFFFFF",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            pointerEvents: "auto",
          }}
        >
          {!query && trending.length > 0 && (
            <div className="flex flex-col items-start" style={{ gap: "12px" }}>
              <h3
                className="text-[16px] leading-[24px] md:text-[18px] md:leading-[28px]"
                style={{
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "#242424",
                }}
              >
                Trending
              </h3>
              <div className="grid grid-cols-2 md:flex md:flex-row md:flex-wrap md:items-start gap-3">
                {trending.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/product-page/${p.handle}`}
                    onClick={onClose}
                    className="flex items-center justify-center hover:opacity-80 transition-opacity py-1 px-2 md:py-2 md:px-3 h-[26px] md:h-[38px]"
                    style={{
                      gap: "4px",
                      background: "#E9F4F6",
                      borderRadius: "99px",
                    }}
                  >
                    <span
                      className="text-[11px] leading-[18px] md:text-[14px] md:leading-[22px]"
                      style={{
                        fontWeight: 500,
                        letterSpacing: "-0.02em",
                        color: "#141414",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.title}
                    </span>
                    <Image
                      src="/icons/arrow-right-up.svg"
                      alt=""
                      width={20}
                      height={20}
                      className="shrink-0 w-4 h-4 md:w-5 md:h-5"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col items-start" style={{ gap: "12px" }}>
            <h3
              className="text-[16px] leading-[24px] md:text-[18px] md:leading-[28px]"
              style={{
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#242424",
              }}
            >
              {query ? "Search " : "Relevant "}
              <span style={{ color: "#4F8AF7" }}>
                {query ? "Results" : "Products"}
              </span>
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12 w-full">
                <div className="w-6 h-6 border-2 border-[#4F8AF7] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <p
                className="py-8 text-center w-full"
                style={{ fontSize: "16px", color: "#595959" }}
              >
                No products found for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {products.slice(0, 4).map((product, i) => (
                  <div
                    key={product.id}
                    className={i >= 2 ? "hidden md:block" : ""}
                  >
                    <SearchProductCard
                      product={product}
                      onClose={onClose}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
