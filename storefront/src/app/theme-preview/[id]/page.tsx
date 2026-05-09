"use client"

import Link from "next/link"
import { use } from "react"

const themes: Record<string, { name: string; dark: string; hero: string; light: string; accent: string; accentText: string; cardBg: string }> = {
  "1": {
    name: "Soft Lavender",
    dark: "#2D2B55",
    hero: "linear-gradient(180deg, #2D2B55 0%, #3D3870 100%)",
    light: "#F0EBF8",
    accent: "#9B8EC4",
    accentText: "#6B5B9A",
    cardBg: "#F7F4FC",
  },
  "2": {
    name: "Blush Pink",
    dark: "#3B2838",
    hero: "linear-gradient(180deg, #3B2838 0%, #4D3548 100%)",
    light: "#FDF0F0",
    accent: "#D4849A",
    accentText: "#A85670",
    cardBg: "#FBF0F3",
  },
  "3": {
    name: "Soft Sage",
    dark: "#1E3332",
    hero: "linear-gradient(180deg, #1E3332 0%, #2A4544 100%)",
    light: "#EDF5F0",
    accent: "#6BA68A",
    accentText: "#3D7A5C",
    cardBg: "#F0F7F3",
  },
  "4": {
    name: "Warm Champagne",
    dark: "#352D24",
    hero: "linear-gradient(180deg, #352D24 0%, #4A3F32 100%)",
    light: "#FBF8F2",
    accent: "#C4A97D",
    accentText: "#8B7650",
    cardBg: "#F9F5ED",
  },
  "5": {
    name: "Steel Blue (#BACAD9)",
    dark: "#BACAD9",
    hero: "linear-gradient(180deg, #BACAD9 0%, #A8B8C9 100%)",
    light: "#F2F5F8",
    accent: "#6B8CAE",
    accentText: "#4A6B8A",
    cardBg: "#EEF2F6",
  },
  "6": {
    name: "Amino Pastel Purple",
    dark: "#E8E5FF",
    hero: "linear-gradient(180deg, rgba(232,229,255,0.95) 0%, rgba(203,229,252,0.95) 100%)",
    light: "#F2F0FF",
    accent: "#7B6BC4",
    accentText: "#5B4BA0",
    cardBg: "#F5F3FF",
  },
  "7": {
    name: "Amino Soft Green",
    dark: "#E9FCE6",
    hero: "linear-gradient(180deg, #E9FCE6 0%, #D4F5D0 100%)",
    light: "#F0FFEE",
    accent: "#4CAF50",
    accentText: "#2E7D32",
    cardBg: "#F2FCF0",
  },
  "8": {
    name: "Cloud Periwinkle",
    dark: "#D6DEFF",
    hero: "linear-gradient(180deg, #D6DEFF 0%, #C4CFF5 100%)",
    light: "#EDEFFE",
    accent: "#6366F1",
    accentText: "#4F46E5",
    cardBg: "#F0F1FE",
  },
  "9": {
    name: "Powder Rose",
    dark: "#F5E0E8",
    hero: "linear-gradient(180deg, #F5E0E8 0%, #EEDAE4 100%)",
    light: "#FDF5F8",
    accent: "#E07A9E",
    accentText: "#C45577",
    cardBg: "#FBF0F4",
  },
  "10": {
    name: "Ice Mint",
    dark: "#D5F0EB",
    hero: "linear-gradient(180deg, #D5F0EB 0%, #C2E8E0 100%)",
    light: "#EEFAF7",
    accent: "#3AAFA9",
    accentText: "#2A8A85",
    cardBg: "#E8F8F4",
  },
  "11": {
    name: "Frost to Sky",
    dark: "#c8d5e5",
    hero: "linear-gradient(180deg, #f7f8fa 0%, #c8d5e5 100%)",
    light: "#F5F7FA",
    accent: "#7B9ABF",
    accentText: "#4A6B8A",
    cardBg: "#EDF1F6",
  },
  "12": {
    name: "Soft Iris",
    dark: "#eeecfd",
    hero: "linear-gradient(180deg, #f7f6fe 0%, #eeecfd 100%)",
    light: "#F8F7FE",
    accent: "#8B83D6",
    accentText: "#6B5FB8",
    cardBg: "#F3F2FD",
  },
  "13": {
    name: "Frost Iris",
    dark: "#dde2f2",
    hero: "linear-gradient(180deg, #f7f8fa 0%, #e4e3f8 50%, #c8d5e5 100%)",
    light: "#F5F6FB",
    accent: "#8090BF",
    accentText: "#5A6A9A",
    cardBg: "#EDEEF8",
  },
}

export default function ThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = themes[id]
  const isLightHero = parseInt(id) >= 5
  const heroText = isLightHero ? "#1a1a1a" : "#fff"
  const heroTextMuted = isLightHero ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.65)"
  const heroTextSoft = isLightHero ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.5)"
  const heroBorder = isLightHero ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.15)"
  const heroBtnBg = isLightHero ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"
  const navBg = isLightHero ? t.dark : t.dark
  const navText = isLightHero ? "#1a1a1a" : "#fff"
  const navIconColor = isLightHero ? "#1a1a1a" : "#fff"

  if (!t) {
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <h1>Theme not found</h1>
        <Link href="/theme-preview">Back to themes</Link>
      </div>
    )
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* Nav bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div style={{ background: t.accent, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 13 }}>Use coupon code &quot;RESEARCH10&quot; and get 10% off.</span>
        </div>
        <div style={{ background: navBg, padding: "0 40px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: navText, fontWeight: 700, fontSize: 18 }}>PeptidesFarma</span>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <span style={{ color: navText, opacity: 0.85, fontSize: 15 }}>Catalog</span>
            <span style={{ color: navText, opacity: 0.85, fontSize: 15 }}>Products</span>
            <span style={{ color: navText, opacity: 0.85, fontSize: 15 }}>Contact Us</span>
            <span style={{ color: navText, opacity: 0.85, fontSize: 15 }}>About Us</span>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={navIconColor} strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={navIconColor} strokeWidth="1.5"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" /></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={navIconColor} strokeWidth="1.5"><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: isLightHero ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={navIconColor} strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M5.5 20.5a8.38 8.38 0 0 1 13 0" /></svg>
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent 0%, ${t.accent}60 20%, ${t.accent}60 80%, transparent 100%)` }} />
      </div>

      {/* Hero */}
      <div style={{ background: t.hero, paddingTop: 180, paddingBottom: 100, color: heroText }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: heroBtnBg, border: `1px solid ${heroBorder}`, borderRadius: 999, marginBottom: 24, fontSize: 12, color: heroTextMuted }}>
              Third-party HPLC verified
            </div>
            <h1 style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.02, margin: "0 0 16px" }}>
              Research-grade<br />peptides.
            </h1>
            <p style={{ fontSize: 38, fontStyle: "italic", fontFamily: "Georgia, serif", color: t.accent, margin: "0 0 28px", lineHeight: 1.2 }}>
              Verified before they ship.
            </p>
            <p style={{ fontSize: 16, color: heroTextMuted, lineHeight: 1.6, maxWidth: 480, margin: "0 0 32px" }}>
              Pharmaceutical-grade compounds for laboratory research. Lot-traced and shipped with a Certificate of Analysis on every order.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ padding: "12px 28px", borderRadius: 999, background: t.accent, color: "#fff", fontSize: 15, fontWeight: 600 }}>Shop the catalog &rarr;</span>
              <span style={{ padding: "12px 28px", borderRadius: 999, border: `1px solid ${heroBorder}`, color: heroText, fontSize: 15 }}>View lab reports</span>
            </div>
            <div style={{ display: "flex", gap: 32, marginTop: 36, paddingTop: 24, borderTop: `1px solid ${heroBorder}` }}>
              {[{ v: "99.2%", l: "Avg purity" }, { v: "27", l: "Compounds" }, { v: "48hr", l: "Median ship" }].map((s) => (
                <div key={s.l}>
                  <div style={{ fontSize: 22, fontWeight: 600 }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: heroTextSoft, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", height: 480, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/icons/glp-3.png" alt="" style={{ position: "absolute", width: 440, left: -120, top: 60, opacity: 0.85, animation: "pf-float-y 7s ease-in-out infinite" }} />
            <img src="/icons/ghk-cu.png" alt="" style={{ position: "absolute", width: 400, left: 120, top: 140, opacity: 0.85, animation: "pf-float-y 8s ease-in-out 1s infinite" }} />
            <img src="/icons/nad+.png" alt="" style={{ position: "absolute", width: 420, left: 10, top: 30, zIndex: 2, animation: "pf-float-y 6s ease-in-out 0.5s infinite" }} />
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "28px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
          {["Fast shipping", "Third-party tested", "99%+ purity", "Lot-traced"].map((t) => (
            <div key={t} style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: "#333" }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Products section */}
      <div style={{ background: t.light, padding: "64px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "#1a1a1a", textAlign: "center", marginBottom: 8 }}>
            Best <span style={{ color: t.accentText }}>Sellers</span>
          </h2>
          <p style={{ textAlign: "center", color: "#888", marginBottom: 40 }}>Our most popular research compounds this quarter.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {["Retatrutide", "BPC-157", "Tesamorelin", "NAD+"].map((name) => (
              <div key={name} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #eee" }}>
                <div style={{ background: t.cardBg, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 60, height: 100, borderRadius: 8, background: `${t.accent}20`, border: `1px solid ${t.accent}30` }} />
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>{name}</div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>From <span style={{ fontWeight: 600, color: "#1a1a1a", fontSize: 16 }}>$49.99</span></div>
                  <button style={{ width: "100%", padding: "10px 0", borderRadius: 999, background: t.accent, color: "#fff", border: "none", fontWeight: 600, fontSize: 13 }}>Add to cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why choose section */}
      <div style={{ background: "#fff", padding: "64px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", color: "#1a1a1a", marginBottom: 40 }}>Why choose <span style={{ color: t.accentText }}>Peptidesfarma?</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { h: "Always in Stock", s: "Top peptides ready to ship." },
              { h: "Volume Pricing", s: "Bulk pricing for larger orders." },
              { h: "Safe Shipping", s: "Cold-pack with full tracking." },
            ].map((c) => (
              <div key={c.h} style={{ padding: 28, background: "#fff", borderRadius: 14, border: "1px solid #eee" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${t.accent}20`, marginBottom: 16 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>{c.h}</div>
                <div style={{ fontSize: 14, color: "#888" }}>{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: isLightHero ? "#1a1a1a" : t.dark, padding: "48px 40px 24px", color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>PeptidesFarma</span>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 8, maxWidth: 300 }}>Pharmaceutical-grade research peptides. Independently verified.</p>
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            {["Home", "Legal", "Contact"].map((col) => (
              <div key={col}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>{col}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Link 1</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Link 2</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 16, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          &copy; 2026 Peptidesfarma. All rights reserved.
        </div>
      </div>

      {/* Theme selector */}
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 100, display: "flex", gap: 8, background: "#fff", padding: "10px 16px", borderRadius: 999, boxShadow: "0 4px 24px rgba(0,0,0,0.15)", border: "1px solid #eee" }}>
        <Link href="/theme-preview" style={{ fontSize: 13, fontWeight: 600, color: "#888", textDecoration: "none", padding: "6px 12px" }}>All</Link>
        {Object.keys(themes).map((tid) => (
          <Link key={tid} href={`/theme-preview/${tid}`} style={{
            fontSize: 13, fontWeight: 600, textDecoration: "none", padding: "6px 16px", borderRadius: 999,
            background: tid === id ? themes[tid].accent : "transparent",
            color: tid === id ? "#fff" : "#888",
          }}>
            {tid}
          </Link>
        ))}
        <span style={{ fontSize: 13, fontWeight: 700, color: t.accentText, padding: "6px 12px" }}>{t.name}</span>
      </div>
    </div>
  )
}
