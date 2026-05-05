"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import ProductCard from "@/components/product/ProductCard"

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
        background: "linear-gradient(180deg, #08122A 0%, #0E1A33 50%, #13234A 100%)",
        color: "#fff",
      }}
    >
      <div className="pf-starfield" style={{ position: "absolute", inset: 0, opacity: 0.7 }} />
      <div style={{ position: "absolute", right: "-10%", top: "10%", width: 720, height: 720, background: "radial-gradient(circle, rgba(79,138,247,0.35), transparent 60%)", filter: "blur(20px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: "-10%", bottom: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(122,162,255,0.18), transparent 60%)", pointerEvents: "none" }} />

      <div className="pf-wrap pf-hero-grid" style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", minHeight: 720, paddingBlock: "80px 96px" }}>
        {/* LEFT */}
        <div>
          <div className="hero-stagger-1" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 16px 6px 6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 999, marginBottom: 28, backdropFilter: "blur(8px)" }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--pf-blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.82)", letterSpacing: "0.01em" }}>Third-party HPLC &middot; 99.2% avg purity</span>
          </div>

          <h1 className="hero-stagger-2" style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(44px, 5.6vw, 78px)", lineHeight: 1.02, letterSpacing: "-0.032em", margin: "0 0 24px", color: "#fff" }}>
            Research-grade peptides.<br />
            <span style={{ fontFamily: "var(--pf-serif)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.015em", background: "linear-gradient(135deg, #B8D2EE 0%, #7AA2FF 60%, #4F8AF7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Verified before they ship.
            </span>
          </h1>

          <p className="hero-stagger-3" style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(255,255,255,0.72)", maxWidth: 520, margin: "0 0 36px" }}>
            Pharmaceutical-grade compounds for laboratory research. Lyophilized, sealed under nitrogen, lot-traced and shipped with a third-party Certificate of Analysis on every order.
          </p>

          <div className="hero-stagger-4" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <Link href="/products" className="pf-btn pf-btn--primary pf-btn--lg" style={{ padding: "0 28px" }}>
              Shop the catalog
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </Link>
            <Link href="/about" className="pf-btn pf-btn--ghost-dark pf-btn--lg">View lab reports</Link>
          </div>

          {/* Trust pills */}
          <div className="pf-hero-stats hero-stagger-5" style={{ display: "flex", gap: 24, flexWrap: "wrap", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            {[
              { v: "99.2%", l: "Avg purity" },
              { v: "27", l: "Compounds" },
              { v: "48hr", l: "Median ship" },
              { v: "3rd-party", l: "HPLC tested" },
            ].map((t) => (
              <div key={t.l}>
                <div style={{ fontSize: 24, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>{t.v}</div>
                <div style={{ fontSize: 11, fontFamily: "var(--pf-mono)", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{t.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Vial area with image */}
        <div className="pf-hero-vials" style={{ position: "relative", height: 620, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(79,138,247,0.4), transparent 55%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", left: "12%", right: "12%", bottom: 80, height: 40, background: "radial-gradient(ellipse, rgba(79,138,247,0.30), transparent 70%)", filter: "blur(20px)" }} />

          {/* Floating info tags */}

          {/* Placeholder vial visual — SVG illustration */}
          <div className="hero-stagger-3" style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
            <div style={{ position: "relative", animation: "pf-float-y 7s ease-in-out infinite" }}>
              <VialSVG name="GLP-3 RT" dose="20 mg" size={280} />
            </div>
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
    <div style={{ background: "#08122A", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", padding: "14px 0" }}>
      <div className="pf-lot-ticker" style={{ display: "flex", gap: 48, animation: "pf-marquee 50s linear infinite", whiteSpace: "nowrap" }}>
        {row.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.7)", fontFamily: "var(--pf-mono)", fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--pf-blue)", boxShadow: "0 0 10px var(--pf-blue)" }} />
            <span style={{ color: "rgba(255,255,255,0.5)" }}>NEW LOT</span>
            <span style={{ color: "#fff", fontWeight: 600 }}>{it.lot}</span>
            <span>&middot;</span>
            <span style={{ color: "#fff" }}>{it.c}</span>
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
    <section style={{ background: "#0E1A33", color: "#fff", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div ref={ref} className="pf-wrap pf-reveal-stagger pf-trust-strip" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, padding: "32px 24px" }}>
        {items.map((t, i) => (
          <div key={t.h} style={{ display: "flex", alignItems: "center", gap: 16, paddingInline: 24, borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(79,138,247,0.12)", border: "1px solid rgba(79,138,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <TrustIcon name={t.icon} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t.h}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{t.s}</div>
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
        <div ref={ref} className="pf-reveal-stagger pf-catalog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
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

/* ========== PROCESS ========== */
function ProcessSection() {
  const ref = useReveal()
  const steps = [
    { n: "01", h: "Synthesis", s: "Solid-phase synthesis under cleanroom conditions" },
    { n: "02", h: "Purification", s: "Reverse-phase HPLC with multi-step gradient" },
    { n: "03", h: "Verification", s: "Independent third-party identity & potency assay" },
    { n: "04", h: "Lyophilization", s: "Freeze-dried into amber vials, sealed under nitrogen" },
    { n: "05", h: "Release", s: "Lot COA generated, retention sample stored" },
  ]
  return (
    <section style={{ padding: "120px 0", background: "#fff" }}>
      <div className="pf-wrap">
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 64px" }}>
          <div className="pf-eyebrow" style={{ marginBottom: 12 }}>How we work</div>
          <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(34px, 4.2vw, 52px)", lineHeight: 1.04, letterSpacing: "-0.028em", margin: "0 0 16px", color: "var(--pf-ink)" }}>From synthesis to your bench</h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--pf-text-2)", margin: 0 }}>Five steps. We retain reference samples for every lot and document each step on the COA.</p>
        </div>
        <div ref={ref} className="pf-reveal-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {steps.map((step) => (
            <div key={step.n} style={{ position: "relative", padding: "28px 24px", background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12 }}>
              <div style={{ fontFamily: "var(--pf-mono)", fontSize: 12, letterSpacing: "0.12em", color: "var(--pf-blue)", marginBottom: 18 }}>{step.n}</div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--pf-ink)", marginBottom: 6 }}>{step.h}</div>
              <div style={{ fontSize: 13, color: "var(--pf-text-2)", lineHeight: 1.55 }}>{step.s}</div>
            </div>
          ))}
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
    <section style={{ padding: "96px 0 120px", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <div className="pf-closing-cta" style={{ background: "linear-gradient(135deg, #08122A 0%, #14213D 50%, #1B2D5C 100%)", borderRadius: 24, padding: "80px 64px", color: "#fff", position: "relative", overflow: "hidden", textAlign: "center" }}>
          <div className="pf-starfield" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
          <div style={{ position: "absolute", top: "-40%", left: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(79,138,247,0.30), transparent 60%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", bottom: "-40%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(122,162,255,0.25), transparent 60%)", filter: "blur(40px)" }} />
          <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
            <div className="pf-eyebrow pf-eyebrow--dark" style={{ marginBottom: 16 }}>Open the catalog</div>
            <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(40px, 5.5vw, 68px)", lineHeight: 1.02, letterSpacing: "-0.032em", margin: "0 0 20px", color: "#fff" }}>
              The catalog opens here.<br />
              <span style={{ fontFamily: "var(--pf-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--pf-blue-soft)" }}>Documented, traced, shipped today.</span>
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", lineHeight: 1.55, margin: "0 0 36px" }}>
              Free shipping on orders over $200. Every vial documented, lot-traced, and HPLC verified.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/products" className="pf-btn pf-btn--primary pf-btn--lg">Shop the catalog &rarr;</Link>
              <Link href="/contact" className="pf-btn pf-btn--ghost-dark pf-btn--lg">Talk to the lab</Link>
            </div>
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
