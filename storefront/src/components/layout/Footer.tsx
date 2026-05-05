"use client"

import Link from "next/link"
import { useState } from "react"

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

function Wordmark({ color = "#fff", size = 16 }: { color?: string; size?: number }) {
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

export default function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubscribed(true)
        setEmail("")
        setTimeout(() => setSubscribed(false), 3000)
      }
    } catch {}
    setLoading(false)
  }

  const columns = [
    { h: "Catalog", links: [{ label: "All products", href: "/products" }, { label: "Best sellers", href: "/products" }, { label: "New lots", href: "/products" }, { label: "Lab support", href: "/contact" }] },
    { h: "Company", links: [{ label: "About", href: "/about" }, { label: "Lab reports", href: "/about" }, { label: "Contact", href: "/contact" }] },
    { h: "Support", links: [{ label: "FAQ", href: "/faq" }, { label: "Shipping & returns", href: "/shipping-and-returns" }, { label: "COA library", href: "/about" }] },
    { h: "Legal", links: [{ label: "Research disclaimer", href: "/terms-of-service" }, { label: "Terms", href: "/terms-of-service" }, { label: "Privacy", href: "/privacy-policy" }] },
  ]

  return (
    <footer className="pf-starfield" style={{ color: "var(--pf-dark-text)", paddingTop: 80, marginTop: 0 }}>
      <div className="pf-wrap">
        {/* Newsletter band */}
        <div
          className="pf-card--dark pf-news-band"
          style={{
            padding: "40px 48px",
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 40,
            alignItems: "center",
            marginBottom: 64,
            borderRadius: 16,
          }}
        >
          <div>
            <div className="pf-eyebrow pf-eyebrow--dark" style={{ marginBottom: 12 }}>The lab notebook</div>
            <h3 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 8px", color: "#fff" }}>
              Method notes, COAs and new lots, in your inbox.
            </h3>
            <p style={{ color: "var(--pf-dark-text-2)", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Once a fortnight. Lot drops, reconstitution references, lab handling tips. No marketing junk.
            </p>
          </div>
          <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@lab.org"
              disabled={loading || subscribed}
              style={{
                flex: 1,
                height: 52,
                padding: "0 18px",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 999,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button type="submit" className="pf-btn pf-btn--primary pf-btn--lg" disabled={loading || subscribed}>
              {subscribed ? "Subscribed!" : loading ? "..." : "Subscribe"}
            </button>
          </form>
        </div>

        {/* Footer columns */}
        <div
          className="pf-footer-cols"
          style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4, 1fr)", gap: 48, paddingBottom: 64 }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <PFMonogram size={32} bg="var(--pf-blue)" />
              <Wordmark color="#fff" size={16} />
            </div>
            <p style={{ color: "var(--pf-dark-text-2)", fontSize: 13, lineHeight: 1.7, margin: 0, maxWidth: 320 }}>
              Pharmaceutical-grade research peptides. Independently HPLC verified, lot-traced and supplied for laboratory use only.
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
              <span className="pf-chip">SSL Secured</span>
              <span className="pf-chip">99%+ Purity</span>
              <span className="pf-chip">Same-Day Ship</span>
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.h}>
              <div style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pf-dark-text-2)", marginBottom: 16 }}>
                {col.h}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} style={{ color: "#fff", fontSize: 13, opacity: 0.8, textDecoration: "none" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pf-rule pf-rule--dark" />

        <div
          className="pf-footer-bottom"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 0 40px",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 12, color: "var(--pf-dark-text-2)" }}>
            &copy; {new Date().getFullYear()} Peptidesfarma &middot; For research purposes only. Not for human consumption.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--pf-dark-text-2)" }}>
            <span>VISA</span>
            <span>MC</span>
            <span>AMEX</span>
            <span>Apple Pay</span>
            <span>Google Pay</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
