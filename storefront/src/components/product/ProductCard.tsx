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
  const [learnedOutOfStock, setLearnedOutOfStock] = useState<Set<string>>(new Set())
  const [wishlisted, setWishlisted] = useState(false)
  const [showVariants, setShowVariants] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [popupPos, setPopupPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const [hover, setHover] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const { addItem } = useCart()

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
        setLearnedOutOfStock((prev) => {
          const next = new Set(prev)
          next.add(variantId)
          return next
        })
        if (hasMultipleVariants) setShowVariants(true)
      } else {
        setAddError(true)
        setTimeout(() => setAddError(false), 2500)
      }
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
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
    <div
      className={`relative ${showVariants ? "z-50" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
        {/* Discount bubble */}
        {(() => {
          const discountPct = (product as any).metadata?.discount_percentage || 0
          if (discountPct > 0) return (
            <div style={{
              position: "absolute", top: -8, right: -8, zIndex: 10,
              width: 66, height: 60,
              borderRadius: "47% 53% 52% 48% / 44% 50% 50% 56%",
              background: "var(--pf-ink)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
            }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{discountPct}%</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.04em" }}>off</span>
            </div>
          )
          return null
        })()}

        <Link
          href={`/product-page/${product.handle}`}
          style={{
            display: "block",
            position: "relative",
            aspectRatio: "3 / 4",
            borderRadius: 16,
            overflow: "hidden",
            textDecoration: "none",
          }}
        >
          {/* Image fills entire card area */}
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              style={{ objectPosition: "80% center", transition: "transform 300ms ease", transform: hover ? "scale(1.03)" : "scale(1)" }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "var(--pf-paper-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--pf-text-3)" strokeWidth="0.8"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            </div>
          )}


          {/* Wishlist button */}
          <button
            aria-label="Save"
            onClick={handleWishlistToggle}
            style={{ position: "absolute", right: 10, top: 10, width: 32, height: 32, borderRadius: 999, background: wishlisted ? "#fff" : "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", border: "none", color: wishlisted ? "var(--pf-blue)" : "var(--pf-text-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, transition: "all 180ms ease" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
            </svg>
          </button>
        </Link>

        {/* Info below image */}
        <div style={{ padding: "14px 4px 0", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--pf-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.title}</div>
              {(product as any).subtitle && (
                <div style={{ fontSize: 12, color: "var(--pf-text-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {(product as any).subtitle}
                </div>
              )}
            </div>
            {lowestPrice && (() => {
              const discountPct = (product as any).metadata?.discount_percentage || 0
              const originalPrice = discountPct > 0 ? lowestPrice.amount / (1 - discountPct / 100) : 0
              return (
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--pf-text-3)", marginBottom: 1 }}>From</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {discountPct > 0 && (
                      <span style={{ fontSize: 12, color: "var(--pf-text-3)", textDecoration: "line-through" }}>
                        {formatPrice(Math.round(originalPrice), lowestPrice.currency)}
                      </span>
                    )}
                    <span style={{ color: discountPct > 0 ? "var(--pf-err)" : "var(--pf-ink)", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>
                      {formatPrice(lowestPrice.amount, lowestPrice.currency)}
                    </span>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* View button */}
          <Link
            href={`/product-page/${product.handle}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", height: 38, borderRadius: 999,
              background: "var(--pf-ink)", color: "#fff",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
              fontFamily: "inherit", transition: "opacity 180ms",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            View
          </Link>
        </div>
      </div>

      {/* Variant selector popup */}
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
            const variantOOS = isVariantOutOfStock(v)
            return (
              <button
                key={v.id}
                onClick={() => !variantOOS && addToCart(v.id)}
                disabled={variantOOS}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-colors ${
                  variantOOS
                    ? "bg-[#F5F5F5] cursor-not-allowed opacity-50"
                    : selectedVariant === v.id
                      ? "bg-[#4F8AF7]"
                      : "bg-[#F5F5F5] hover:bg-[#4F8AF7]/10"
                }`}
                style={{ color: variantOOS ? "#999" : selectedVariant === v.id ? "#fff" : "#242424" }}
                onMouseEnter={() => !variantOOS && setSelectedVariant(v.id)}
                onMouseLeave={() => setSelectedVariant(null)}
              >
                <span>{v.title || "Default"}{variantOOS ? " - Out of stock" : ""}</span>
                {v.calculated_price && !variantOOS && (
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
