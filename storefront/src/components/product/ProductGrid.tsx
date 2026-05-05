"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import ProductCard from "./ProductCard"
import Link from "next/link"

interface Product {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  collection_id: string | null
  categories?: Array<{ id: string; name: string }>
  variants: Array<{
    id: string
    calculated_price?: {
      calculated_amount: number
      currency_code: string
    }
    options?: Array<{
      value: string
      option_title: string
    }>
  }>
}

interface ProductGridProps {
  products: Product[]
  showSeeAll?: boolean
}

type SortOption = "popular" | "new" | "name-asc" | "name-desc" | "price-asc" | "price-desc"

const BAR_HEIGHTS = [32, 10, 28, 38, 25, 33, 14, 6, 9, 26, 4, 38, 35, 14, 27, 3, 33, 10, 35, 27, 21, 34, 18, 23, 29, 38, 16, 20, 2, 25]

function deriveCategories(products: Product[]) {
  const map = new Map<string, { id: string; label: string; count: number }>()
  for (const p of products) {
    for (const cat of p.categories || []) {
      const existing = map.get(cat.id)
      if (existing) {
        existing.count++
      } else {
        map.set(cat.id, { id: cat.id, label: cat.name, count: 1 })
      }
    }
  }
  return [
    { id: "all", label: "All products", count: products.length },
    ...Array.from(map.values()),
  ]
}

function deriveSizes(products: Product[]) {
  const sizes = new Set<string>()
  for (const p of products) {
    for (const v of p.variants) {
      for (const opt of v.options || []) {
        if (opt.option_title.toLowerCase() === "size") {
          sizes.add(opt.value)
        }
      }
    }
  }
  return Array.from(sizes)
}

function derivePriceRange(products: Product[]): [number, number] {
  let min = Infinity
  let max = 0
  for (const p of products) {
    for (const v of p.variants) {
      const amount = v.calculated_price?.calculated_amount
      if (amount != null) {
        const dollars = Math.round(amount)
        if (dollars < min) min = dollars
        if (dollars > max) max = dollars
      }
    }
  }
  if (min === Infinity) min = 0
  if (max === 0) max = 100
  return [min, max]
}

function ChevronDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="#242424" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FilterPill({ label, onClick, isOpen }: { label: string; onClick: () => void; isOpen: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2"
      style={{
        padding: "8px 16px",
        height: "40px",
        background: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.24)",
        borderRadius: "110px",
      }}
    >
      <span style={{ fontWeight: 500, fontSize: "14px", lineHeight: "24px", letterSpacing: "-0.01em", color: "#242424" }}>
        {label}
      </span>
      <span style={{ transition: "transform 200ms", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
        <ChevronDown />
      </span>
    </button>
  )
}

function AnimatedCheckbox({ checked }: { checked: boolean }) {
  return (
    <div
      className={`flex items-center justify-center shrink-0 ${checked ? "animate-checkbox-glow" : ""}`}
      style={{
        width: "16px",
        height: "16px",
        background: checked ? "#4F8AF7" : "#FFFFFF",
        border: checked ? "none" : "1px solid rgba(36, 36, 36, 0.56)",
        borderRadius: "4px",
        transition: "background 200ms ease, border 200ms ease",
      }}
    >
      {checked && (
        <svg className="animate-tick" width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}

function PriceSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<"min" | "max" | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const pctMin = ((value[0] - min) / (max - min)) * 100
  const pctMax = ((value[1] - min) / (max - min)) * 100

  const barSplitIndex = Math.round((value[1] - min) / (max - min) * BAR_HEIGHTS.length)

  const handleMove = useCallback(
    (clientX: number) => {
      if (!trackRef.current || !dragging.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const val = Math.round(min + pct * (max - min))

      if (dragging.current === "min") {
        onChange([Math.min(val, value[1] - 1), value[1]])
      } else {
        onChange([value[0], Math.max(val, value[0] + 1)])
      }
    },
    [min, max, value, onChange],
  )

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const onTouchMove = (e: TouchEvent) => {
      if (dragging.current) {
        e.preventDefault()
      }
      handleMove(e.touches[0].clientX)
    }
    const onUp = () => { dragging.current = null }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onUp)
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("touchend", onUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onUp)
    }
  }, [handleMove])

  return (
    <div className="flex flex-col gap-2" style={{ touchAction: "none" }}>
      <div className="flex items-end justify-center gap-[2px] px-3" style={{ height: "38px" }}>
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className={mounted ? "animate-bar" : ""}
            style={{
              width: "3px",
              height: mounted ? `${h}px` : "0px",
              background: i < barSplitIndex ? "#4F8AF7" : "#A3A3A3",
              borderRadius: "1px",
              transition: "background 300ms ease",
              animationDelay: `${i * 20}ms`,
              animationFillMode: "both",
            }}
          />
        ))}
      </div>

      <div ref={trackRef} className="relative mx-3" style={{ height: "16px" }}>
        <div className="absolute top-1/2 -translate-y-1/2 w-full" style={{ height: "2px", background: "#E5E5E5" }} />
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%`, height: "2px", background: "#242424", transition: "left 50ms, width 50ms" }}
        />
        <div
          onMouseDown={() => { dragging.current = "min" }}
          onTouchStart={() => { dragging.current = "min" }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
          style={{ left: `${pctMin}%`, width: "20px", height: "20px", background: "#242424", borderRadius: "99px", transition: "left 50ms" }}
        />
        <div
          onMouseDown={() => { dragging.current = "max" }}
          onTouchStart={() => { dragging.current = "max" }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
          style={{ left: `${pctMax}%`, width: "20px", height: "20px", background: "#242424", borderRadius: "99px", transition: "left 50ms" }}
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <span style={{ fontWeight: 500, fontSize: "14px", lineHeight: "24px", letterSpacing: "-0.01em", color: "#242424" }}>
          ${value[0]}
        </span>
        <span style={{ fontWeight: 500, fontSize: "14px", lineHeight: "24px", letterSpacing: "-0.01em", color: "#242424" }}>
          ${value[1]}
        </span>
      </div>
    </div>
  )
}

export default function ProductGrid({ products, showSeeAll = true }: ProductGridProps) {
  const categories = useMemo(() => deriveCategories(products), [products])
  const sizes = useMemo(() => deriveSizes(products), [products])
  const [priceMin, priceMax] = useMemo(() => derivePriceRange(products), [products])

  const [sort, setSort] = useState<SortOption>("popular")
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["all"])
  const [priceRange, setPriceRange] = useState<[number, number]>([priceMin, priceMax])
  const filterBarRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [mobileFiltersClosing, setMobileFiltersClosing] = useState(false)
  const [mobileSortOpen, setMobileSortOpen] = useState(false)

  const closeMobileFilters = useCallback(() => {
    setMobileFiltersClosing(true)
    setTimeout(() => {
      setMobileFiltersOpen(false)
      setMobileFiltersClosing(false)
    }, 280)
  }, [])

  useEffect(() => {
    if (mobileFiltersOpen) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = "0"
      document.body.style.right = "0"
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
    } else {
      const top = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
      if (top) {
        window.scrollTo(0, parseInt(top, 10) * -1)
      }
    }
    return () => {
      const top = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
      if (top) {
        window.scrollTo(0, parseInt(top, 10) * -1)
      }
    }
  }, [mobileFiltersOpen])

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  useEffect(() => {
    if (!openDropdown && !mobileSortOpen) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-dropdown]")) {
        setOpenDropdown(null)
        setMobileSortOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [openDropdown, mobileSortOpen])

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  const toggleCategory = (id: string) => {
    if (id === "all") {
      setSelectedCategories(["all"])
    } else {
      setSelectedCategories((prev) => {
        const without = prev.filter((c) => c !== "all")
        if (without.includes(id)) {
          const next = without.filter((c) => c !== id)
          return next.length === 0 ? ["all"] : next
        }
        return [...without, id]
      })
    }
  }

  const getLowestPrice = (p: Product) => {
    const prices = p.variants
      .map((v) => v.calculated_price?.calculated_amount)
      .filter((x): x is number => x != null)
    return prices.length ? Math.min(...prices) : Infinity
  }

  const filtered = useMemo(() => {
    let result = products

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((p) => p.title.toLowerCase().includes(q))
    }

    if (!selectedCategories.includes("all")) {
      result = result.filter((p) =>
        (p.categories || []).some((c) => selectedCategories.includes(c.id))
      )
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) =>
          (v.options || []).some(
            (opt) =>
              opt.option_title.toLowerCase() === "size" &&
              selectedSizes.includes(opt.value)
          )
        )
      )
    }

    if (priceRange[0] !== priceMin || priceRange[1] !== priceMax) {
      result = result.filter((p) => {
        const lowest = getLowestPrice(p)
        if (lowest === Infinity) return true
        const dollars = Math.round(lowest)
        return dollars >= priceRange[0] && dollars <= priceRange[1]
      })
    }

    switch (sort) {
      case "name-asc":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title))
        break
      case "name-desc":
        result = [...result].sort((a, b) => b.title.localeCompare(a.title))
        break
      case "price-asc":
        result = [...result].sort((a, b) => getLowestPrice(a) - getLowestPrice(b))
        break
      case "price-desc":
        result = [...result].sort((a, b) => getLowestPrice(b) - getLowestPrice(a))
        break
    }

    return result
  }, [products, sort, selectedCategories, selectedSizes, priceRange, priceMin, priceMax, searchQuery])

  const pillStyle = { fontWeight: 500, fontSize: "14px", lineHeight: "24px", letterSpacing: "-0.01em", color: "#242424" } as const
  const dropdownStyle = {
    position: "absolute" as const,
    top: "calc(100% + 8px)",
    right: 0,
    width: "200px",
    background: "#FFFFFF",
    boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.08)",
    borderRadius: "12px",
    padding: "12px",
    zIndex: 10,
  }

  return (
    <div>
      <div
        className="flex md:hidden items-center justify-between"
        style={{
          padding: "8px 16px",
          height: "56px",
          background: "rgba(0, 0, 0, 0.04)",
          borderRadius: "12px",
        }}
      >
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2.5 5H17.5M5 10H15M7.5 15H12.5" stroke="#242424" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontWeight: 500, fontSize: "14px", lineHeight: "22px", letterSpacing: "0.02em", color: "#242424" }}>
            Filters
          </span>
        </button>

        <div className="relative" data-dropdown>
          <button
            onClick={() => {
              setMobileSortOpen(!mobileSortOpen)
              setOpenDropdown(mobileSortOpen ? null : "mobile-sort")
            }}
            className="flex items-center gap-1"
          >
            <span style={{ fontWeight: 500, fontSize: "14px", lineHeight: "22px", letterSpacing: "0.02em", color: "#242424" }}>
              Sort by
            </span>
            <span style={{ transition: "transform 200ms", transform: mobileSortOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
              <ChevronDown />
            </span>
          </button>
          {mobileSortOpen && (
            <div className="animate-dropdown" style={{ ...dropdownStyle, right: 0, left: "auto", width: "220px", padding: "8px 12px" }}>
              <div className="flex flex-col">
                {[
                  { value: "popular", label: "Most popular" },
                  { value: "new", label: "New arrivals" },
                  { value: "name-asc", label: "Name: A to Z" },
                  { value: "name-desc", label: "Name: Z to A" },
                  { value: "price-asc", label: "Price: Low to High" },
                  { value: "price-desc", label: "Price: High to Low" },
                ].map((opt) => {
                  const checked = sort === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value as SortOption)
                        setMobileSortOpen(false)
                        setOpenDropdown(null)
                      }}
                      className="flex items-center gap-2 w-full text-left"
                      style={{ padding: "8px", height: "40px" }}
                    >
                      <AnimatedCheckbox checked={checked} />
                      <span style={pillStyle}>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className={`absolute inset-0 bg-black/50 ${mobileFiltersClosing ? "animate-backdrop-out" : "animate-backdrop-in"}`}
            onClick={closeMobileFilters}
            onTouchMove={(e) => {
              e.preventDefault()
            }}
          />
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white flex flex-col ${mobileFiltersClosing ? "animate-sheet-down" : "animate-sheet-up"}`}
            style={{ borderRadius: "16px 16px 0 0", maxHeight: "80vh", overscrollBehavior: "contain" }}
          >
            <div className="sticky top-0 z-10 bg-white flex items-center justify-between shrink-0" style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.08)", borderRadius: "16px 16px 0 0" }}>
              <span style={{ fontWeight: 600, fontSize: "18px", lineHeight: "28px", color: "#242424" }}>Filters</span>
              <button onClick={closeMobileFilters}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#242424" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div style={{ padding: "16px 20px" }} className="flex flex-col gap-6 overflow-y-auto flex-1">
              <div>
                <span style={{ fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "#242424" }}>Search</span>
                <div className="relative mt-2">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#242424] opacity-50" viewBox="0 0 20 20" fill="none">
                    <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="outline-none w-full text-[14px] leading-[24px] text-[#242424] placeholder-[#242424]/40"
                    style={{
                      height: "40px",
                      paddingLeft: "32px",
                      paddingRight: "12px",
                      background: "rgba(0, 0, 0, 0.04)",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: "12px",
                    }}
                  />
                </div>
              </div>

              {categories.length > 1 && (
              <div>
                <span style={{ fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "#242424" }}>Category</span>
                <div className="flex flex-col mt-2">
                  {categories.map((cat) => {
                    const checked = selectedCategories.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className="flex items-center gap-2 w-full text-left"
                        style={{ padding: "8px 0", height: "40px" }}
                      >
                        <AnimatedCheckbox checked={checked} />
                        <span style={pillStyle}>
                          {cat.label} ({cat.count})
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              )}

              {sizes.length > 0 && (
              <div>
                <span style={{ fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "#242424" }}>Size</span>
                <div className="flex flex-col mt-2">
                  {sizes.map((size) => {
                    const checked = selectedSizes.includes(size)
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className="flex items-center gap-2 w-full text-left"
                        style={{ padding: "8px 0", height: "40px" }}
                      >
                        <AnimatedCheckbox checked={checked} />
                        <span style={pillStyle}>{size}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              )}

              <div>
                <span style={{ fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "#242424" }}>Price</span>
                <div className="mt-3" style={{ maxWidth: "260px" }}>
                  <PriceSlider min={priceMin} max={priceMax} value={priceRange} onChange={setPriceRange} />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white shrink-0" style={{ padding: "16px 20px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
              <button
                onClick={closeMobileFilters}
                className="w-full flex items-center justify-center"
                style={{
                  height: "48px",
                  background: "#4F8AF7",
                  borderRadius: "110px",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "#FFFFFF",
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {(() => {
        const activeFilters: { label: string; onRemove: () => void }[] = []
        selectedCategories
          .filter((c) => c !== "all")
          .forEach((catId) => {
            const cat = categories.find((c) => c.id === catId)
            if (cat) {
              activeFilters.push({
                label: cat.label,
                onRemove: () =>
                  setSelectedCategories((prev) => {
                    const next = prev.filter((c) => c !== catId)
                    return next.length === 0 ? ["all"] : next
                  }),
              })
            }
          })
        selectedSizes.forEach((size) => {
          activeFilters.push({
            label: size,
            onRemove: () => setSelectedSizes((prev) => prev.filter((s) => s !== size)),
          })
        })
        if (priceRange[0] !== priceMin || priceRange[1] !== priceMax) {
          activeFilters.push({
            label: `$${priceRange[0]} – $${priceRange[1]}`,
            onRemove: () => setPriceRange([priceMin, priceMax]),
          })
        }
        if (sort !== "popular") {
          const sortLabels: Record<string, string> = {
            "name-asc": "Name: A to Z",
            new: "New arrivals",
            "name-desc": "Name: Z to A",
            "price-asc": "Price: Low to High",
            "price-desc": "Price: High to Low",
          }
          activeFilters.push({
            label: sortLabels[sort] || sort,
            onRemove: () => setSort("popular"),
          })
        }
        if (searchQuery.trim()) {
          activeFilters.push({
            label: `"${searchQuery.trim()}"`,
            onRemove: () => setSearchQuery(""),
          })
        }
        const resetAll = () => {
          setSelectedCategories(["all"])
          setSelectedSizes([])
          setPriceRange([priceMin, priceMax])
          setSort("popular")
          setSearchQuery("")
        }

        return (
          <div
            ref={filterBarRef}
            className="hidden md:flex items-center justify-between"
            style={{
              padding: "8px 16px",
              height: "56px",
              background: "rgba(0, 0, 0, 0.04)",
              borderRadius: "12px",
              marginBottom: "24px",
            }}
          >
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <span style={pillStyle} className="shrink-0">Products</span>
              {activeFilters.length > 0 && (
                <>
                  <div className="w-px h-5 bg-[#242424]/20 shrink-0" />
                  {activeFilters.map((filter, i) => (
                    <button
                      key={filter.label}
                      onClick={filter.onRemove}
                      className="flex items-center justify-center gap-[5px] shrink-0"
                      style={{
                        padding: "2px 10px",
                        height: "28px",
                        background: "#FFFFFF",
                        border: "1px solid rgba(0, 0, 0, 0.20)",
                        borderRadius: "110px",
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: "12px", lineHeight: "20px", letterSpacing: "-0.01em", color: "#242424" }}>
                        {filter.label}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4L12 12" stroke="#242424" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ))}
                  <button
                    onClick={resetAll}
                    className="shrink-0"
                    style={{
                      fontWeight: 500,
                      fontSize: "12px",
                      lineHeight: "20px",
                      letterSpacing: "-0.01em",
                      textDecorationLine: "underline",
                      color: "#242424",
                      opacity: 0.6,
                    }}
                  >
                    Reset
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="relative flex items-center">
                <svg className="absolute left-3 w-4 h-4 text-[#242424] opacity-50 pointer-events-none" viewBox="0 0 20 20" fill="none">
                  <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="no-focus-ring outline-none text-[14px] leading-[24px] tracking-[-0.01em] text-[#242424] placeholder-[#242424]/40"
                  style={{
                    height: "36px",
                    width: "280px",
                    paddingLeft: "32px",
                    paddingRight: "12px",
                    background: "#FFFFFF",
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    borderRadius: "110px",
                  }}
                />
              </div>

              {categories.length > 1 && (
              <div className="relative" data-dropdown>
                <FilterPill label="Category" onClick={() => toggleDropdown("category")} isOpen={openDropdown === "category"} />
                {openDropdown === "category" && (
                  <div className="animate-dropdown" style={dropdownStyle}>
                    <span style={{ fontWeight: 500, fontSize: "18px", lineHeight: "30px", letterSpacing: "-0.01em", color: "#242424" }}>
                      Category
                    </span>
                    <div className="flex flex-col mt-2">
                      {categories.map((cat) => {
                        const checked = selectedCategories.includes(cat.id)
                        return (
                          <button
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            className="flex items-center gap-2 w-full text-left"
                            style={{ padding: "8px", height: "40px" }}
                          >
                            <AnimatedCheckbox checked={checked} />
                            <span style={pillStyle}>
                              {cat.label} ({cat.count})
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              )}

              {sizes.length > 0 && (
              <div className="relative" data-dropdown>
                <FilterPill label="Size" onClick={() => toggleDropdown("size")} isOpen={openDropdown === "size"} />
                {openDropdown === "size" && (
                  <div className="animate-dropdown" style={{ ...dropdownStyle, padding: "8px 12px" }}>
                    <span style={{ fontWeight: 500, fontSize: "18px", lineHeight: "30px", letterSpacing: "-0.01em", color: "#242424" }}>
                      Size
                    </span>
                    <div className="flex flex-col mt-2">
                      {sizes.map((size) => {
                        const checked = selectedSizes.includes(size)
                        return (
                          <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className="flex items-center gap-2 w-full text-left"
                            style={{ padding: "8px", height: "40px" }}
                          >
                            <AnimatedCheckbox checked={checked} />
                            <span style={pillStyle}>{size}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              )}

              <div className="relative" data-dropdown>
                <FilterPill label="Price" onClick={() => toggleDropdown("price")} isOpen={openDropdown === "price"} />
                {openDropdown === "price" && (
                  <div className="animate-dropdown" style={dropdownStyle}>
                    <span style={{ fontWeight: 500, fontSize: "18px", lineHeight: "30px", letterSpacing: "-0.01em", color: "#242424" }}>
                      Price
                    </span>
                    <div className="mt-2">
                      <PriceSlider min={priceMin} max={priceMax} value={priceRange} onChange={setPriceRange} />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" data-dropdown>
                <FilterPill label="Sort by" onClick={() => toggleDropdown("sort")} isOpen={openDropdown === "sort"} />
                {openDropdown === "sort" && (
                  <div className="animate-dropdown" style={{ ...dropdownStyle, padding: "8px 12px" }}>
                    <div className="flex flex-col">
                      {[
                        { value: "popular", label: "Most popular" },
                        { value: "new", label: "New arrivals" },
                        { value: "name-asc", label: "Name: A to Z" },
                        { value: "name-desc", label: "Name: Z to A" },
                        { value: "price-asc", label: "Price: Low to High" },
                        { value: "price-desc", label: "Price: High to Low" },
                      ].map((opt) => {
                        const checked = sort === opt.value
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setSort(opt.value as SortOption)}
                            className="flex items-center gap-2 w-full text-left"
                            style={{ padding: "8px", height: "40px" }}
                          >
                            <AnimatedCheckbox checked={checked} />
                            <span style={pillStyle}>{opt.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {showSeeAll && (
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="btn-primary group inline-flex items-center rounded-[110px] py-4 h-16 text-xl font-bold leading-[30px] tracking-[-0.01em] text-white hover:opacity-90 transition-opacity"
            style={{ padding: "16px 32px 16px 24px" }}
          >
            See all products
            <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}
