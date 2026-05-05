"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"

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

interface Props {
  product: { title: string; description: string | null; handle: string }
  images: ProductImage[]
  options: ProductOption[]
  variants: ProductVariant[]
}

function isOOS(v: ProductVariant): boolean {
  return v.inventory_quantity != null && v.inventory_quantity <= 0
}

export default function ProductDetailClient({ product, images, options, variants }: Props) {
  const { addItem } = useCart()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    options.forEach((o) => { if (o.values.length > 0) defaults[o.title] = o.values[0].value })
    // Pick first in-stock
    const firstInStock = variants.find((v) => !isOOS(v))
    return firstInStock ? { ...firstInStock.options } : defaults
  })
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState("description")
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const selectedVariant = useMemo(
    () => variants.find((v) => Object.entries(selectedOptions).every(([k, val]) => v.options[k] === val)),
    [variants, selectedOptions]
  )

  const mainImage = selectedVariant?.metadata_image || selectedVariant?.images?.[0]?.url || images[0]?.url || null
  const outOfStock = selectedVariant ? isOOS(selectedVariant) : false

  const handleAdd = async () => {
    if (!selectedVariant || adding || added) return
    setAdding(true)
    try {
      await addItem(selectedVariant.id, qty)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {}
    setAdding(false)
  }

  return (
    <div>
      {/* Hero */}
      <section className="pf-starfield pf-pdp-hero" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="pf-wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            {/* Breadcrumb */}
            <div style={{ fontSize: 12, color: "var(--pf-dark-text-2)", marginBottom: 16, fontFamily: "var(--pf-mono)", letterSpacing: "0.08em" }}>
              <Link href="/" style={{ cursor: "pointer", opacity: 0.7 }}>HOME</Link>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
              <Link href="/products" style={{ cursor: "pointer", opacity: 0.7 }}>PRODUCTS</Link>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
              <span style={{ color: "#fff" }}>{product.title.toUpperCase()}</span>
            </div>

            <h1 style={{ fontSize: 64, fontWeight: 600, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 12px", lineHeight: 1 }}>
              {product.title}
            </h1>

            {/* Chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, marginTop: 20 }}>
              <span className="pf-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--pf-blue-soft)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                99%+ purity
              </span>
              <span className="pf-chip">HPLC verified</span>
              <span className="pf-chip">Lot-traced</span>
            </div>

            {/* Specs */}
            <dl className="pf-spec" style={{ color: "var(--pf-dark-text)", marginBottom: 24 }}>
              <dt style={{ color: "var(--pf-dark-text-2)" }}>Form</dt><dd style={{ color: "#fff" }}>Lyophilized powder</dd>
              <dt style={{ color: "var(--pf-dark-text-2)" }}>Storage</dt><dd style={{ color: "#fff" }}>-20 C, dark</dd>
              <dt style={{ color: "var(--pf-dark-text-2)" }}>Tested</dt><dd style={{ color: "#fff" }}>Freedom Diagnostics, 3rd party</dd>
            </dl>
          </div>

          {/* Vial / Image */}
          <div className="pf-pdp-vial" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", inset: "10% 10%", background: "radial-gradient(circle, rgba(79,138,247,0.30), transparent 60%)" }} />
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.title}
                width={400}
                height={600}
                className="object-contain animate-variant-swap"
                style={{ position: "relative", maxHeight: 500, width: "auto", filter: "drop-shadow(0 24px 40px rgba(8,18,42,0.4))" }}
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
      </section>

      {/* BUY BAR */}
      <section style={{ background: "var(--pf-paper)", borderTop: "1px solid var(--pf-line)", borderBottom: "1px solid var(--pf-line)" }}>
        <div className="pf-wrap pf-pdp-buybar" style={{ padding: "32px 0", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <div className="pf-eyebrow" style={{ marginBottom: 8 }}>Select size</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {options.map((opt) =>
                opt.values.map((val) => {
                  const active = selectedOptions[opt.title] === val.value
                  const variant = variants.find((v) => v.options[opt.title] === val.value)
                  const oos = variant ? isOOS(variant) : false
                  return (
                    <button
                      key={val.id}
                      disabled={oos}
                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.title]: val.value }))}
                      style={{
                        padding: "12px 20px", borderRadius: 999,
                        border: `1px solid ${active ? "var(--pf-ink)" : "var(--pf-line-2)"}`,
                        background: active ? "var(--pf-ink)" : "#fff",
                        color: oos ? "var(--pf-text-3)" : active ? "#fff" : "var(--pf-text)",
                        cursor: oos ? "not-allowed" : "pointer", fontFamily: "inherit",
                        textDecoration: oos ? "line-through" : "none",
                        display: "flex", flexDirection: "column", alignItems: "center", minWidth: 80,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{val.value}</span>
                      {variant?.calculated_price && (
                        <span style={{ fontFamily: "var(--pf-mono)", fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                          {formatPrice(variant.calculated_price.calculated_amount, variant.calculated_price.currency_code)}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: outOfStock ? "var(--pf-err)" : "var(--pf-ok)", fontFamily: "var(--pf-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {outOfStock ? "Out of stock" : "In stock, ships today"}
            </div>
          </div>

          <div className="pf-pdp-buybar-right" style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "flex-end" }}>
            <div style={{ textAlign: "right" }}>
              <div className="pf-eyebrow">Price</div>
              <div style={{ fontFamily: "var(--pf-mono)", fontSize: 32, fontWeight: 600 }}>
                {selectedVariant?.calculated_price
                  ? formatPrice(selectedVariant.calculated_price.calculated_amount * qty, selectedVariant.calculated_price.currency_code)
                  : "—"
                }
              </div>
            </div>
            {/* Qty stepper */}
            <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--pf-line)", borderRadius: 999, height: 44 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 42, border: "none", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
              </button>
              <span style={{ minWidth: 32, textAlign: "center", fontSize: 14, fontWeight: 600, fontFamily: "var(--pf-mono)" }}>{qty}</span>
              <button onClick={() => setQty(Math.min(99, qty + 1))} style={{ width: 40, height: 42, border: "none", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
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
