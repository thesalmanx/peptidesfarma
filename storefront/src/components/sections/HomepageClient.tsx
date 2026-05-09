"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import ProductCard from "@/components/product/ProductCard"
import HeroParticles from "@/components/HeroParticles"

/* ─── Scroll Reveal Hook ─── */
function useReveal(opts?: { threshold?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") { el.classList.add("is-in"); return }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { el.classList.add("is-in"); io.unobserve(el) } }),
      { threshold: opts?.threshold ?? 0.15, rootMargin: "0px 0px -60px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

interface Product {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  variants: Array<{
    id: string
    calculated_price?: { calculated_amount: number; currency_code: string }
  }>
}

export default function HomepageClient({ products }: { products: Product[] }) {
  return (
    <div>
      <Hero />
      <TrustStrip />
      <BestSellers products={products.slice(0, 8)} />
      <WhyUs />
      <ProcessSection />
      <ReviewsSection />
      <FAQ />
      <ClosingCTA />
    </div>
  )
}

/* ========== HERO ========== */
function Hero() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        marginTop: -1,
        background: "linear-gradient(180deg, #f7f8fa 0%, #c8d5e5 100%)",
        color: "var(--pf-ink)",
      }}
    >
      <div style={{ position: "absolute", right: "-10%", top: "10%", width: 720, height: 720, background: "radial-gradient(circle, rgba(79,138,247,0.15), transparent 60%)", filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: "-10%", bottom: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(122,162,255,0.10), transparent 60%)", pointerEvents: "none" }} />
      <HeroParticles />

      {/* Centered content with vials inside container */}
      <div className="pf-wrap" style={{ position: "relative", minHeight: 680, paddingBlock: "80px 96px" }}>
        {/* Floating vials - inside container */}
        <img src="/icons/glp-3.png" alt="" className="absolute pointer-events-none hidden md:block" style={{ width: 200, left: 0, top: 80, objectFit: "contain", animation: "pf-float-y 7s ease-in-out infinite", zIndex: 1 }} />
        <img src="/icons/nad+.png" alt="" className="absolute pointer-events-none hidden md:block" style={{ width: 170, right: 0, top: 60, objectFit: "contain", animation: "pf-float-y 8s ease-in-out 1s infinite", zIndex: 1 }} />
        <img src="/icons/ghk-cu.png" alt="" className="absolute pointer-events-none hidden md:block" style={{ width: 150, left: 60, bottom: 60, objectFit: "contain", animation: "pf-float-y 6s ease-in-out 0.5s infinite", zIndex: 1 }} />
        <img src="/icons/glp-3.png" alt="" className="absolute pointer-events-none hidden md:block" style={{ width: 140, right: 60, bottom: 80, objectFit: "contain", animation: "pf-float-y 9s ease-in-out 2s infinite", zIndex: 1, transform: "scaleX(-1)" }} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center", minHeight: 520 }}>
        <div className="hero-stagger-1" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 16px 6px 6px", background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 999, marginBottom: 28 }}>
          <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--pf-blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pf-text-2)", letterSpacing: "0.01em" }}>Third-party HPLC &middot; 99.2% avg purity</span>
        </div>

        <h1 className="hero-stagger-2" style={{ fontFamily: "var(--pf-display)", fontWeight: 700, fontSize: "clamp(40px, 5.2vw, 72px)", lineHeight: 1.05, letterSpacing: "-0.032em", margin: "0 0 20px", color: "var(--pf-ink)", maxWidth: 740 }}>
          Research-Grade Peptides.{" "}
          <span style={{ fontFamily: "var(--pf-serif)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.015em", background: "linear-gradient(135deg, #4F8AF7 0%, #7AA2FF 60%, #4F8AF7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Elevated.
          </span>
        </h1>

        <p className="hero-stagger-3" style={{ fontSize: 17, lineHeight: 1.6, color: "var(--pf-text-2)", maxWidth: 520, margin: "0 0 32px" }}>
          High-purity peptide compounds manufactured for advanced research and innovation.
        </p>

        <div className="hero-stagger-4" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
          <Link href="/products" className="pf-btn pf-btn--primary pf-btn--lg" style={{ padding: "0 28px" }}>
            Shop products
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </Link>
          <Link href="/about" className="pf-btn pf-btn--ghost pf-btn--lg">See how it works &rarr;</Link>
        </div>

        {/* Trust pills */}
        <div className="pf-hero-stats hero-stagger-5" style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { v: "99%+ verified purity", icon: <Image src="/icons/checkmark-badge.svg" alt="" width={20} height={20} /> },
            { v: "Lab-Tested & Documented", icon: <Image src="/icons/license-third-party.svg" alt="" width={20} height={20} /> },
            { v: "Controlled Manufacturing", icon: <Image src="/icons/laurel-wreath.svg" alt="" width={20} height={20} /> },
          ].map((t) => (
            <div key={t.v} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(255,255,255,0.65)", borderRadius: 999, border: "1px solid rgba(79,138,247,0.12)" }}>
              {t.icon}
              <span style={{ fontSize: 13, color: "var(--pf-ink)", fontWeight: 500 }}>{t.v}</span>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}

/* ========== LOT TICKER ========== */
function LotTicker() {
  const items = [
    { lot: "B-0042", c: "GLP-3 RT", d: "02.2026", purity: "99.4%" },
    { lot: "B-0041", c: "ARA-290", d: "02.2026", purity: "99.1%" },
    { lot: "B-0040", c: "Wolverine 10", d: "01.2026", purity: "98.9%" },
    { lot: "B-0039", c: "NAD+ 500", d: "01.2026", purity: "99.6%" },
    { lot: "B-0038", c: "Tesamorelin", d: "01.2026", purity: "99.2%" },
    { lot: "B-0037", c: "BPC-157", d: "12.2025", purity: "99.5%" },
  ]
  const row = [...items, ...items]
  return (
    <div style={{ background: "var(--pf-paper-2)", borderTop: "1px solid var(--pf-line)", borderBottom: "1px solid var(--pf-line)", overflow: "hidden", padding: "14px 0" }}>
      <div className="pf-lot-ticker" style={{ display: "flex", gap: 48, animation: "pf-marquee 50s linear infinite", whiteSpace: "nowrap" }}>
        {row.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--pf-text-3)", fontFamily: "var(--pf-mono)", fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--pf-blue)", boxShadow: "0 0 10px rgba(79,138,247,0.4)" }} />
            <span style={{ color: "var(--pf-text-3)" }}>NEW LOT</span>
            <span style={{ color: "var(--pf-ink)", fontWeight: 600 }}>{it.lot}</span>
            <span>&middot;</span>
            <span style={{ color: "var(--pf-ink)" }}>{it.c}</span>
            <span>&middot;</span>
            <span>{it.purity}</span>
            <span>&middot;</span>
            <span>{it.d}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ========== TRUST STRIP ========== */
function TrustStrip() {
  const ref = useReveal()
  const items = [
    { h: "Fast shipping", s: "Same-day before 2pm CT", icon: "truck" },
    { h: "Third-party tested", s: "Every lot HPLC verified", icon: "beaker" },
    { h: "99%+ purity", s: "Pharmaceutical grade", icon: "badge" },
    { h: "Lot-traced", s: "COA on every order", icon: "shield" },
  ]
  return (
    <section style={{ background: "#fff", color: "var(--pf-ink)", borderTop: "1px solid var(--pf-line)", borderBottom: "1px solid var(--pf-line)" }}>
      <div ref={ref} className="pf-wrap pf-reveal-stagger pf-trust-strip" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, padding: "32px 24px" }}>
        {items.map((t, i) => (
          <div key={t.h} style={{ display: "flex", alignItems: "center", gap: 16, paddingInline: 24, borderRight: i < 3 ? "1px solid var(--pf-line)" : "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--pf-blue-tint)", border: "1px solid rgba(79,138,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <TrustIcon name={t.icon} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-ink)" }}>{t.h}</div>
              <div style={{ fontSize: 12, color: "var(--pf-text-3)", marginTop: 2 }}>{t.s}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TrustIcon({ name }: { name: string }) {
  const c = "#7AA2FF"
  if (name === "truck") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="12" height="10" rx="1" /><path d="M14 10h4l3 3v4h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
  if (name === "beaker") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V3" /><path d="M9 3h6" /><path d="M7 14h10" /></svg>
  if (name === "badge") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="6" /><path d="M9 14v7l3-2 3 2v-7" /></svg>
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
}

/* ========== BEST SELLERS ========== */
function BestSellers({ products }: { products: Product[] }) {
  const ref = useReveal()
  return (
    <section style={{ padding: "64px 0 96px", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="pf-eyebrow" style={{ marginBottom: 12 }}>Most ordered</div>
            <h2 style={{ fontSize: "clamp(34px, 4.2vw, 52px)", fontFamily: "var(--pf-display)", fontWeight: 600, letterSpacing: "-0.028em", margin: 0, lineHeight: 1.04, color: "var(--pf-ink)" }}>
              The catalog, well represented
            </h2>
            <p style={{ fontSize: 16, color: "var(--pf-text-2)", margin: "14px 0 0", maxWidth: 540, lineHeight: 1.55 }}>
              Eight compounds shipping in volume this quarter. Each lot HPLC-verified before release.
            </p>
          </div>
        </div>
        <div ref={ref} className="pf-reveal-stagger pf-catalog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
          <Link href="/products" className="pf-btn pf-btn--primary pf-btn--lg">See all products &rarr;</Link>
        </div>
      </div>
    </section>
  )
}

/* ========== WHY US ========== */
function WhyUs() {
  const ref = useReveal()
  const rows = [
    { label: "Independent third-party HPLC testing", us: true, them: "Sometimes" },
    { label: "Per-lot Certificate of Analysis", us: true, them: "Per-product only" },
    { label: "Same-day shipping (before 2pm CT)", us: true, them: "3-5 day handling" },
    { label: "Cold-chain insulated packaging", us: true, them: "Standard envelope" },
    { label: "Mass-spec verified identity", us: true, them: "Not disclosed" },
    { label: "USA-based founder & lab", us: true, them: "Drop-shipped" },
  ]
  return (
    <section style={{ padding: "120px 0", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          <div>
            <div className="pf-eyebrow" style={{ marginBottom: 18 }}>Why peptidesfarma</div>
            <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(38px, 4.4vw, 60px)", lineHeight: 1.03, letterSpacing: "-0.03em", margin: "0 0 24px", color: "var(--pf-ink)" }}>
              Pharmaceutical standards.<br />
              <span style={{ fontFamily: "var(--pf-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--pf-blue)" }}>Without the markup.</span>
            </h2>
            <p style={{ fontSize: 17, color: "var(--pf-ink-2)", lineHeight: 1.6, marginBottom: 32, maxWidth: 460 }}>
              Most peptide vendors operate as resellers. We synthesize, test, and ship from a single facility. Every claim on this site is auditable.
            </p>
            <Link href="/about" className="pf-btn pf-btn--primary">Read the standard &rarr;</Link>
          </div>
          <div ref={ref} className="pf-reveal-stagger" style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px", padding: "16px 24px", borderBottom: "1px solid var(--pf-line)", background: "var(--pf-paper-2)", fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--pf-ink-3)" }}>
              <div>Standard</div>
              <div style={{ textAlign: "center", color: "var(--pf-blue)" }}>Us</div>
              <div style={{ textAlign: "center" }}>Most</div>
            </div>
            {rows.map((r, i) => (
              <div key={i} className="pf-whyus-row" style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px", padding: "20px 24px", borderBottom: i < rows.length - 1 ? "1px solid var(--pf-line)" : "none", alignItems: "center", fontSize: 14 }}>
                <div style={{ color: "var(--pf-ink)", fontWeight: 500 }}>{r.label}</div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: 999, background: "rgba(79,138,247,0.12)", color: "var(--pf-blue)", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                  </span>
                </div>
                <div style={{ textAlign: "center", color: "var(--pf-ink-3)", fontSize: 12 }}>{r.them}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ========== WHY CHOOSE US ========== */
function ProcessSection() {
  const ref = useReveal()
  const cards = [
    { icon: "Package", color: "#EDE9FE", iconColor: "#7C3AED", h: "Always in Stock", s: "Top research peptides like BPC-157, Retatrutide, and Tesamorelin ready to ship. No backorders, no waiting." },
    { icon: "BadgePercent", color: "#DCFCE7", iconColor: "#16A34A", h: "Volume Pricing", s: "Bulk pricing available for larger research orders. Lower per-vial cost at higher volumes." },
    { icon: "Truck", color: "#FEF9C3", iconColor: "#CA8A04", h: "Safe & Protected Shipping", s: "Cold-pack shipping keeps peptides stable. Discreet packaging with full tracking on every USA order." },
    { icon: "Globe", color: "#FCE7F3", iconColor: "#DB2777", h: "Researcher Community", s: "Connect with fellow researchers. Share peer insights and discuss peptide research applications." },
    { icon: "ShieldCheck", color: "#E0E7FF", iconColor: "#4F46E5", h: "99%+ Purity Guaranteed", s: "Every batch tested by US labs via HPLC and Mass Spec. Full Certificate of Analysis included free." },
    { icon: "RefreshCcw", color: "#D1FAE5", iconColor: "#059669", h: "Shipment Protection", s: "Every order includes free shipment protection. Lost, damaged, or stolen packages are reshipped at no cost." },
  ]
  return (
    <section style={{ padding: "100px 0", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 700, fontSize: "clamp(30px, 4vw, 44px)", lineHeight: 1.1, letterSpacing: "-0.025em", textAlign: "center", margin: "0 0 56px", color: "var(--pf-ink)" }}>
          Why choose Peptidesfarma?
        </h2>
        <div ref={ref} className="pf-reveal-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {cards.map((card) => (
            <div key={card.h} style={{ padding: "28px 28px 32px", background: "#fff", borderRadius: 14, border: "1px solid var(--pf-line)", transition: "box-shadow 200ms ease" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: card.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <WhyIcon name={card.icon} color={card.iconColor} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--pf-ink)", marginBottom: 8 }}>{card.h}</div>
              <div style={{ fontSize: 14, color: "var(--pf-text-2)", lineHeight: 1.6 }}>{card.s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyIcon({ name, color }: { name: string; color: string }) {
  const props = { width: 22, height: 22, stroke: color, strokeWidth: 1.8, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  switch (name) {
    case "Package": return <svg viewBox="0 0 24 24" {...props}><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
    case "BadgePercent": return <svg viewBox="0 0 24 24" {...props}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m15 9-6 6" /><path d="M9 9h.01" /><path d="M15 15h.01" /></svg>
    case "Truck": return <svg viewBox="0 0 24 24" {...props}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>
    case "Globe": return <svg viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
    case "ShieldCheck": return <svg viewBox="0 0 24 24" {...props}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
    case "RefreshCcw": return <svg viewBox="0 0 24 24" {...props}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></svg>
    default: return null
  }
}

/* ========== REVIEWS ========== */
const REVIEWS = [
  { quote: "Ordered BPC-157 and Retatrutide last month. Both arrived in two days, perfectly packaged with cold packs. The COA matched the label and purity was spot on. Will be ordering again for sure.", author: "Dr. Rachel M.", role: "Research Scientist" },
  { quote: "Finally found a supplier that actually tests their products. The HPLC results on the COA were verified independently by our lab and everything checked out. Genuinely impressed.", author: "James K.", role: "Lab Director" },
  { quote: "Been through four different peptide vendors this year. Peptidesfarma is the only one where the purity consistently hits above 99%. Their Tesamorelin is excellent quality.", author: "Sarah L.", role: "Biochemist" },
  { quote: "Customer support is surprisingly responsive. Had a question about reconstitution protocols and got a detailed reply within an hour. The product quality speaks for itself too.", author: "Michael T.", role: "Researcher" },
  { quote: "Placed a bulk order for our lab and the volume pricing saved us a good amount. Everything was in stock and shipped same day. No issues with any of the vials.", author: "Dr. Amanda H.", role: "Principal Investigator" },
  { quote: "The packaging quality alone sets them apart. Every vial sealed under nitrogen, proper cold chain shipping, lot numbers matching the COA. This is how it should be done.", author: "David R.", role: "Pharmacologist" },
  { quote: "Switched from our previous supplier after quality issues. Three orders in with Peptidesfarma and zero complaints. NAD+ and Epithalon have been particularly consistent.", author: "Lisa W.", role: "Research Associate" },
  { quote: "Quick shipping to the east coast, always tracked, always on time. The free shipping over $200 is a nice touch when you are ordering regularly for ongoing research.", author: "Robert P.", role: "Lab Manager" },
]

const AVATAR_COLORS = [
  "linear-gradient(135deg, #14213D 0%, #4F8AF7 100%)",
  "linear-gradient(135deg, #1B2D5C 0%, #7AA2FF 100%)",
  "linear-gradient(135deg, #0E1A33 0%, #4F8AF7 100%)",
  "linear-gradient(135deg, #14213D 0%, #7AA2FF 100%)",
  "linear-gradient(135deg, #1B2D5C 0%, #4F8AF7 100%)",
  "linear-gradient(135deg, #0A1430 0%, #7AA2FF 100%)",
]

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase()
}

function ReviewCard({ review, index }: { review: typeof REVIEWS[number]; index: number }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "24px 28px", width: 420, height: 180, flexShrink: 0,
      background: "#fff", border: "1px solid var(--pf-line)",
      borderRadius: 18, cursor: "default",
      boxShadow: "0 2px 8px rgba(14,26,51,0.04)",
    }}>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--pf-text-2)", margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        &ldquo;{review.quote}&rdquo;
      </p>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {[...Array(5)].map((_, i) => (
          <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#F5A623"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{getInitials(review.author)}</span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--pf-ink)" }}>{review.author}</div>
          {review.role && <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>{review.role}</div>}
        </div>
      </div>
    </div>
  )
}

function ReviewsSection() {
  const half = Math.ceil(REVIEWS.length / 2)
  const row1 = REVIEWS.slice(0, half)
  const row2 = REVIEWS.slice(half)
  return (
    <section style={{ padding: "80px 0", background: "var(--pf-paper)", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 700, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.025em", color: "var(--pf-ink)", margin: "0 0 8px" }}>
          What researchers say about{" "}
          <span style={{ color: "var(--pf-blue)" }}>Peptidesfarma</span>
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ overflow: "hidden", maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
          <div style={{ display: "flex", gap: 16, animation: "pf-marquee 40s linear infinite" }}>
            {[0, 1, 2, 3].map((setIdx) => (
              <div key={setIdx} style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                {row1.map((r, i) => <ReviewCard key={`${setIdx}-${i}`} review={r} index={i} />)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ overflow: "hidden", maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
          <div style={{ display: "flex", gap: 16, animation: "pf-marquee 45s linear infinite reverse" }}>
            {[0, 1, 2, 3].map((setIdx) => (
              <div key={setIdx} style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                {row2.map((r, i) => <ReviewCard key={`${setIdx}-${i}`} review={r} index={i + half} />)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ========== FAQ ========== */
function FAQ() {
  const [open, setOpen] = useState(0)
  const ref = useReveal()
  const items = [
    { q: "Are these products for human consumption?", a: "No. All compounds sold by peptidesfarma are intended for laboratory and research use only. They are not approved by the FDA for human consumption, treatment, or diagnostic use. By placing an order you confirm your understanding of this." },
    { q: "What documentation comes with my order?", a: "Every shipment includes a per-lot Certificate of Analysis showing HPLC purity, mass-spec identity confirmation, endotoxin testing, and the date the lot was tested. COAs are also available for download from your account before purchase." },
    { q: "Where do you synthesize and test?", a: "Synthesis is performed at our partner cleanroom facility under solid-phase peptide synthesis protocols. Independent verification is conducted by Freedom Diagnostics (HPLC + LC-MS) on every lot before release." },
    { q: "How is the product shipped?", a: "Orders before 2pm CT ship same-day from Texas via USPS Priority or UPS Ground (your choice at checkout). All shipments include cold packs in insulated mailers; orders over $200 ship free." },
    { q: "What is your reshipment policy?", a: "If a vial arrives damaged, contaminated, or mis-labeled, we'll reship same-day at no charge. Photograph the issue within 48 hours of delivery and email support@peptidesfarma.com with your order number." },
    { q: "Do you ship internationally?", a: "Currently we ship to the United States, Canada, UK, Australia, and most EU countries. Customs holds remain the responsibility of the buyer. International orders ship within 1-2 business days of receipt." },
  ]
  return (
    <section style={{ padding: "120px 0", background: "#fff", borderTop: "1px solid var(--pf-line)" }}>
      <div className="pf-wrap" style={{ maxWidth: 960 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="pf-eyebrow" style={{ marginBottom: 16 }}>Common questions</div>
          <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(38px, 4.4vw, 60px)", lineHeight: 1.03, letterSpacing: "-0.03em", margin: 0, color: "var(--pf-ink)" }}>
            Answers, not asterisks.
          </h2>
        </div>
        <div ref={ref} className="pf-reveal-stagger" style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid var(--pf-line)" }}>
          {items.map((it, i) => {
            const isOpen = open === i
            return (
              <div key={i} style={{ borderBottom: "1px solid var(--pf-line)" }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="pf-faq-q"
                  style={{ width: "100%", textAlign: "left", padding: "28px 8px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, fontFamily: "inherit" }}
                >
                  <span style={{ fontFamily: "var(--pf-display)", fontSize: 22, fontWeight: 600, color: "var(--pf-ink)", letterSpacing: "-0.015em" }}>{it.q}</span>
                  <span
                    className="pf-faq-q-icon"
                    style={{
                      flexShrink: 0, width: 36, height: 36, borderRadius: 999,
                      background: isOpen ? "var(--pf-ink)" : "var(--pf-paper-2)",
                      color: isOpen ? "#fff" : "var(--pf-ink)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 200ms ease", transform: isOpen ? "rotate(45deg)" : "none",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                  </span>
                </button>
                <div
                  className="pf-faq-body"
                  style={{
                    maxHeight: isOpen ? 240 : 0,
                    overflow: "hidden",
                    transition: "max-height 360ms cubic-bezier(0.22, 1, 0.36, 1), padding 200ms ease",
                    paddingBottom: isOpen ? 28 : 0,
                    paddingLeft: 8,
                    paddingRight: 64,
                  }}
                >
                  <p style={{ fontSize: 16, color: "var(--pf-ink-2)", lineHeight: 1.7, margin: 0 }}>{it.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ========== CLOSING CTA ========== */
function ClosingCTA() {
  return (
    <section style={{ padding: "80px 0 0", background: "#fff" }}>
      <div className="pf-wrap">
        {/* CTA Banner */}
        <div style={{
          position: "relative", overflow: "hidden", borderRadius: 24,
          background: "linear-gradient(135deg, #F5F0E0 0%, #E8F5E0 30%, #F0EAD6 60%, #DFF0D8 100%)",
          padding: "40px 40px", textAlign: "center",
        }}>

          <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "var(--pf-serif)", fontStyle: "italic", fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.3,
              letterSpacing: "-0.02em", color: "var(--pf-ink)", margin: "0 0 32px",
            }}>
              All the research peptides you need, with the <span style={{ textDecoration: "underline", textDecorationColor: "var(--pf-ink)", textUnderlineOffset: 4 }}>peace of mind</span> and research community at your fingertips.
            </h2>
            <Link href="/products" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 32px", borderRadius: 999,
              background: "var(--pf-ink)", color: "#fff",
              fontSize: 15, fontWeight: 600, textDecoration: "none",
              fontFamily: "inherit",
            }}>
              Shop Now <span style={{ fontSize: 18 }}>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ========== VIAL SVG ========== */
function VialSVG({ name = "BPC-157", dose = "5 mg", size = 180 }: { name?: string; dose?: string; size?: number }) {
  const h = size * 1.85
  return (
    <div style={{ position: "relative", width: size, height: h }}>
      <svg viewBox="0 0 200 370" width={size} height={h} style={{ overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id="vg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9FBEE8" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#C7DBF2" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#5C7FA8" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="vl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#13234A" />
            <stop offset="100%" stopColor="#08122A" />
          </linearGradient>
          <linearGradient id="vc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2D4174" />
            <stop offset="100%" stopColor="#13234A" />
          </linearGradient>
          <linearGradient id="vco" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C8CA8" />
            <stop offset="20%" stopColor="#D6DDE9" />
            <stop offset="50%" stopColor="#A4B0C5" />
            <stop offset="80%" stopColor="#D6DDE9" />
            <stop offset="100%" stopColor="#7C8CA8" />
          </linearGradient>
          <linearGradient id="vlq" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8D2EE" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7AA2D8" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <rect x="68" y="6" width="64" height="22" rx="3" fill="url(#vc)" />
        <rect x="68" y="6" width="64" height="6" rx="3" fill="#0A132A" opacity="0.4" />
        <rect x="62" y="26" width="76" height="18" rx="2" fill="url(#vco)" />
        <rect x="62" y="26" width="76" height="2" fill="rgba(0,0,0,0.25)" />
        <rect x="62" y="42" width="76" height="2" fill="rgba(0,0,0,0.25)" />
        <path d="M62 44 L62 50 Q62 56 68 56 L132 56 Q138 56 138 50 L138 44 L138 320 Q138 340 118 340 L82 340 Q62 340 62 320 Z" fill="url(#vg)" opacity="0.55" />
        <path d="M62 44 L62 320 Q62 340 82 340 L118 340 Q138 340 138 320 L138 44" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
        <path d="M64 200 L64 318 Q64 338 84 338 L116 338 Q136 338 136 318 L136 200 Z" fill="url(#vlq)" />
        <ellipse cx="100" cy="200" rx="36" ry="3" fill="rgba(255,255,255,0.4)" />
        <rect x="68" y="118" width="64" height="190" rx="4" fill="url(#vl)" />
        <rect x="68" y="118" width="64" height="8" fill="rgba(255,255,255,0.06)" />
        <text x="100" y="148" textAnchor="middle" fill="#fff" fontFamily="system-ui" fontSize="13" fontWeight="700" letterSpacing="0.5">
          {name.length > 9 ? name.slice(0, 9) : name}
        </text>
        <rect x="80" y="158" width="40" height="14" rx="7" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
        <text x="100" y="168" textAnchor="middle" fill="#E7ECF7" fontFamily="monospace" fontSize="9" letterSpacing="0.5">{dose}</text>
        <text transform="translate(124, 290) rotate(-90)" fill="#fff" fontFamily="system-ui" fontSize="14" fontWeight="600" letterSpacing="3">PEPTIDESFARMA</text>
        <rect x="78" y="270" width="44" height="14" rx="2" fill="rgba(79,138,247,0.20)" stroke="rgba(79,138,247,0.45)" strokeWidth="0.5" />
        <text x="100" y="280" textAnchor="middle" fill="#4F8AF7" fontFamily="monospace" fontSize="8" letterSpacing="0.6">99% PURITY</text>
        <text x="100" y="298" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontFamily="system-ui" fontSize="6" letterSpacing="0.4">RESEARCH USE ONLY</text>
        <path d="M70 60 L70 320 Q70 332 80 334" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" />
        <ellipse cx="80" cy="85" rx="3" ry="14" fill="rgba(255,255,255,0.5)" />
        <ellipse cx="100" cy="338" rx="36" ry="4" fill="rgba(0,0,0,0.30)" />
      </svg>
    </div>
  )
}
