"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import HeaderCartButton from "./HeaderCartButton"
import HeaderAccountButton from "./HeaderAccountButton"
import SearchButton from "@/components/search/SearchButton"
import { sdk } from "@/lib/medusa"
import { formatPrice } from "@/lib/format-price"
import Image from "next/image"
import { useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import { IoChevronDown } from "react-icons/io5"

const MobileMenu = dynamic(() => import("@/components/layout/MobileMenu"))

/* ─── PF Monogram ─── */
function PFMonogram({ size = 32, bg = "var(--pf-blue)" }: { size?: number; bg?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 8,
        background: bg,
        color: "#fff",
        fontFamily: "var(--pf-display)",
        fontWeight: 600,
        fontSize: size * 0.42,
        letterSpacing: "-0.02em",
      }}
    >
      pf
    </span>
  )
}

/* ─── Wordmark ─── */
function Wordmark({ color = "#fff", size = 15 }: { color?: string; size?: number }) {
  return (
    <span
      style={{
        fontFamily: "var(--pf-display)",
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "-0.02em",
        color,
        display: "inline-flex",
        alignItems: "baseline",
      }}
    >
      peptides<span style={{ color: "var(--pf-blue-soft)" }}>farma</span>
    </span>
  )
}

const navLinks = [
  { label: "Products", url: "/products" },
  { label: "Contact Us", url: "/contact" },
  { label: "About Us", url: "/about" },
]

export default function Header() {
  const pathname = usePathname()
  const isProductPage = pathname.startsWith("/product-page/")
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogHover, setCatalogHover] = useState(false)
  const hoverTimer = useState<ReturnType<typeof setTimeout> | null>(null)

  const openCatalog = () => {
    if (hoverTimer[0]) clearTimeout(hoverTimer[0])
    setCatalogHover(true)
  }
  const closeCatalog = () => {
    hoverTimer[0] = setTimeout(() => setCatalogHover(false), 250)
  }

  return (
    <>
      {/* Announcement + Header as one continuous gradient */}
      <header
        className="relative"
        style={{ background: "#f7f8fa" }}
      >
        {/* Announcement Bar */}
        <div
          className="overflow-hidden flex items-center"
          style={{ height: 40 }}
        >
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                style={{ fontSize: 13, fontWeight: 500, lineHeight: "24px", letterSpacing: "0.02em", paddingRight: 96, color: "var(--pf-text-2)" }}
              >
                Use coupon code &quot;RESEARCH10&quot; and get 10% off.
              </span>
            ))}
          </div>
        </div>

        {/* Nav */}
        <div className="h-16 md:h-[72px]">
        <div
          className="h-full flex items-center justify-between mx-auto px-5 md:px-20"
          style={{ maxWidth: 1440 }}
        >
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <img src="/peptidesfarma-logo-dark.svg" alt="PeptidesFarma" style={{ height: 32 }} className="md:h-10" />
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="hidden md:flex flex-1 items-center justify-center" style={{ gap: 32 }}>
            <div
              onMouseEnter={openCatalog}
              onMouseLeave={closeCatalog}
              style={{ position: "relative" }}
            >
              <Link
                href="/products"
                className="hover:opacity-80 transition-opacity"
                style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", letterSpacing: "0.02em", color: "var(--pf-ink)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                Catalog
                <IoChevronDown size={12} color="var(--pf-ink)" style={{ opacity: 0.5, transform: catalogHover ? "rotate(180deg)" : "none", transition: "transform 180ms" }} />
              </Link>
            </div>
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.url}
                className="hover:opacity-80 transition-opacity"
                style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", letterSpacing: "0.02em", color: "var(--pf-ink)", textDecoration: "none" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center" style={{ gap: 20 }}>
            <SearchButton />
            <Link href="/account/wishlist" aria-label="Wishlist" className="hover:opacity-80 transition-opacity">
              <Image src="/icons/favourite.svg" alt="Wishlist" width={24} height={24} className="w-6 h-6" />
            </Link>
            <HeaderCartButton />
            <HeaderAccountButton />
          </div>

          {/* Mobile Right */}
          <div className="flex md:hidden items-center" style={{ gap: 16 }}>
            <SearchButton />
            <HeaderCartButton />
            <MobileMenu navLinks={[{ label: "Catalog", url: "/products" }, ...navLinks]} />
          </div>
        </div>
        </div>
        {/* Catalog hover dropdown */}
        {catalogHover && (
          <div
            onMouseEnter={openCatalog}
            onMouseLeave={closeCatalog}
            style={{
              position: "absolute", left: 0, right: 0, top: "100%", zIndex: 50,
              animation: "pf-fade 180ms ease",
            }}
          >
            <div style={{ paddingTop: 8 }}>
              <div style={{ background: "#fff", borderRadius: 20, maxWidth: 780, margin: "0 auto", boxShadow: "0 12px 48px rgba(0,0,0,0.15)", overflow: "hidden" }}>
                <CatalogPanel onClose={() => setCatalogHover(false)} />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

function CatalogPanel({ onClose }: { onClose: () => void }) {
  const [products, setProducts] = useState<Array<{ id: string; handle: string; title: string; thumbnail: string | null; variants: Array<{ id: string; calculated_price?: { calculated_amount: number; currency_code: string } }> }>>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const cachedRid = sessionStorage.getItem("peptidesfarma_region_id")
        let rid = cachedRid || ""
        if (!rid) {
          const { regions } = await sdk.store.region.list({ limit: 10 })
          const usd = regions?.find((r) => r.currency_code === "usd")
          rid = usd?.id || regions?.[0]?.id || ""
          if (rid) sessionStorage.setItem("peptidesfarma_region_id", rid)
        }
        const { products: items } = await sdk.store.product.list({ limit: 8, region_id: rid, fields: "+variants.calculated_price" })
        if (!cancelled) setProducts((items || []) as typeof products)
      } catch {}
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleAdd = async (variantId: string) => {
    try { await addItem(variantId, 1) } catch {}
  }

  return (
    <div style={{ padding: "20px 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em", color: "var(--pf-ink)", margin: 0 }}>
          Our <span style={{ color: "var(--pf-blue)" }}>Products</span>
        </h3>
        <Link href="/products" onClick={onClose} style={{ fontSize: 13, color: "var(--pf-blue)", textDecoration: "none", fontWeight: 500 }}>View all &rarr;</Link>
      </div>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
          <div style={{ width: 24, height: 24, border: "2px solid var(--pf-blue)", borderTopColor: "transparent", borderRadius: 999 }} className="animate-spin" />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {products.slice(0, 4).map((p) => {
            const lowest = p.variants.map((v) => v.calculated_price?.calculated_amount).filter((x): x is number => x != null).sort((a, b) => a - b)[0]
            const currency = p.variants[0]?.calculated_price?.currency_code || "usd"
            return (
              <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Link href={`/product-page/${p.handle}`} onClick={onClose} style={{ display: "block", borderRadius: 12, overflow: "hidden", background: "var(--pf-paper)", aspectRatio: "1/1", position: "relative" }}>
                  {p.thumbnail && <Image src={p.thumbnail} alt={p.title} fill className="object-cover" sizes="200px" />}
                </Link>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <Link href={`/product-page/${p.handle}`} onClick={onClose} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
                    <span style={{ display: "block", fontWeight: 500, fontSize: 14, letterSpacing: "-0.02em", color: "var(--pf-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                  </Link>
                  {lowest != null && (
                    <div style={{ flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: "var(--pf-text-3)" }}>From</span>
                      <span style={{ display: "block", fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em", color: "var(--pf-ink)" }}>{formatPrice(lowest, currency)}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => p.variants[0] && handleAdd(p.variants[0].id)}
                  style={{ width: "100%", height: 34, borderRadius: 999, background: "var(--pf-ink)", color: "#fff", border: "none", fontWeight: 700, fontSize: 12, letterSpacing: "-0.01em", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Add to cart
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
