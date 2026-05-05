"use client"

import { useState, useMemo } from "react"
import ProductCard from "./ProductCard"

interface Product {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  collection_id?: string | null
  categories?: Array<{ id: string; name: string }>
  variants: Array<{
    id: string
    calculated_price?: { calculated_amount: number; currency_code: string }
    options?: Array<{ value: string; option_title: string }>
  }>
}

type SortOption = "best" | "az" | "asc" | "desc"

export default function ProductsPageClient({ products }: { products: Product[] }) {
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState<SortOption>("best")

  // Derive categories from products
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; label: string; count: number }>()
    for (const p of products) {
      for (const cat of p.categories || []) {
        const existing = map.get(cat.id)
        if (existing) existing.count++
        else map.set(cat.id, { id: cat.id, label: cat.name, count: 1 })
      }
    }
    return Array.from(map.values())
  }, [products])

  const getLowestPrice = (p: Product) => {
    const prices = p.variants.map((v) => v.calculated_price?.calculated_amount).filter((x): x is number => x != null)
    return prices.length ? Math.min(...prices) : Infinity
  }

  const filtered = useMemo(() => {
    let list = products
    if (category !== "all") {
      list = list.filter((p) => (p.categories || []).some((c) => c.id === category))
    }
    const sorted = [...list]
    switch (sort) {
      case "az": sorted.sort((a, b) => a.title.localeCompare(b.title)); break
      case "asc": sorted.sort((a, b) => getLowestPrice(a) - getLowestPrice(b)); break
      case "desc": sorted.sort((a, b) => getLowestPrice(b) - getLowestPrice(a)); break
    }
    return sorted
  }, [products, category, sort])

  return (
    <div>
      {/* Page header */}
      <section className="pf-starfield" style={{ padding: "60px 0 48px" }}>
        <div className="pf-wrap">
          <div className="pf-eyebrow pf-eyebrow--dark" style={{ marginBottom: 14 }}>
            Catalog &middot; {products.length} compounds
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 600, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 14px", lineHeight: 1.02 }}>
            Research-grade <span style={{ color: "var(--pf-blue-soft)" }}>peptides</span>
          </h1>
          <p style={{ color: "var(--pf-dark-text-2)", fontSize: 16, maxWidth: 640, margin: 0, lineHeight: 1.6 }}>
            Lot-traced, HPLC-verified compounds. Every order ships with the lot-specific COA. Filter by goal or size below.
          </p>
        </div>
      </section>

      {/* Sticky filter bar */}
      <section style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--pf-paper)", borderBottom: "1px solid var(--pf-line)" }}>
        <div className="pf-wrap pf-filter-bar" style={{ padding: "16px 0", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div className="pf-filter-bar-pills" style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
            <CatPill label="All" count={products.length} active={category === "all"} onClick={() => setCategory("all")} />
            {categories.map((c) => (
              <CatPill key={c.id} label={c.label} count={c.count} active={category === c.id} onClick={() => setCategory(c.id)} />
            ))}
          </div>
          <div className="pf-filter-bar-selects" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              style={{
                padding: "9px 14px",
                border: "1px solid var(--pf-line)",
                borderRadius: 999,
                background: "#fff",
                fontFamily: "inherit",
                fontSize: 13,
                color: "var(--pf-ink)",
                cursor: "pointer",
              }}
            >
              <option value="best">Best sellers</option>
              <option value="asc">Price: low to high</option>
              <option value="desc">Price: high to low</option>
              <option value="az">A to Z</option>
            </select>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section style={{ padding: "40px 0 80px", background: "var(--pf-paper)" }}>
        <div className="pf-wrap">
          <div style={{ fontSize: 13, color: "var(--pf-text-3)", marginBottom: 24, fontFamily: "var(--pf-mono)" }}>
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </div>
          <div className="pf-catalog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function CatPill({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 16px",
        borderRadius: 999,
        background: active ? "var(--pf-ink)" : "#fff",
        color: active ? "#fff" : "var(--pf-text-2)",
        border: active ? "1px solid var(--pf-ink)" : "1px solid var(--pf-line)",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 500,
        transition: "all 0.18s ease",
        whiteSpace: "nowrap",
      }}
    >
      <span>{label}</span>
      <span style={{ fontFamily: "var(--pf-mono)", fontSize: 11, opacity: active ? 0.7 : 0.55 }}>{count}</span>
    </button>
  )
}
