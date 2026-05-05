"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import HeaderCartButton from "./HeaderCartButton"
import HeaderAccountButton from "./HeaderAccountButton"
import SearchButton from "@/components/search/SearchButton"

/* ─── Announcement Bar ─── */
function AnnouncementBar() {
  const items = [
    "Free shipping on lab orders over $200",
    "Take 10% off — code RESEARCH10",
    "COA included with every vial",
    "Same-day processing before 2pm CT",
  ]
  return (
    <div
      className="pf-announcement-bar"
      style={{
        background: "var(--pf-ink-3)",
        color: "var(--pf-dark-text)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
        height: 32,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 48,
          animation: "pf-marquee 38s linear infinite",
          whiteSpace: "nowrap",
          paddingLeft: "100%",
        }}
      >
        {[...items, ...items, ...items].map((t, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--pf-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(231,236,247,0.7)",
            }}
          >
            <span style={{ color: "var(--pf-blue-soft)", marginRight: 8 }}>&#9670;</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

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

/* ─── Mobile Drawer ─── */
function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  return (
    <div className={`pf-nav-mobile-drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <PFMonogram size={28} bg="var(--pf-blue)" />
          <Wordmark color="#fff" size={14} />
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "#fff",
            width: 36,
            height: 36,
            borderRadius: 999,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 6 12 12" /><path d="m18 6-12 12" />
          </svg>
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Link href="/products" onClick={onClose} className="pf-nav-mobile-link">
          <span>Catalog</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
        </Link>
        <Link href="/about" onClick={onClose} className="pf-nav-mobile-link">
          <span>Science</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
        </Link>
        <Link href="/contact" onClick={onClose} className="pf-nav-mobile-link">
          <span>Contact</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
        </Link>
      </div>
      <div style={{ padding: 20, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
        <Link href="/products" onClick={onClose} className="pf-btn pf-btn--primary pf-btn--lg" style={{ width: "100%" }}>
          Shop the catalog &rarr;
        </Link>
        <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center", fontFamily: "var(--pf-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          For research use only
        </div>
      </div>
    </div>
  )
}

const navIconBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: 999,
  background: "transparent",
  border: "none",
  color: "#fff",
  cursor: "pointer",
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <AnnouncementBar />
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: scrolled ? "rgba(8,18,42,0.92)" : "rgba(8,18,42,0.62)",
          backdropFilter: "saturate(160%) blur(18px)",
          WebkitBackdropFilter: "saturate(160%) blur(18px)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(255,255,255,0.04)",
          color: "#fff",
          transition: "background 220ms ease, border-color 220ms ease",
        }}
      >
        <div
          className="pf-wrap pf-nav-row"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            <PFMonogram size={32} bg="var(--pf-blue)" />
            <Wordmark color="#fff" size={15} />
          </Link>

          {/* Desktop Nav */}
          <nav className="pf-nav-desktop" style={{ display: "flex", gap: 4, alignItems: "center", whiteSpace: "nowrap" }}>
            <NavLink label="Catalog" href="/products" />
            <NavLink label="Science" href="/about" />
            <NavLink label="Contact" href="/contact" />
          </nav>

          {/* Right icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="pf-nav-desktop">
              <SearchButton />
            </span>
            <span className="pf-nav-desktop">
              <HeaderAccountButton />
            </span>
            <HeaderCartButton />
            <button
              aria-label="Menu"
              onClick={() => setMobileOpen(true)}
              className="pf-nav-mobile-toggle"
              style={{ ...navIconBtn, display: "none" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="17" y2="6" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="14" x2="17" y2="14" />
              </svg>
            </button>
          </div>
        </div>

        <MobileNavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </header>
    </>
  )
}

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      style={{
        height: 40,
        padding: "0 14px",
        background: "transparent",
        border: "none",
        color: "#fff",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "inherit",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        transition: "background 160ms",
      }}
      onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
      onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      {label}
    </Link>
  )
}
