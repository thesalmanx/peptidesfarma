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
  const [searchQuery, setSearchQuery] = useState("")

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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((p) => p.title.toLowerCase().includes(q))
    }
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
  }, [products, category, sort, searchQuery])

  return (
    <div style={{ background: "#fff" }}>
      {/* Page header */}
      <section style={{ padding: "48px 0 0", background: "#fff" }}>
        <div className="pf-wrap">
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--pf-ink)", margin: "0 0 8px" }}>
            All Products
          </h1>
          <p style={{ color: "var(--pf-text-3)", fontSize: 15, margin: "0 0 28px" }}>
            Premium research peptides with 99%+ purity
          </p>

          {/* Search + Sort row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
            <div style={{ position: "relative", width: 280 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pf-text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", height: 42, paddingLeft: 42, paddingRight: 14, border: "1px solid var(--pf-line)", borderRadius: 10, fontSize: 14, fontFamily: "inherit", color: "var(--pf-ink)", background: "var(--pf-paper)", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--pf-text-3)" }}>Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                style={{ padding: "9px 14px", border: "1px solid var(--pf-line)", borderRadius: 10, background: "#fff", fontFamily: "inherit", fontSize: 13, color: "var(--pf-ink)", cursor: "pointer" }}
              >
                <option value="best">Most Popular</option>
                <option value="asc">Price: low to high</option>
                <option value="desc">Price: high to low</option>
                <option value="az">A to Z</option>
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 28, borderBottom: "1px solid var(--pf-line)" }}>
            {categories.map((c) => (
              <CatPill key={c.id} label={c.label} count={c.count} active={category === c.id} onClick={() => setCategory(c.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section style={{ padding: "32px 0 80px", background: "#fff" }}>
        <div className="pf-wrap">
          <div className="pf-catalog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function CatPill({ label, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 18px",
        borderRadius: 999,
        background: active ? "var(--pf-ink)" : "#fff",
        color: active ? "#fff" : "var(--pf-text-2)",
        border: active ? "1px solid var(--pf-ink)" : "1px solid var(--pf-line)",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: 500,
        transition: "all 0.18s ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  )
}
