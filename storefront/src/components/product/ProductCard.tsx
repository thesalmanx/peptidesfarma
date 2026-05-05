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
      <Link
        href={`/product-page/${product.handle}`}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "#fff",
          borderRadius: 14,
          overflow: "hidden",
          border: hover ? "1px solid var(--pf-ink)" : "1px solid var(--pf-line)",
          transition: "transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
          boxShadow: hover ? "0 12px 32px rgba(20,33,61,0.12)" : "0 2px 8px rgba(20,33,61,0.06)",
          textDecoration: "none",
        }}
      >
        {/* Image area */}
        <div className="pf-catalog-card-image" style={{ position: "relative", height: 280, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#FAFBFE" }}>
          {/* Wishlist */}
          <button
            aria-label="Save"
            onClick={handleWishlistToggle}
            style={{ position: "absolute", right: 10, top: 10, width: 30, height: 30, borderRadius: 999, background: wishlisted ? "var(--pf-ink)" : "rgba(20,33,61,0.05)", border: "1px solid rgba(20,33,61,0.08)", color: wishlisted ? "#fff" : "var(--pf-text-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, transition: "all 180ms ease" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
            </svg>
          </button>

          {/* Product image or placeholder */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            ) : (
              <div style={{ width: 100, height: 180, background: "var(--pf-paper-2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--pf-text-3)" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
              </div>
            )}
          </div>
        </div>

        {/* Info area */}
        <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 12, flex: 1, justifyContent: "space-between", borderTop: "1px solid var(--pf-line)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--pf-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.title}</div>
            {lowestPrice && (
              <span style={{ fontFamily: "var(--pf-mono)", fontSize: 11, color: "var(--pf-text-3)", letterSpacing: "0.04em", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                From
                <span style={{ color: "var(--pf-ink)", fontWeight: 600, fontFamily: "var(--pf-sans)", fontSize: 16, letterSpacing: "-0.01em" }}>
                  {formatPrice(lowestPrice.amount, lowestPrice.currency)}
                </span>
              </span>
            )}
          </div>
          <div>

            {/* Add to cart button */}
            {isOutOfStock ? (
              <button disabled className="pf-btn pf-btn--sm" style={{ width: "100%", opacity: 0.4, cursor: "not-allowed", background: "var(--pf-paper-2)", color: "var(--pf-text-3)", border: "1px solid var(--pf-line)" }}>
                Out of stock
              </button>
            ) : (
              <button
                ref={btnRef}
                onClick={handleAddToCart}
                disabled={adding}
                aria-label={`Add ${product.title} to cart`}
                className={`pf-btn pf-btn--sm ${addError ? "" : added ? "" : "pf-btn--primary"}`}
                style={{
                  width: "100%",
                  ...(addError ? { background: "var(--pf-err)", color: "#fff" } : {}),
                  ...(added ? { background: "var(--pf-ok)", color: "#fff" } : {}),
                  cursor: adding ? "wait" : "pointer",
                }}
              >
                {adding ? (
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" /></svg>
                ) : addError ? (
                  "Failed — try again"
                ) : added ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                    Added
                  </>
                ) : (
                  "Add to cart"
                )}
              </button>
            )}
          </div>
        </div>
      </Link>

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
                <span>{v.title || "Default"}{variantOOS ? " — Out of stock" : ""}</span>
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
