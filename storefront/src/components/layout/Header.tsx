"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import HeaderCartButton from "./HeaderCartButton"
import HeaderAccountButton from "./HeaderAccountButton"
import SearchButton from "@/components/search/SearchButton"
import { sdk } from "@/lib/medusa"
import { formatPrice } from "@/lib/format-price"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"

const navLinks = [
  { label: "Products", url: "/products" },
  { label: "Contact Us", url: "/contact" },
  { label: "About Us", url: "/about" },
]

export default function Header() {
  const pathname = usePathname()
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileShopOpen, setMobileShopOpen] = useState(false)
  const catalogRef = useRef<HTMLDivElement>(null)

  // Close catalog on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catalogRef.current && !catalogRef.current.contains(e.target as Node)) setCatalogOpen(false)
    }
    if (catalogOpen) { document.addEventListener("mousedown", handleClick); return () => document.removeEventListener("mousedown", handleClick) }
  }, [catalogOpen])

  // Lock body on mobile menu
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); setMobileShopOpen(false) }, [pathname])

  return (
    <>
      <header className="sticky top-0 z-[200]" style={{ background: "#fff" }}>
        {/* ROW 1: USP Banner (desktop only) - matches nav bg */}
        <div className="hidden md:flex items-center justify-center" style={{ background: "var(--pf-ink)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center w-full mx-auto" style={{ maxWidth: 1332 }}>
            {[
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>, text: "Free shipping from $200" },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>, text: "99%+ purity · Third-party tested" },
              { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>, text: "Same-day shipping before 2pm CT" },
            ].map((usp, i) => (
              <div key={i} style={{ flex: "1 1 33.33%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 0" }}>
                {usp.icon}
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>{usp.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Announcement bar */}
        <div className="md:hidden overflow-hidden flex items-center" style={{ height: 34, background: "var(--pf-ink)" }}>
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 500, paddingRight: 80, color: "#fff" }}>
                Use coupon code &quot;RESEARCH10&quot; and get 10% off.
              </span>
            ))}
          </div>
        </div>

        {/* ROW 2: Logo + Nav links (center) + Icons */}
        <div style={{ background: "var(--pf-ink)" }}>
        <div className="mx-auto px-4 md:px-8" style={{ maxWidth: 1332 }}>
          <div className="flex items-center justify-between h-[56px] md:h-[64px]">
            {/* Mobile: Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex md:hidden items-center justify-center mr-2"
              aria-label="Open menu"
              style={{ width: 40, height: 40, background: "none", border: "none", cursor: "pointer" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 5, width: 20 }}>
                <span style={{ width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
                <span style={{ width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
                <span style={{ width: 14, height: 2, background: "#fff", borderRadius: 1 }} />
              </div>
            </button>

            {/* Logo */}
            <Link href="/" className="shrink-0">
              <img src="/peptidesfarma-logo-light.svg" alt="PeptidesFarma" className="h-7 md:h-9" onError={(e) => { (e.target as HTMLImageElement).src = "/peptidesfarma-logo-dark.svg" }} />
            </Link>

            {/* Center: Nav links with dividers (desktop) */}
            <nav className="hidden md:flex items-center" style={{ margin: "0 auto" }}>
              <div ref={catalogRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setCatalogOpen(!catalogOpen)}
                  className="hover:opacity-80 transition-opacity"
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "0 24px", height: 64, background: "none", border: "none",
                    borderRight: "1px solid rgba(255,255,255,0.15)",
                    fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em",
                    color: "#fff", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Shop
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, transition: "transform 200ms ease", transform: catalogOpen ? "rotate(180deg)" : "none" }}><path d="m6 9 6 6 6-6" /></svg>
                </button>
              </div>
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.url}
                  className="hover:opacity-80 transition-opacity"
                  style={{
                    display: "flex", alignItems: "center",
                    padding: "0 24px", height: 64,
                    borderRight: i < navLinks.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none",
                    fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em",
                    color: "#fff", textDecoration: "none",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center" style={{ gap: 20 }}>
              <div style={{ color: "#fff" }}><SearchButton /></div>
              <Link href="/account/wishlist" aria-label="Wishlist" className="hidden md:flex hover:opacity-80 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="#fff" strokeWidth="1.5" /></svg>
              </Link>
              <div style={{ color: "#fff" }}><HeaderCartButton /></div>
              <div className="hidden md:block"><HeaderAccountButton /></div>
            </div>
          </div>
        </div>
        </div>

        {/* Catalog dropdown */}
        {catalogOpen && (
          <div style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 50 }}>
            <div style={{ paddingTop: 4 }}>
              <div style={{ background: "#fff", borderRadius: 16, maxWidth: 780, margin: "0 auto", boxShadow: "0 12px 48px rgba(0,0,0,0.12)", overflow: "hidden", border: "1px solid var(--pf-line)" }}>
                <CatalogPanel onClose={() => setCatalogOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile drawer overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        style={{
          position: "fixed", inset: 0, background: "rgba(29,29,27,0.4)", zIndex: 1300,
          opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none",
          transition: "opacity 240ms ease-out",
        }}
      />

      {/* Mobile drawer */}
      <div
        style={{
          position: "fixed", top: 0, bottom: 0, left: mobileOpen ? 0 : "-100%",
          width: "100%", maxWidth: 320, background: "#fff", zIndex: 1300,
          display: "flex", flexDirection: "column",
          transition: "left 240ms ease-out",
          overflowY: "auto",
        }}
      >
        {/* Drawer header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, padding: "0 16px", borderBottom: "1px solid var(--pf-line)" }}>
          <img src="/peptidesfarma-logo-dark.svg" alt="PeptidesFarma" style={{ height: 28 }} />
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu" style={{ width: 40, height: 40, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--pf-ink)"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>
        </div>

        {/* Drawer links */}
        <div style={{ flex: 1 }}>
          {/* Shop with drill-down */}
          <button
            onClick={() => setMobileShopOpen(!mobileShopOpen)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", height: 52, padding: "0 20px", background: "none", border: "none", borderBottom: "1px solid var(--pf-line)", cursor: "pointer", fontFamily: "inherit" }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--pf-ink)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Shop</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pf-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 250ms ease", transform: mobileShopOpen ? "rotate(180deg)" : "none" }}><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <div style={{
            maxHeight: mobileShopOpen ? 200 : 0,
            overflow: "hidden",
            transition: "max-height 300ms ease, opacity 300ms ease, padding 300ms ease",
            opacity: mobileShopOpen ? 1 : 0,
            padding: mobileShopOpen ? "12px 20px" : "0 20px",
            display: "flex", flexDirection: "column", gap: 4,
            borderBottom: mobileShopOpen ? "1px solid var(--pf-line)" : "none",
            background: "var(--pf-paper)",
          }}>
            <Link href="/products" onClick={() => setMobileOpen(false)} style={{ fontSize: 14, color: "var(--pf-ink)", textDecoration: "none", padding: "8px 0", fontWeight: 500 }}>All Products</Link>
            <Link href="/products" onClick={() => setMobileOpen(false)} style={{ fontSize: 14, color: "var(--pf-text-2)", textDecoration: "none", padding: "8px 0" }}>Best Sellers</Link>
            <Link href="/products" onClick={() => setMobileOpen(false)} style={{ fontSize: 14, color: "var(--pf-text-2)", textDecoration: "none", padding: "8px 0" }}>New Arrivals</Link>
          </div>

          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.url}
              onClick={() => setMobileOpen(false)}
              style={{ display: "flex", alignItems: "center", height: 52, padding: "0 20px", borderBottom: "1px solid var(--pf-line)", fontSize: 15, fontWeight: 600, color: "var(--pf-ink)", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.03em" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Drawer footer */}
        <div style={{ marginTop: "auto", background: "var(--pf-paper)", padding: 16, display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--pf-line)" }}>
          <Link href={`/auth/login?redirect=${encodeURIComponent(pathname)}`} onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--pf-ink)", fontSize: 14, fontWeight: 500 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--pf-ink)"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            My Account
          </Link>
          <Link href="/account/wishlist" onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--pf-ink)", fontSize: 14, fontWeight: 500 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="var(--pf-ink)" strokeWidth="1.5" /></svg>
            Wishlist
          </Link>
        </div>
      </div>
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
                <Link href={`/product/${p.handle}`} onClick={onClose} style={{ display: "block", borderRadius: 12, overflow: "hidden", background: "var(--pf-paper)", aspectRatio: "1/1", position: "relative" }}>
                  {p.thumbnail && <Image src={p.thumbnail} alt={p.title} fill className="object-cover" sizes="200px" />}
                </Link>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <Link href={`/product/${p.handle}`} onClick={onClose} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
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
