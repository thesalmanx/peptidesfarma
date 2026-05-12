"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"
import { toggleWishlistItem, isInWishlist } from "@/lib/wishlist"
import ProductCard from "./ProductCard"
import FaqBlock from "@/components/storyblok/FaqBlock"

interface ProductImage { id: string; url: string }
interface ProductOption { id: string; title: string; values: { id: string; value: string }[] }
interface ProductVariant {
  id: string
  title: string
  options: Record<string, string>
  images?: ProductImage[]
  metadata_image?: string | null
  calculated_price?: { calculated_amount: number; original_amount?: number; currency_code: string }
  inventory_quantity?: number
}

interface RelatedProduct {
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
    calculated_price?: { calculated_amount: number; currency_code: string }
  }>
}

interface Props {
  product: { title: string; description: string | null; handle: string; metadata?: Record<string, unknown> | null }
  images: ProductImage[]
  options: ProductOption[]
  variants: ProductVariant[]
  relatedProducts?: RelatedProduct[]
}

function isOOS(v: ProductVariant): boolean {
  return v.inventory_quantity != null && v.inventory_quantity <= 0
}

export default function ProductDetailClient({ product, images, options, variants, relatedProducts = [] }: Props) {
  const { addItem } = useCart()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    options.forEach((o) => { if (o.values.length > 0) defaults[o.title] = o.values[0].value })
    const firstInStock = variants.find((v) => !isOOS(v))
    return firstInStock ? { ...firstInStock.options } : defaults
  })
  const [qty, setQty] = useState(1)
  const [activeImgIdx, setActiveImgIdx] = useState(0)
  const [tab, setTab] = useState("description")
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setWishlisted(isInWishlist(product.handle))
  }, [product.handle])

  // Sticky mobile CTA — shows when main CTA scrolls out of view
  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      setShowStickyBar(!entry.isIntersecting)
    }, { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const selectedVariant = useMemo(
    () => variants.find((v) => Object.entries(selectedOptions).every(([k, val]) => v.options[k] === val)),
    [variants, selectedOptions]
  )

  const variantImage = selectedVariant?.metadata_image || selectedVariant?.images?.[0]?.url || null
  const mainImage = variantImage || images[activeImgIdx]?.url || images[0]?.url || null
  const outOfStock = selectedVariant ? isOOS(selectedVariant) : false

  const meaningfulVariants = variants.filter((v) => v.title && v.title.toLowerCase() !== "default")
  const hasMultipleVariants = meaningfulVariants.length > 1
  // Bundle discounts
  const bundleTiers = [
    { qty: 1, label: "1 Bottle", discount: 0 },
    { qty: 2, label: "2 Bottles", discount: 3, tag: "POPULAR" },
    { qty: 3, label: "3+ Bottles", discount: 5, tag: "BEST VALUE" },
  ]
  const activeTier = bundleTiers.findLast((t) => qty >= t.qty) || bundleTiers[0]
  const bundleDiscount = activeTier.discount

  const basePrice = selectedVariant?.calculated_price?.calculated_amount ?? 0
  const compareAt = selectedVariant?.calculated_price?.original_amount
  const discountPct = product.metadata?.discount_percentage ? Number(product.metadata.discount_percentage) : 0

  // Effective price per unit after bundle discount
  const effectiveUnitPrice = bundleDiscount > 0 ? basePrice * (1 - bundleDiscount / 100) : basePrice
  const totalPrice = effectiveUnitPrice * qty
  const currencyCode = selectedVariant?.calculated_price?.currency_code || "usd"

  const formattedPrice = formatPrice(totalPrice, currencyCode)

  // Discount badge percentage — from compare-at or metadata
  const hasCompareAt = compareAt != null && compareAt > basePrice
  const hasMetaDiscount = discountPct > 0
  const effectiveDiscountPct = hasCompareAt
    ? Math.round((1 - basePrice / compareAt) * 100)
    : hasMetaDiscount ? discountPct : 0
  const showDiscountBadge = effectiveDiscountPct > 0

  // Strikethrough: show whenever there's any form of discount
  const showStrikethrough = hasCompareAt || hasMetaDiscount || bundleDiscount > 0

  const strikethroughPrice = hasCompareAt
    ? compareAt * qty
    : hasMetaDiscount
      ? (basePrice / (1 - discountPct / 100)) * qty
      : bundleDiscount > 0
        ? basePrice * qty
        : 0

  const handleAdd = async () => {
    if (!selectedVariant || adding || added) return
    setAdding(true)
    setAddError(false)
    try {
      await addItem(selectedVariant.id, qty)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      setAddError(true)
      setTimeout(() => setAddError(false), 2500)
    }
    setAdding(false)
  }

  // No separate mobile return — the desktop layout handles both via responsive flex

  return (
    <div style={{ background: "#fff" }}>
      {/* Breadcrumbs */}
      <div style={{ background: "linear-gradient(180deg, #f7f8fa 0%, #e8eeff 100%)" }}>
      <div className="max-w-[1332px] mx-auto px-4 md:px-16 w-full py-3">
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--pf-text-3)" }}>
          <Link href="/" className="hover:opacity-70 transition-opacity" style={{ textDecoration: "none", color: "var(--pf-text-3)" }}>Home</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pf-text-3)" style={{ opacity: 0.5 }}><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
          <Link href="/products" className="hover:opacity-70 transition-opacity" style={{ textDecoration: "none", color: "var(--pf-text-3)" }}>Products</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pf-text-3)" style={{ opacity: 0.5 }}><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
          <span style={{ color: "var(--pf-ink)", fontWeight: 500 }}>{product.title}</span>
        </nav>
      </div>
      </div>

      {/* NH-style two-column card */}
      <section className="max-w-[1332px] mx-auto px-4 md:px-6 py-4 md:py-6">
        <div style={{ border: "1px solid var(--pf-line)", borderRadius: 16, padding: 16, overflow: "visible" }} className="md:p-[30px] flex flex-col md:flex-row md:items-start gap-6 md:gap-8 lg:gap-10">

          {/* LEFT: Sticky Image Gallery */}
          <div className="flex-1 w-full md:w-1/2 relative">
            {/* Mobile-only title (above image) */}
            <div className="block md:hidden mb-4">
              <h1 style={{ fontFamily: "var(--pf-display)", fontWeight: 700, fontSize: 32, lineHeight: "40px", letterSpacing: "-0.03em", color: "var(--pf-ink)", margin: "0 0 8px" }}>
                {product.title}
              </h1>
              {product.description && (
                <p style={{ fontSize: 14, lineHeight: "22px", color: "var(--pf-text-2)", margin: 0 }}>
                  {product.description.split(".")[0]}.
                </p>
              )}
            </div>
            <div className="md:sticky md:top-[28px]">
              {/* Discount blob — same as ProductCard */}
              {showDiscountBadge && (
                <div style={{
                  position: "absolute", top: -6, right: -6, zIndex: 3,
                  width: 72, height: 66,
                  borderRadius: "47% 53% 52% 48% / 44% 50% 50% 56%",
                  background: "var(--pf-ink)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  pointerEvents: "none",
                }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{effectiveDiscountPct}%</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.04em" }}>off</span>
                </div>
              )}
              {/* Main image with arrows */}
              <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 14, overflow: "hidden", background: "linear-gradient(180deg, #f7f8fa 0%, #eef1f8 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {mainImage ? (
                  <Image key={mainImage} src={mainImage} alt={product.title} fill className="object-contain" style={{ padding: 20, transition: "opacity 300ms ease" }} sizes="(max-width: 768px) 100vw, 618px" priority />
                ) : (
                  <span style={{ fontSize: 14, color: "var(--pf-text-3)" }}>No image</span>
                )}
                {/* Prev/Next arrows */}
                {images.length > 1 && !variantImage && (
                  <>
                    {activeImgIdx > 0 && (
                      <button
                        onClick={() => setActiveImgIdx(activeImgIdx - 1)}
                        aria-label="Previous image"
                        className="hover:opacity-100 transition-opacity"
                        style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 99, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 4, opacity: 0.8 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--pf-ink)"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                      </button>
                    )}
                    {activeImgIdx < images.length - 1 && (
                      <button
                        onClick={() => setActiveImgIdx(activeImgIdx + 1)}
                        aria-label="Next image"
                        className="hover:opacity-100 transition-opacity"
                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 99, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 4, opacity: 0.8 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--pf-ink)"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
                      </button>
                    )}
                  </>
                )}
              </div>
              {/* Thumbnail row */}
              {images.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 14, overflowX: "auto" }} className="pf-hide-scrollbar">
                  {images.map((img, i) => (
                    <button key={img.id} onClick={() => setActiveImgIdx(i)} className="hover:opacity-80 transition-opacity" style={{ flexShrink: 0, width: 68, height: 68, borderRadius: 10, overflow: "hidden", border: activeImgIdx === i && !variantImage ? "2px solid var(--pf-ink)" : "1px solid var(--pf-line)", cursor: "pointer", position: "relative", background: "#f7f8fa", padding: 0, transition: "border-color 200ms ease" }}>
                      <Image src={img.url} alt="" fill className="object-contain" sizes="68px" style={{ padding: 4 }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex-1 flex flex-col w-full md:w-1/2 pt-6 md:pt-2">
            {/* Title (desktop only — mobile title is above image) */}
            <h1 className="hidden md:block" style={{ fontFamily: "var(--pf-display)", fontWeight: 700, fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.1, letterSpacing: "-0.03em", color: "var(--pf-ink)", margin: "0 0 12px" }}>
              {product.title}
            </h1>

            {/* Description */}
            {product.description && (
              <p className="hidden md:block" style={{ fontSize: 16, lineHeight: "26px", color: "var(--pf-text-2)", margin: "0 0 20px" }}>
                {product.description.split(".").slice(0, 2).join(".")}.
              </p>
            )}

            {/* Chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(0,28,134,0.06)", borderRadius: 99, fontSize: 13, fontWeight: 500, color: "var(--pf-ink)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pf-blue)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                99%+ purity
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(0,28,134,0.06)", borderRadius: 99, fontSize: 13, fontWeight: 500, color: "var(--pf-ink)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pf-blue)"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>
                HPLC verified
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(0,28,134,0.06)", borderRadius: 99, fontSize: 13, fontWeight: 500, color: "var(--pf-ink)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pf-blue)"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>
                Same-day shipping
              </span>
            </div>

            {/* Spec table */}
            <dl className="pf-spec" style={{ marginBottom: 24, fontSize: 15 }}>
              <dt style={{ color: "var(--pf-text-3)" }}>Form</dt><dd style={{ color: "var(--pf-ink)" }}>Lyophilized powder</dd>
              <dt style={{ color: "var(--pf-text-3)" }}>Storage</dt><dd style={{ color: "var(--pf-ink)" }}>-20 C, dark</dd>
              <dt style={{ color: "var(--pf-text-3)" }}>Tested</dt><dd style={{ color: "var(--pf-ink)" }}>Freedom Diagnostics, 3rd party</dd>
            </dl>

            <div style={{ borderTop: "1px solid var(--pf-line)", paddingTop: 20 }}>
              {/* Variant selector */}
              {hasMultipleVariants && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "var(--pf-text-3)", marginBottom: 8 }}>Dosage</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {options.map((opt) => opt.values.map((val) => {
                      const active = selectedOptions[opt.title] === val.value
                      const variant = variants.find((v) => v.options[opt.title] === val.value)
                      const oos = variant ? isOOS(variant) : false
                      return (
                        <button key={val.id} disabled={oos} onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.title]: val.value }))}
                          className="hover:border-[var(--pf-ink)]"
                          style={{ height: 42, padding: "0 22px", borderRadius: 10, border: active ? "2px solid var(--pf-ink)" : "1.5px solid var(--pf-line)", background: active ? "var(--pf-ink)" : "#fff", color: active ? "#fff" : "var(--pf-ink)", cursor: oos ? "not-allowed" : "pointer", fontFamily: "inherit", textDecoration: oos ? "line-through" : "none", fontSize: 14, fontWeight: 600, transition: "all 200ms ease", opacity: oos ? 0.35 : 1 }}>
                          {val.value}
                        </button>
                      )
                    }))}
                  </div>
                </div>
              )}

              {/* Bundle & Save */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "var(--pf-text-3)", marginBottom: 8 }}>Bundle &amp; Save</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {bundleTiers.map((tier) => {
                    const actualActive = tier === activeTier
                    return (
                      <button key={tier.qty} onClick={() => setQty(tier.qty)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: actualActive ? "2px solid var(--pf-ink)" : "1px solid var(--pf-line)", background: "#fff", cursor: "pointer", transition: "all 180ms ease", position: "relative", fontFamily: "inherit" }}>
                        {tier.tag && <span style={{ position: "absolute", top: -7, right: 6, padding: "1px 6px", borderRadius: 99, background: tier.tag === "BEST VALUE" ? "#16a34a" : "var(--pf-blue)", color: "#fff", fontSize: 8, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase" }}>{tier.tag}</span>}
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--pf-ink)", whiteSpace: "nowrap" }}>{tier.label}</div>
                          {tier.discount > 0 && <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>{tier.discount}% OFF</div>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "var(--pf-text-3)", marginBottom: 6 }}>Price</p>
                <div style={{ display: "inline-flex", alignItems: "baseline", gap: 8, background: "var(--pf-paper)", padding: "10px 18px", borderRadius: 10 }}>
                  {showStrikethrough && strikethroughPrice > totalPrice && (
                    <span style={{ fontSize: 16, color: "var(--pf-text-3)", textDecoration: "line-through", opacity: 0.5 }}>{formatPrice(strikethroughPrice, currencyCode)}</span>
                  )}
                  <span style={{ fontSize: 28, fontWeight: 700, color: "var(--pf-ink)", letterSpacing: "-0.02em" }}>{formattedPrice}</span>
                  {showDiscountBadge && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", background: "rgba(22,163,106,0.1)", padding: "2px 8px", borderRadius: 99 }}>
                      Save {effectiveDiscountPct}%
                    </span>
                  )}
                </div>
              </div>

              {/* Qty + Add to cart + Wishlist — NH style row */}
              <p style={{ fontSize: 13, color: "var(--pf-text-3)", marginBottom: 8 }}>Quantity</p>
              <div ref={ctaRef} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", border: "2px solid var(--pf-ink)", borderRadius: 10, height: 52 }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 50, border: "none", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <svg width="16" height="16" viewBox="0 0 20 21" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M3 10.574C3 10.0217 3.44772 9.57397 4 9.57397L16 9.57398C16.5523 9.57398 17 10.0217 17 10.574C17 11.1263 16.5523 11.574 16 11.574L4 11.574C3.44772 11.574 3 11.1263 3 10.574Z" fill="var(--pf-ink)" /></svg>
                  </button>
                  <span style={{ minWidth: 24, textAlign: "center", fontSize: 15, fontWeight: 700, color: "var(--pf-ink)" }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(99, qty + 1))} style={{ width: 40, height: 50, border: "none", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <svg width="16" height="16" viewBox="0 0 20 21" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M10 3.57397C10.5523 3.57397 11 4.02169 11 4.57397V9.57397H16C16.5523 9.57397 17 10.0217 17 10.574C17 11.1263 16.5523 11.574 16 11.574H11V16.574C11 17.1263 10.5523 17.574 10 17.574C9.44772 17.574 9 17.1263 9 16.574V11.574H4C3.44772 11.574 3 11.1263 3 10.574C3 10.0217 3.44772 9.57397 4 9.57397L9 9.57397V4.57397C9 4.02169 9.44772 3.57397 10 3.57397Z" fill="var(--pf-ink)" /></svg>
                  </button>
                </div>
                <button disabled={outOfStock || adding} onClick={handleAdd} className="pf-btn pf-btn--primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flex: 1, height: 52, borderRadius: 10, cursor: adding ? "wait" : "pointer", transition: "all 200ms ease", ...(addError ? { background: "#ef4444" } : added ? { background: "#16a34a" } : {}) }}>
                  {adding ? (
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" /></svg>
                  ) : added ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#fff" /></svg>
                  ) : (
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>Add to cart &middot; {formattedPrice}</span>
                  )}
                </button>
                {/* Wishlist heart — NH style */}
                <button
                  onClick={() => { toggleWishlistItem(product.handle); setWishlisted(!wishlisted) }}
                  aria-label="Add to wishlist"
                  style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 10, border: "1px solid var(--pf-line)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 180ms ease" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={wishlisted ? "var(--pf-blue)" : "none"}>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={wishlisted ? "var(--pf-blue)" : "var(--pf-text-3)"} strokeWidth={wishlisted ? 0 : 1.5} />
                  </svg>
                </button>
              </div>
            </div>

            {/* USPs with individual icons */}
            <div style={{ borderTop: "1px solid var(--pf-line)", marginTop: 24, paddingTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--pf-blue)"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>, text: "Same-day shipping · Orders before 2pm CT" },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--pf-blue)"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>, text: "Lot COA included · HPLC third-party tested" },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--pf-blue)"><path d="M7 2v11h3v9l7-12h-4l4-8z" /></svg>, text: "99%+ purity · Pharmaceutical grade" },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--pf-blue)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>, text: "For laboratory research use only" },
              ].map((usp, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ flexShrink: 0, opacity: 0.8 }}>{usp.icon}</span>
                  <span style={{ fontSize: 14, color: "var(--pf-ink)", lineHeight: "20px" }}>{usp.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky mobile Add to Cart bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 z-50 w-full bg-white"
        style={{
          padding: 16,
          borderTop: "1px solid var(--pf-line)",
          transform: showStickyBar ? "translateY(0)" : "translateY(100%)",
          opacity: showStickyBar ? 1 : 0,
          transition: "transform 250ms ease, opacity 250ms ease",
          pointerEvents: showStickyBar ? "auto" : "none",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", border: "2px solid var(--pf-ink)", borderRadius: 10, height: 48 }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 46, border: "none", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 20 21" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M3 10.574C3 10.0217 3.44772 9.57397 4 9.57397L16 9.57398C16.5523 9.57398 17 10.0217 17 10.574C17 11.1263 16.5523 11.574 16 11.574L4 11.574C3.44772 11.574 3 11.1263 3 10.574Z" fill="var(--pf-ink)" /></svg>
            </button>
            <span style={{ minWidth: 20, textAlign: "center", fontSize: 14, fontWeight: 700, color: "var(--pf-ink)" }}>{qty}</span>
            <button onClick={() => setQty(Math.min(99, qty + 1))} style={{ width: 36, height: 46, border: "none", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 20 21" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M10 3.57397C10.5523 3.57397 11 4.02169 11 4.57397V9.57397H16C16.5523 9.57397 17 10.0217 17 10.574C17 11.1263 16.5523 11.574 16 11.574H11V16.574C11 17.1263 10.5523 17.574 10 17.574C9.44772 17.574 9 17.1263 9 16.574V11.574H4C3.44772 11.574 3 11.1263 3 10.574C3 10.0217 3.44772 9.57397 4 9.57397L9 9.57397V4.57397C9 4.02169 9.44772 3.57397 10 3.57397Z" fill="var(--pf-ink)" /></svg>
            </button>
          </div>
          <button disabled={outOfStock || adding} onClick={handleAdd} className="pf-btn pf-btn--primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flex: 1, height: 48, borderRadius: 10, cursor: adding ? "wait" : "pointer" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>Add to cart &middot; {formattedPrice}</span>
          </button>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ padding: "60px 0", background: "#fff" }}>
          <div className="pf-wrap">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 700, fontSize: 36, letterSpacing: "-0.025em", color: "var(--pf-ink)", margin: 0, textAlign: "center" }}>
                You may also <span style={{ color: "var(--pf-blue)" }}>like</span>
              </h2>
              <p style={{ fontSize: 16, color: "var(--pf-text-2)", textAlign: "center", margin: 0 }}>High-purity compounds from our catalog.</p>
            </div>
            <RelatedSlider products={relatedProducts} />
            <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
              <a href="/products" className="pf-btn pf-btn--primary">See all products</a>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <FaqBlock blok={{ component: "faq_section", _uid: "pdp-faq" } as any} />
    </div>
  )
}

function RelatedSlider({ products }: { products: RelatedProduct[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    update()
    const el = scrollRef.current
    if (!el) return
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [update, products.length])

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -scrollRef.current.clientWidth : scrollRef.current.clientWidth, behavior: "smooth" })
  }

  const fadeL = "transparent 0%, black 8%"
  const fadeR = "black 92%, transparent 100%"
  const mask = canLeft && canRight ? `linear-gradient(to right, ${fadeL}, ${fadeR})` : canRight ? `linear-gradient(to right, black 0%, ${fadeR})` : canLeft ? `linear-gradient(to right, ${fadeL}, black 100%)` : "none"

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={scrollRef}
        onScroll={update}
        className="scrollbar-hide"
        style={{ display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory", maskImage: mask, WebkitMaskImage: mask }}
      >
        {products.map((p) => (
          <div key={p.id} style={{ flexShrink: 0, width: "calc(50% - 8px)", scrollSnapAlign: "start" }} className="md:!w-[calc(25%-12px)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      {canLeft && (
        <button onClick={() => scroll("left")} aria-label="Scroll left" style={{ position: "absolute", left: 0, top: "35%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 999, background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--pf-ink)"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
        </button>
      )}
      {canRight && (
        <button onClick={() => scroll("right")} aria-label="Scroll right" style={{ position: "absolute", right: 0, top: "35%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 999, background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--pf-ink)"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
        </button>
      )}
    </div>
  )
}

function TrustRow({ icon, h, s }: { icon: string; h: string; s: string }) {
  const c = "var(--pf-blue)"
  let svg
  if (icon === "truck") svg = <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>
  else if (icon === "shield") svg = <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>
  else svg = <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M7 2v11h3v9l7-12h-4l4-8z" /></svg>

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0 }}>{svg}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{h}</div>
        <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>{s}</div>
      </div>
    </div>
  )
}
