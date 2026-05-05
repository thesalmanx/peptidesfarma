"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"
import { toggleWishlistItem, isInWishlist } from "@/lib/wishlist"

interface ProductCardProps {
  product: {
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
      calculated_price?: {
        calculated_amount: number
        currency_code: string
      }
    }>
  }
}

// Medusa v2 stock-rejection error shapes:
//   message: "Some variant does not have the required inventory"
//   code:    "insufficient_inventory"
// (older Medusa also uses: "not enough stock available for item ...")
// We detect any of them so we can show "Out of stock" instead of the generic
// "Failed — try again". This matters because the storefront only sees
// `inventory_quantity` (stocked), not the derived `available = stocked - reserved`,
// so an item with live reservations looks "in stock" on the card but the backend
// refuses at createLineItem time.
function isStockError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err || "")).toLowerCase()
  const code = typeof (err as any)?.code === "string" ? ((err as any).code as string).toLowerCase() : ""
  if (code.includes("insufficient_inventory") || code.includes("out_of_stock")) return true
  return (
    msg.includes("not enough stock") ||
    msg.includes("insufficient inventory") ||
    msg.includes("insufficient_inventory") ||
    msg.includes("required inventory") ||
    msg.includes("out of stock") ||
    msg.includes("no inventory") ||
    msg.includes("stock available") ||
    msg.includes("does not have sufficient") ||
    msg.includes("does not have the required")
  )
}

export default function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState(false)
  // Variants that we've seen fail with a stock error → treat as out of stock from here on.
  const [learnedOutOfStock, setLearnedOutOfStock] = useState<Set<string>>(new Set())
  const [wishlisted, setWishlisted] = useState(false)
  const [showVariants, setShowVariants] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [popupPos, setPopupPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const { addItem } = useCart()

  // Only show variant selector if there are multiple variants with meaningful names (not "Default")
  const meaningfulVariants = product.variants.filter(
    (v) => v.title && v.title.toLowerCase() !== "default"
  )
  const hasMultipleVariants = meaningfulVariants.length > 1

  const syncWishlist = useCallback(() => {
    setWishlisted(isInWishlist(product.id))
  }, [product.id])

  useEffect(() => {
    syncWishlist()
    window.addEventListener("wishlist-change", syncWishlist)
    return () => window.removeEventListener("wishlist-change", syncWishlist)
  }, [syncWishlist])

  // Close popup on outside click or scroll
  useEffect(() => {
    if (!showVariants) return
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setShowVariants(false)
      }
    }
    const handleScroll = () => setShowVariants(false)
    document.addEventListener("mousedown", handleClick)
    window.addEventListener("scroll", handleScroll, true)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [showVariants])

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlistItem(product.id)
  }

  // A variant is out of stock if EITHER the server said so explicitly OR we learned
  // so from a prior failed add (because storefront only knows stocked_quantity, not
  // available = stocked - reserved).
  const isVariantOutOfStock = (v: ProductCardProps["product"]["variants"][number]): boolean => {
    if (learnedOutOfStock.has(v.id)) return true
    if (!v.manage_inventory) return false
    if (v.allow_backorder) return false
    if (v.inventory_quantity == null) return false
    return v.inventory_quantity <= 0
  }

  const isOutOfStock = product.variants.length > 0 && product.variants.every(isVariantOutOfStock)

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

  const addToCart = async (variantId: string) => {
    if (adding || added) return
    setAdding(true)
    setAddError(false)
    setShowVariants(false)
    try {
      await addItem(variantId, 1)
      setAdding(false)
      setAdded(true)
      setSelectedVariant(null)
      setTimeout(() => setAdded(false), 1800)
    } catch (err) {
      setAdding(false)
      if (isStockError(err)) {
        // Remember this variant is actually out of stock so future clicks show it properly
        setLearnedOutOfStock((prev) => {
          const next = new Set(prev)
          next.add(variantId)
          return next
        })
        // Keep the popup open on variant selectors so the customer sees which one failed
        if (hasMultipleVariants) setShowVariants(true)
      } else {
        setAddError(true)
        setTimeout(() => setAddError(false), 2500)
      }
    }
  }

  const handleAddToCart = () => {
    if (hasMultipleVariants) {
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect()
        setPopupPos({ top: rect.top, left: rect.left, width: rect.width })
      }
      setShowVariants(true)
    } else {
      const variant = product.variants[0]
      if (variant) addToCart(variant.id)
    }
  }

  return (
    <div className={`group flex flex-col gap-2 flex-1 min-w-0 relative text-[#242424] ${showVariants ? "z-50" : ""}`}>
      <Link href={`/product-page/${product.handle}`} className="block relative">
        <div
          className="relative w-full rounded-[16px] overflow-hidden bg-[#F2F7FD]"
          style={{ aspectRatio: "302 / 280" }}
        >
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
          )}
          <button
            onClick={handleWishlistToggle}
            aria-label={wishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
            className={`absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors ${
              wishlisted ? "bg-white hover:bg-white/90" : "bg-white/[0.12] hover:bg-white/20"
            }`}
          >
            {wishlisted ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4F8AF7" stroke="#4F8AF7" strokeWidth={1.5} className="w-4 h-4 md:w-5 md:h-5">
                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-4 h-4 md:w-5 md:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            )}
          </button>
        </div>
      </Link>

      <div className="flex flex-col gap-2" style={{ color: "#141414" }}>
        <div className="flex flex-row justify-center items-center gap-2.5">
          <Link href={`/product-page/${product.handle}`} className="flex-1 min-w-0 hover:text-teal-accent transition-colors">
            <h3 className="text-[16px] md:text-lg font-bold leading-[24px] md:leading-[30px] tracking-[-0.03em] md:tracking-[-0.02em] line-clamp-1" style={{ color: "#141414" }}>
              {product.title}
            </h3>
          </Link>
          {lowestPrice && (
            <div className="flex flex-col justify-center items-start shrink-0">
              <span className="text-[11px] md:text-xs font-normal leading-[14px] md:leading-[18px] text-left" style={{ color: "#333333" }}>From</span>
              <p className="text-[16px] md:text-xl font-semibold leading-[24px] tracking-[-0.03em] md:tracking-[-0.02em] text-left" style={{ color: "#141414" }}>
                {formatPrice(lowestPrice.amount, lowestPrice.currency)}
              </p>
            </div>
          )}
        </div>

        {isOutOfStock ? (
          <button
            disabled
            aria-label={`${product.title} is out of stock`}
            className="flex items-center justify-center w-full h-10 px-6 rounded-[110px] border text-[13px] md:text-sm font-bold leading-6 tracking-[-0.01em] cursor-not-allowed"
            style={{ backgroundColor: "#F5F5F5", borderColor: "#E0E0E0", color: "#999" }}
          >
            Out of stock
          </button>
        ) : (
          <button
            ref={btnRef}
            onClick={handleAddToCart}
            disabled={adding || !product.variants.length}
            aria-label={`Add ${product.title} to cart`}
            className={`group/cart flex items-center justify-center w-full h-10 px-6 rounded-[110px] border text-[13px] md:text-sm font-bold leading-6 tracking-[-0.01em] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-white ${
              addError
                ? "border-red-500 bg-red-500"
                : added
                  ? "border-[#4F8AF7] bg-[#4F8AF7]"
                  : "border-[#242424] bg-[#242424] hover:!bg-white hover:!text-[#242424] hover:!border-[#242424] hover:shadow-[0_0_20px_4px_rgba(17,92,111,0.25),0_0_40px_8px_rgba(17,92,111,0.10)]"
            }`}
          >
            {adding ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
              </svg>
            ) : addError ? (
              <span className="text-[13px]">Failed — try again</span>
            ) : added ? (
              <svg className="w-5 h-5 animate-check-pop" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <>
                Add to cart
                <span className="inline-flex overflow-hidden w-0 group-hover/cart:w-6 group-hover/cart:pl-2 transition-all duration-200 ease-out">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Variant selector popup — rendered as portal to escape overflow containers */}
      {showVariants && popupPos && typeof document !== "undefined" && createPortal(
        <div
          ref={popupRef}
          className="rounded-[16px] border border-[#E0E0E0] shadow-xl p-3 flex flex-col gap-2 animate-dropdown max-h-[50vh] overflow-y-auto"
          style={{
            position: "fixed",
            bottom: `${window.innerHeight - popupPos.top + 8}px`,
            left: `${popupPos.left}px`,
            width: `${popupPos.width}px`,
            zIndex: 9999,
            color: "#242424",
            backgroundColor: "#ffffff",
          }}
        >
          <p className="text-[13px] font-semibold text-[#383637] px-1">Select size</p>
          {meaningfulVariants.map((v) => {
            const variantOutOfStock = isVariantOutOfStock(v)
            return (
              <button
                key={v.id}
                onClick={() => !variantOutOfStock && addToCart(v.id)}
                disabled={variantOutOfStock}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-colors ${
                  variantOutOfStock
                    ? "bg-[#F5F5F5] p-3 cursor-not-allowed opacity-50"
                    : selectedVariant === v.id
                      ? "bg-[#4F8AF7] p-3"
                      : "bg-[#F5F5F5] hover:bg-[#4F8AF7]/10 p-3"
                }`}
                style={{ color: variantOutOfStock ? "#999" : selectedVariant === v.id ? "#fff" : "#242424" }}
                onMouseEnter={() => !variantOutOfStock && setSelectedVariant(v.id)}
                onMouseLeave={() => setSelectedVariant(null)}
              >
                <span>{v.title || "Default"}{variantOutOfStock ? " — Out of stock" : ""}</span>
                {v.calculated_price && !variantOutOfStock && (
                  <span className="font-semibold">
                    {formatPrice(v.calculated_price.calculated_amount, v.calculated_price.currency_code)}
                  </span>
                )}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}
