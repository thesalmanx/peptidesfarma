"use client"

import { useState, useMemo } from "react"
import ProductCard from "./ProductCard"
import PfDropdown from "@/components/ui/PfDropdown"

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

  const researchCategories = [
    { id: "tissue", label: "Tissue Repair Research", handles: ["bpc-157", "tb-500", "wolverine", "ghk-cu"] },
    { id: "dermal", label: "Dermal Research", handles: ["ghk-cu", "mt-2", "pt-141", "glow"] },
    { id: "cellular", label: "Cellular Research", handles: ["nad", "mots-c", "ss-31", "epithalon", "glutathione"] },
    { id: "neuro", label: "Neuro Research", handles: ["selank", "semax", "dsip-1", "dihexa", "5-amino-1mq"] },
    { id: "circadian", label: "Circadian Research", handles: ["dsip-1", "epithalon", "selank"] },
  ]

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
      const cat = researchCategories.find((c) => c.id === category)
      if (cat) {
        list = list.filter((p) => cat.handles.includes(p.handle))
      }
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
      <section style={{ padding: "32px 0 0", background: "#fff" }}>
        <div className="pf-wrap">
          <h1 className="text-2xl md:text-4xl" style={{ fontWeight: 700, letterSpacing: "-0.03em", color: "var(--pf-ink)", margin: "0 0 8px" }}>
            All Products
          </h1>
          <p style={{ color: "var(--pf-text-3)", fontSize: 15, margin: "0 0 20px" }}>
            Premium research peptides with 99%+ purity
          </p>

          {/* Search + Sort row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3" style={{ marginBottom: 16 }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--pf-text-3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", height: 42, paddingLeft: 42, paddingRight: 16, border: "1px solid var(--pf-line)", borderRadius: 10, fontSize: 14, fontFamily: "inherit", color: "var(--pf-ink)", background: "#fff", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="hidden sm:inline" style={{ fontSize: 13, color: "var(--pf-text-3)" }}>Sort by:</span>
              <PfDropdown
                value={sort}
                onChange={(v) => setSort(v as SortOption)}
                options={[
                  { value: "best", label: "Most Popular" },
                  { value: "asc", label: "Price: low to high" },
                  { value: "desc", label: "Price: high to low" },
                  { value: "az", label: "A to Z" },
                ]}
              />
            </div>
          </div>

          {/* Category pills — horizontal scroll on mobile */}
          <div className="flex gap-2 pb-5 overflow-x-auto pf-hide-scrollbar" style={{ borderBottom: "1px solid var(--pf-line)" }}>
            {researchCategories.map((c) => (
              <CatPill key={c.id} label={c.label} active={category === c.id} onClick={() => setCategory(category === c.id ? "all" : c.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* Product grid — 2 cols mobile, 4 cols desktop */}
      <section style={{ padding: "24px 0 80px", background: "#fff" }}>
        <div className="pf-wrap">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
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
