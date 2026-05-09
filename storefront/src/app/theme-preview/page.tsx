"use client"

import Link from "next/link"

const themes = [
  {
    id: 1,
    name: "Soft Lavender",
    dark: "#2D2B55",
    hero: "linear-gradient(180deg, #2D2B55 0%, #3D3870 100%)",
    light: "#F0EBF8",
    accent: "#9B8EC4",
  },
  {
    id: 2,
    name: "Blush Pink",
    dark: "#3B2838",
    hero: "linear-gradient(180deg, #3B2838 0%, #4D3548 100%)",
    light: "#FDF0F0",
    accent: "#D4849A",
  },
  {
    id: 3,
    name: "Soft Sage",
    dark: "#1E3332",
    hero: "linear-gradient(180deg, #1E3332 0%, #2A4544 100%)",
    light: "#EDF5F0",
    accent: "#6BA68A",
  },
  {
    id: 4,
    name: "Warm Champagne",
    dark: "#352D24",
    hero: "linear-gradient(180deg, #352D24 0%, #4A3F32 100%)",
    light: "#FBF8F2",
    accent: "#C4A97D",
  },
  {
    id: 5,
    name: "Steel Blue (#BACAD9)",
    dark: "#BACAD9",
    hero: "linear-gradient(180deg, #BACAD9 0%, #A8B8C9 100%)",
    light: "#F2F5F8",
    accent: "#6B8CAE",
  },
  {
    id: 6,
    name: "Amino Pastel Purple",
    dark: "#E8E5FF",
    hero: "linear-gradient(180deg, rgba(232,229,255,0.9) 0%, rgba(203,229,252,0.9) 100%)",
    light: "#F2F0FF",
    accent: "#7B6BC4",
  },
  {
    id: 7,
    name: "Amino Soft Green",
    dark: "#E9FCE6",
    hero: "linear-gradient(180deg, #E9FCE6 0%, #D4F5D0 100%)",
    light: "#F0FFEE",
    accent: "#4CAF50",
  },
  {
    id: 8,
    name: "Cloud Periwinkle",
    dark: "#D6DEFF",
    hero: "linear-gradient(180deg, #D6DEFF 0%, #C4CFF5 100%)",
    light: "#EDEFFE",
    accent: "#6366F1",
  },
  {
    id: 9,
    name: "Powder Rose",
    dark: "#F5E0E8",
    hero: "linear-gradient(180deg, #F5E0E8 0%, #EEDAE4 100%)",
    light: "#FDF5F8",
    accent: "#E07A9E",
  },
  {
    id: 10,
    name: "Ice Mint",
    dark: "#D5F0EB",
    hero: "linear-gradient(180deg, #D5F0EB 0%, #C2E8E0 100%)",
    light: "#EEFAF7",
    accent: "#3AAFA9",
  },
  {
    id: 11,
    name: "Frost to Sky",
    dark: "#c8d5e5",
    hero: "linear-gradient(180deg, #f7f8fa 0%, #c8d5e5 100%)",
    light: "#F5F7FA",
    accent: "#7B9ABF",
  },
  {
    id: 12,
    name: "Soft Iris",
    dark: "#eeecfd",
    hero: "linear-gradient(180deg, #f7f6fe 0%, #eeecfd 100%)",
    light: "#F8F7FE",
    accent: "#8B83D6",
  },
  {
    id: 13,
    name: "Frost Iris",
    dark: "#dde2f2",
    hero: "linear-gradient(180deg, #f7f8fa 0%, #e4e3f8 50%, #c8d5e5 100%)",
    light: "#F5F6FB",
    accent: "#8090BF",
  },
]

export default function ThemePreview() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: "40px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>Theme Preview</h1>
        <p style={{ color: "#666", marginBottom: 40, fontSize: 16 }}>Click each theme to see it applied. Go to /theme-preview/1, /theme-preview/2, etc.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }}>
          {themes.map((t) => (
            <Link key={t.id} href={`/theme-preview/${t.id}`} style={{ textDecoration: "none" }}>
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e0e0e0", transition: "box-shadow 200ms", cursor: "pointer" }}>
                {/* Nav preview */}
                <div style={{ background: t.dark, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>PeptidesFarma</span>
                  <div style={{ display: "flex", gap: 20 }}>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Catalog</span>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Products</span>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Contact</span>
                  </div>
                </div>
                {/* Hero preview */}
                <div style={{ background: t.hero, padding: "48px 24px", color: "#fff" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Research-grade peptides.</div>
                  <div style={{ fontSize: 22, fontStyle: "italic", marginBottom: 16, opacity: 0.8, fontFamily: "Georgia, serif" }}>Verified before they ship.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ padding: "8px 20px", borderRadius: 999, background: t.accent, color: "#fff", fontSize: 13, fontWeight: 600 }}>Shop the catalog</span>
                    <span style={{ padding: "8px 20px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 13 }}>View lab reports</span>
                  </div>
                </div>
                {/* Light section preview */}
                <div style={{ background: t.light, padding: "32px 24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {["BPC-157", "NAD+", "Retatrutide"].map((name) => (
                      <div key={name} style={{ background: "#fff", borderRadius: 10, padding: 16, textAlign: "center" }}>
                        <div style={{ width: 40, height: 60, background: t.light, borderRadius: 6, margin: "0 auto 8px", border: `1px solid ${t.accent}40` }} />
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{name}</div>
                        <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>$49.99</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Footer preview */}
                <div style={{ background: t.dark, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>© 2026 Peptidesfarma</span>
                  <span style={{ color: t.accent, fontSize: 12, fontWeight: 600 }}>Theme {t.id}</span>
                </div>
              </div>
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{t.name}</span>
                <span style={{ display: "block", fontSize: 13, color: "#888", marginTop: 2 }}>/theme-preview/{t.id}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
