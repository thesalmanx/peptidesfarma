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
  const [openMenu, setOpenMenu] = useState<"shop" | "science" | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleClose = () => { closeTimer.current = setTimeout(() => setOpenMenu(null), 220) }
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current) }
  const open = (m: "shop" | "science") => { cancelClose(); setOpenMenu(m) }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <AnnouncementBar />
      <header
        onMouseLeave={scheduleClose}
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
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            <PFMonogram size={32} bg="var(--pf-blue)" />
            <Wordmark color="#fff" size={15} />
          </Link>

          <nav className="pf-nav-desktop" style={{ display: "flex", gap: 4, alignItems: "center", whiteSpace: "nowrap" }}>
            <NavTrigger label="Catalog" active={openMenu === "shop"} onEnter={() => open("shop")} href="/products" />
            <NavTrigger label="Science" active={openMenu === "science"} onEnter={() => open("science")} href="/about" />
            <NavLink label="Contact" href="/contact" onEnter={scheduleClose} />
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="pf-nav-desktop"><SearchButton /></span>
            <span className="pf-nav-desktop"><HeaderAccountButton /></span>
            <HeaderCartButton />
            <button aria-label="Menu" onClick={() => setMobileOpen(true)} className="pf-nav-mobile-toggle" style={{ ...navIconBtn, display: "none" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mega menus */}
        {openMenu === "shop" && <MegaShopPanel onClose={() => setOpenMenu(null)} onEnter={cancelClose} />}
        {openMenu === "science" && <MegaSciencePanel onClose={() => setOpenMenu(null)} onEnter={cancelClose} />}

        <MobileNavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </header>
    </>
  )
}

function NavTrigger({ label, active, onEnter, href }: { label: string; active: boolean; onEnter: () => void; href: string }) {
  return (
    <Link
      href={href}
      onMouseEnter={onEnter}
      style={{
        height: 40, padding: "0 14px",
        background: active ? "rgba(255,255,255,0.08)" : "transparent",
        border: "none", color: "#fff", fontSize: 14, fontWeight: 500,
        fontFamily: "inherit", borderRadius: 999,
        display: "inline-flex", alignItems: "center", gap: 6,
        transition: "background 160ms",
      }}
    >
      {label}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, transform: active ? "rotate(180deg)" : "none", transition: "transform 180ms" }}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </Link>
  )
}

function NavLink({ label, href, onEnter }: { label: string; href: string; onEnter?: () => void }) {
  return (
    <Link
      href={href}
      onMouseEnter={onEnter}
      style={{
        height: 40, padding: "0 14px",
        background: "transparent", border: "none", color: "#fff",
        fontSize: 14, fontWeight: 500, fontFamily: "inherit",
        borderRadius: 999, display: "inline-flex", alignItems: "center",
        transition: "background 160ms",
      }}
      onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
      onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      {label}
    </Link>
  )
}

/* ─── Mega Shop Panel ─── */
function MegaShopPanel({ onClose, onEnter }: { onClose: () => void; onEnter: () => void }) {
  const [hover, setHover] = useState<string | null>(null)
  const cats = [
    { id: "metabolic", label: "Metabolic", desc: "Retatrutide, Tesamorelin" },
    { id: "longevity", label: "Longevity", desc: "Epithalon, NAD+" },
    { id: "recovery", label: "Recovery & Repair", desc: "BPC-157, MOTS-C" },
    { id: "cognitive", label: "Cognitive", desc: "Selank, DSIP" },
    { id: "growth", label: "Growth & GH", desc: "KLOW, MT-2" },
    { id: "specialty", label: "Specialty", desc: "Glutathione, BAC Water" },
  ]
  return (
    <div onMouseEnter={onEnter} style={{
      position: "absolute", left: 0, right: 0, top: "100%",
      background: "rgba(8,18,42,0.96)", backdropFilter: "saturate(160%) blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)",
      color: "#fff", animation: "pf-fade 180ms ease",
    }}>
      <div className="pf-wrap" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 48, padding: "32px 24px 40px" }}>
        <div>
          <div style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 16 }}>Browse by goal</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            {cats.map((c) => (
              <li key={c.id}>
                <Link href={`/products?category=${c.id}`} onClick={onClose}
                  onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    width: "100%", textAlign: "left", padding: "10px 12px",
                    background: hover === c.id ? "rgba(79,138,247,0.12)" : "transparent",
                    borderRadius: 8, transition: "background 140ms", textDecoration: "none", color: "#fff",
                  }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{c.desc}</div>
                  </div>
                  <span style={{ opacity: hover === c.id ? 1 : 0.3, transition: "opacity 140ms" }}>&rarr;</span>
                </Link>
              </li>
            ))}
            <li style={{ marginTop: 12, padding: "0 12px" }}>
              <Link href="/products" onClick={onClose} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", padding: "8px 16px", borderRadius: 999, fontSize: 12, textDecoration: "none", fontWeight: 500 }}>
                View all compounds &rarr;
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Popular compounds</div>
            <Link href="/products" onClick={onClose} style={{ fontSize: 12, color: "var(--pf-blue-soft)", textDecoration: "none" }}>See all &rarr;</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { name: "Retatrutide", sub: "Metabolic peptide", handle: "retatrutide" },
              { name: "BPC-157", sub: "Body protection compound", handle: "bpc-157" },
              { name: "Tesamorelin", sub: "GH releasing peptide", handle: "tesamorelin" },
            ].map((p) => (
              <Link key={p.handle} href={`/product-page/${p.handle}`} onClick={onClose} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: 16, textDecoration: "none", color: "#fff",
                transition: "background 140ms, border-color 140ms",
              }}
                onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(79,138,247,0.10)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(79,138,247,0.45)" }}
                onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)" }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{p.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Mega Science Panel ─── */
function MegaSciencePanel({ onClose, onEnter }: { onClose: () => void; onEnter: () => void }) {
  const items = [
    { h: "Quality standards", s: "How we synthesize, purify and verify every lot", href: "/about" },
    { h: "Lab reports", s: "Browse the COA library by lot or compound", href: "/about" },
    { h: "Method notes", s: "Reconstitution, storage, handling guides", href: "/about" },
    { h: "Cold-chain shipping", s: "How vials reach your bench intact", href: "/about" },
  ]
  return (
    <div onMouseEnter={onEnter} style={{
      position: "absolute", left: 0, right: 0, top: "100%",
      background: "rgba(8,18,42,0.96)", backdropFilter: "saturate(160%) blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)",
      color: "#fff", animation: "pf-fade 180ms ease",
    }}>
      <div className="pf-wrap" style={{ padding: "32px 24px 40px" }}>
        <div style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 20 }}>Science &amp; documentation</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {items.map((it) => (
            <Link key={it.h} href={it.href} onClick={onClose} style={{
              padding: "20px 18px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
              textDecoration: "none", color: "#fff", transition: "background 140ms, border-color 140ms",
            }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(79,138,247,0.10)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(79,138,247,0.45)" }}
              onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)" }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{it.h}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{it.s}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
