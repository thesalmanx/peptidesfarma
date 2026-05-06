"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"
import ProductCard from "./ProductCard"

interface ProductImage { id: string; url: string }
interface ProductOption { id: string; title: string; values: { id: string; value: string }[] }
interface ProductVariant {
  id: string
  title: string
  options: Record<string, string>
  images?: ProductImage[]
  metadata_image?: string | null
  calculated_price?: { calculated_amount: number; currency_code: string }
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
  product: { title: string; description: string | null; handle: string }
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
  const [tab, setTab] = useState("description")
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const selectedVariant = useMemo(
    () => variants.find((v) => Object.entries(selectedOptions).every(([k, val]) => v.options[k] === val)),
    [variants, selectedOptions]
  )

  const mainImage = selectedVariant?.metadata_image || selectedVariant?.images?.[0]?.url || images[0]?.url || null
  const outOfStock = selectedVariant ? isOOS(selectedVariant) : false

  const meaningfulVariants = variants.filter((v) => v.title && v.title.toLowerCase() !== "default")
  const hasMultipleVariants = meaningfulVariants.length > 1
  const formattedPrice = selectedVariant?.calculated_price
    ? formatPrice(selectedVariant.calculated_price.calculated_amount * qty, selectedVariant.calculated_price.currency_code)
    : null

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

  if (isMobile) {
    return (
      <div>
        {/* Mobile Hero - peptora style */}
        <section className="pf-starfield" style={{ minHeight: "calc(100svh - 104px)", display: "flex", flexDirection: "column", padding: "16px 0 0" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 20px", flexShrink: 0 }}>
            <h1 style={{ fontWeight: 700, fontSize: 40, lineHeight: "48px", letterSpacing: "-0.03em", color: "#fff", textAlign: "center", margin: 0 }}>
              {product.title}
            </h1>
            {product.description && (
              <p style={{ fontWeight: 400, fontSize: 16, lineHeight: "24px", color: "rgba(255,255,255,0.7)", textAlign: "center", margin: 0 }}>
                {product.description.split(".")[0]}.
              </p>
            )}
          </div>

          {mainImage && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, overflow: "hidden", padding: "8px 0" }}>
              <Image
                src={mainImage}
                alt={product.title}
                width={1024}
                height={2336}
                className="object-contain animate-variant-swap"
                style={{ height: "100%", width: "auto", maxWidth: "135vw" }}
                priority
              />
            </div>
          )}

          {formattedPrice && (
            <p style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: "-0.03em", color: "#fff", textAlign: "center", margin: "8px 0 0", flexShrink: 0 }}>
              {formattedPrice}
            </p>
          )}

          {hasMultipleVariants && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 16px", flexShrink: 0 }}>
              {options.map((opt) =>
                opt.values.map((val) => {
                  const active = selectedOptions[opt.title] === val.value
                  const variant = variants.find((v) => v.options[opt.title] === val.value)
                  const oos = variant ? isOOS(variant) : false
                  const label = val.value
                  const isShort = label.length <= 5
                  return (
                    <button
                      key={val.id}
                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.title]: val.value }))}
                      style={{
                        width: isShort ? 50 : "auto",
                        minWidth: isShort ? 50 : 56,
                        height: 50,
                        padding: isShort ? 0 : "0 14px",
                        borderRadius: "50%",
                        background: active ? "#fff" : "rgba(255,255,255,0.08)",
                        border: active ? "1px solid rgba(79,138,247,0.3)" : "1px solid rgba(255,255,255,0.15)",
                        fontSize: 13,
                        fontWeight: 700,
                        color: active ? "var(--pf-ink)" : "rgba(255,255,255,0.45)",
                        opacity: oos ? 0.35 : active ? 1 : 0.6,
                        textDecoration: oos ? "line-through" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 180ms ease",
                        fontFamily: "inherit",
                      }}
                    >
                      {label}
                    </button>
                  )
                })
              )}
            </div>
          )}

          {outOfStock ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "0 16px 16px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 280, height: 48, borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", opacity: 0.6 }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: "rgba(255,255,255,0.7)" }}>Sold out</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 16px 20px", flexShrink: 0 }}>
              <button
                onClick={handleAdd}
                disabled={!selectedVariant || adding}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", maxWidth: 280, height: 48, borderRadius: 999,
                  background: addError ? "var(--pf-err)" : added ? "var(--pf-blue)" : "#fff",
                  border: addError || added ? "none" : "1px solid rgba(0,0,0,0.12)",
                  cursor: adding ? "wait" : "pointer",
                  transition: "all 200ms ease",
                }}
              >
                {adding ? (
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="var(--pf-ink)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" /></svg>
                ) : addError ? (
                  <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Failed, try again</span>
                ) : added ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: "var(--pf-ink)" }}>Add to cart</span>
                )}
              </button>
            </div>
          )}
        </section>

        {/* Details below fold */}
        <section style={{ padding: "40px 0 60px", background: "#fff" }}>
          <div className="pf-wrap">
            <div className="pf-pdp-tabs" style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--pf-line)", marginBottom: 24 }}>
              {([["description", "Description"], ["notes", "Important notes"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} style={{
                  padding: "12px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 14, fontWeight: 600,
                  color: tab === k ? "var(--pf-text)" : "var(--pf-text-3)",
                  borderBottom: tab === k ? "2px solid var(--pf-blue)" : "2px solid transparent",
                  marginBottom: -1,
                }}>{l}</button>
              ))}
            </div>
            {tab === "description" && product.description && (
              <p style={{ fontSize: 16, color: "var(--pf-text-2)", lineHeight: 1.7 }}>{product.description}</p>
            )}
            {tab === "notes" && (
              <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {["For laboratory research use only", "Not for human or veterinary consumption", "Store at -20C away from direct light", "Handle by qualified personnel only", "COA available for download in your account"].map((n, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "var(--pf-text-2)", lineHeight: 1.6 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pf-blue)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="m5 12 5 5L20 7" /></svg>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section style={{ padding: "48px 0 60px", background: "#fff" }}>
            <div className="pf-wrap">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <h2 style={{ fontFamily: "var(--pf-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--pf-ink)", margin: 0, textAlign: "center" }}>
                  You may also <span style={{ color: "var(--pf-blue)" }}>like</span>
                </h2>
                <p style={{ fontSize: 15, color: "var(--pf-text-2)", textAlign: "center", margin: 0 }}>High-purity compounds from our catalog.</p>
              </div>
              <RelatedSlider products={relatedProducts} />
              <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
                <a href="/products" className="pf-btn pf-btn--primary">See all products</a>
              </div>
            </div>
          </section>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Hero + Buy bar in one 100vh dark section */}
      <section className="pf-starfield pf-pdp-hero" style={{ minHeight: "calc(100vh - 104px)", display: "flex", flexDirection: "column", justifyContent: "space-between", paddingTop: 40, paddingBottom: 0 }}>
        {/* Top: product info + vial */}
        <div className="pf-wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--pf-dark-text-2)", marginBottom: 16, marginTop: 66, fontFamily: "var(--pf-mono)", letterSpacing: "0.08em" }}>
              <Link href="/" style={{ cursor: "pointer", opacity: 0.7 }}>HOME</Link>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
              <Link href="/products" style={{ cursor: "pointer", opacity: 0.7 }}>PRODUCTS</Link>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
              <span style={{ color: "#fff" }}>{product.title.toUpperCase()}</span>
            </div>

            <h1 style={{ fontSize: 64, fontWeight: 600, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 12px", lineHeight: 1 }}>
              {product.title}
            </h1>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, marginTop: 20 }}>
              <span className="pf-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--pf-blue-soft)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                99%+ purity
              </span>
              <span className="pf-chip">HPLC verified</span>
              <span className="pf-chip">Lot-traced</span>
            </div>

            <dl className="pf-spec" style={{ color: "var(--pf-dark-text)", marginBottom: 24 }}>
              <dt style={{ color: "var(--pf-dark-text-2)" }}>Form</dt><dd style={{ color: "#fff" }}>Lyophilized powder</dd>
              <dt style={{ color: "var(--pf-dark-text-2)" }}>Storage</dt><dd style={{ color: "#fff" }}>-20 C, dark</dd>
              <dt style={{ color: "var(--pf-dark-text-2)" }}>Tested</dt><dd style={{ color: "#fff" }}>Freedom Diagnostics, 3rd party</dd>
            </dl>
          </div>

          <div className="pf-pdp-vial" style={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.title}
                width={800}
                height={1100}
                className="object-contain animate-variant-swap"
                style={{ width: "158%", height: "auto", maxWidth: "none", marginRight: -361, zIndex: 2, pointerEvents: "none" }}
                priority
              />
            ) : (
              <div style={{ position: "relative", width: 200, height: 370 }}>
                <svg viewBox="0 0 200 370" width="200" height="370" style={{ opacity: 0.8 }}>
                  <rect x="68" y="6" width="64" height="22" rx="3" fill="#2D4174" />
                  <rect x="62" y="26" width="76" height="18" rx="2" fill="#A4B0C5" />
                  <path d="M62 44 L62 320 Q62 340 82 340 L118 340 Q138 340 138 320 L138 44 Z" fill="rgba(159,190,232,0.4)" />
                  <rect x="68" y="118" width="64" height="190" rx="4" fill="#13234A" />
                  <text x="100" y="150" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">{product.title.slice(0, 9)}</text>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: buy bar pinned to bottom of this 100vh section */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
        <div className="pf-wrap pf-pdp-buybar" style={{ padding: "24px 0", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 10 }}>Select size</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {options.map((opt) =>
                opt.values.map((val) => {
                  const active = selectedOptions[opt.title] === val.value
                  const variant = variants.find((v) => v.options[opt.title] === val.value)
                  const oos = variant ? isOOS(variant) : false
                  const isShort = val.value.length <= 5
                  return (
                    <button
                      key={val.id}
                      disabled={oos}
                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.title]: val.value }))}
                      style={{
                        width: isShort ? 72 : "auto",
                        minWidth: isShort ? 72 : 80,
                        height: 72,
                        padding: isShort ? 0 : "0 20px",
                        borderRadius: "50%",
                        border: active ? "2px solid rgba(79,138,247,0.4)" : "1px solid rgba(255,255,255,0.15)",
                        background: active ? "#fff" : "rgba(255,255,255,0.06)",
                        color: active ? "var(--pf-ink)" : "rgba(255,255,255,0.5)",
                        cursor: oos ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        textDecoration: oos ? "line-through" : "none",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        transition: "all 180ms ease",
                        opacity: oos ? 0.35 : 1,
                        boxShadow: active ? "0 0 16px rgba(79,138,247,0.3)" : "none",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>{val.value}</span>
                      {variant?.calculated_price && (
                        <span style={{ fontFamily: "var(--pf-mono)", fontSize: 11, opacity: active ? 1 : 0.7, marginTop: 3 }}>
                          {formatPrice(variant.calculated_price.calculated_amount, variant.calculated_price.currency_code)}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="pf-pdp-buybar-right" style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "flex-end" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 4 }}>Price</div>
              <div style={{ fontFamily: "var(--pf-mono)", fontSize: 32, fontWeight: 700, color: "#fff" }}>
                {selectedVariant?.calculated_price
                  ? formatPrice(selectedVariant.calculated_price.calculated_amount * qty, selectedVariant.calculated_price.currency_code)
                  : "—"
                }
              </div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, height: 44, background: "rgba(255,255,255,0.06)" }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 42, border: "none", background: "transparent", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /></svg>
              </button>
              <span style={{ minWidth: 32, textAlign: "center", fontSize: 15, fontWeight: 700, fontFamily: "var(--pf-mono)", color: "#fff" }}>{qty}</span>
              <button onClick={() => setQty(Math.min(99, qty + 1))} style={{ width: 40, height: 42, border: "none", background: "transparent", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
              </button>
            </div>
            <button
              disabled={outOfStock || adding}
              onClick={handleAdd}
              className="pf-btn pf-btn--primary pf-btn--lg"
            >
              {adding ? "Adding..." : added ? "Added!" : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg>
                  Add to cart
                </>
              )}
            </button>
          </div>
        </div>
        </div>
      </section>

      {/* DETAILS TABS */}
      <section style={{ padding: "60px 0", background: "#fff" }}>
        <div className="pf-wrap pf-pdp-detail" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 60 }}>
          <div>
            <div className="pf-pdp-tabs" style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--pf-line)", marginBottom: 24 }}>
              {([["description", "Description"], ["notes", "Important notes"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} style={{
                  padding: "12px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 14, fontWeight: 600,
                  color: tab === k ? "var(--pf-text)" : "var(--pf-text-3)",
                  borderBottom: tab === k ? "2px solid var(--pf-blue)" : "2px solid transparent",
                  marginBottom: -1,
                }}>{l}</button>
              ))}
            </div>
            {tab === "description" && product.description && (
              <div>
                <p style={{ fontSize: 16, color: "var(--pf-text-2)", lineHeight: 1.7 }}>{product.description}</p>
              </div>
            )}
            {tab === "notes" && (
              <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {["For laboratory research use only", "Not for human or veterinary consumption", "Store at -20C away from direct light", "Handle by qualified personnel only", "COA available for download in your account"].map((n, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "var(--pf-text-2)", lineHeight: 1.6 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pf-blue)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="m5 12 5 5L20 7" /></svg>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div className="pf-card" style={{ padding: 20, marginBottom: 16 }}>
              <div className="pf-eyebrow" style={{ marginBottom: 12 }}>Order details</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <TrustRow icon="truck" h="Same-day shipping" s="Orders before 2pm CT" />
                <TrustRow icon="shield" h="Lot COA included" s="HPLC, third party tested" />
                <TrustRow icon="flask" h="99%+ purity" s="Pharmaceutical grade" />
              </div>
            </div>
            <div className="pf-card" style={{ padding: 20, background: "var(--pf-blue-tint)", borderColor: "transparent" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pf-ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M12 4 2 21h20L12 4Z" /><path d="M12 10v5" /><circle cx="12" cy="18" r="0.8" fill="currentColor" />
                </svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--pf-ink)", marginBottom: 4 }}>For laboratory research only</div>
                  <div style={{ fontSize: 12, color: "var(--pf-text-2)", lineHeight: 1.6 }}>This product is supplied for research use. Not for human or veterinary consumption.</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Important Notes */}
      <section style={{ padding: "0 0 60px", background: "#fff" }}>
        <div className="pf-wrap">
          <div style={{
            padding: 24, gap: 12, display: "flex", flexDirection: "column",
            background: "linear-gradient(95deg, rgba(79,138,247,0.12) 16%, rgba(122,162,255,0.12) 69%), rgba(144,170,220,0.08)",
            border: "2px solid var(--pf-blue-line)",
            borderRadius: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pf-ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4 2 21h20L12 4Z" /><path d="M12 10v5" /><circle cx="12" cy="18" r="0.8" fill="currentColor" />
              </svg>
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--pf-ink)" }}>Important Notes</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "This product is intended for research and laboratory use only.",
                "Must be handled by qualified research professionals.",
                "Store in a cool, dry place away from direct sunlight.",
                "Keep out of reach of children and unauthorized individuals.",
                "Follow all applicable local regulations regarding research compounds.",
              ].map((note, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pf-blue)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
                  </svg>
                  <span style={{ fontSize: 16, lineHeight: "24px", color: "var(--pf-ink)" }}>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ padding: "80px 0", background: "#fff" }}>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pf-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      )}
      {canRight && (
        <button onClick={() => scroll("right")} aria-label="Scroll right" style={{ position: "absolute", right: 0, top: "35%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 999, background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pf-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      )}
    </div>
  )
}

function TrustRow({ icon, h, s }: { icon: string; h: string; s: string }) {
  const c = "var(--pf-blue)"
  let svg
  if (icon === "truck") svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="12" height="10" rx="1" /><path d="M14 10h4l3 3v4h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
  else if (icon === "shield") svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
  else svg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V3" /><path d="M9 3h6" /><path d="M7 14h10" /></svg>

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
