"use client"

import Link from "next/link"
import { useState } from "react"

/* ─── Social Icons ─── */
function IconFacebook() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function IconLinkedIn() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

function IconYouTube() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
    </svg>
  )
}

function IconDiscord() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

/* ─── Footer columns ─── */
const footerColumns = [
  {
    title: "Products",
    links: [
      { label: "BPC-157", url: "/product/bpc-157" },
      { label: "GHK-Cu", url: "/product/ghk-cu" },
      { label: "NAD+", url: "/product/nad" },
      { label: "Epithalon", url: "/product/epithalon" },
      { label: "View all products", url: "/products", underline: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", url: "/about" },
      { label: "Track Your Order", url: "/account/orders" },
      { label: "Lab Reports", url: "/about" },
      { label: "Careers", url: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", url: "/contact" },
      { label: "FAQ", url: "/faq" },
      { label: "Shipping Info", url: "/shipping-policy" },
      { label: "Returns", url: "/refund-policy" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", url: "/terms-of-service" },
      { label: "Privacy Policy", url: "/privacy-policy" },
      { label: "Disclaimer", url: "/about" },
    ],
  },
]

export default function Footer() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Failed to subscribe")
      }
      setLoading(false)
      setAdded(true)
      setEmail("")
      setTimeout(() => setAdded(false), 3000)
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
      setLoading(false)
    }
  }

  return (
    <footer className="px-4 md:px-6" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: "40px 40px 20px 20px", background: "#001C86", maxWidth: 1392, margin: "0 auto" }}>
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div style={{
            position: "absolute", width: "120%", height: "120%",
            left: "-10%", top: "-50%",
            background: "linear-gradient(310deg, #001C86 0%, rgba(255,255,255,0.15) 75%)",
            mixBlendMode: "plus-lighter",
            opacity: 0.5,
            filter: "blur(60px)",
            transform: "rotate(27deg)",
          }} />
        </div>

        {/* Top section */}
        <div className="relative z-10" style={{ padding: "96px 48px 48px" }}>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-12">
            {/* Left: Brand + email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 48 }} className="w-full lg:w-[440px] lg:shrink-0 items-center lg:items-start">
              {/* Brand */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="items-center lg:items-start">
                <span style={{ fontSize: 20, fontWeight: 500, lineHeight: "30px", color: "#fff", fontFamily: "var(--pf-display)" }}>
                  PeptidesFarma
                </span>
                <p className="text-center lg:text-left" style={{ fontSize: 14, lineHeight: "20px", color: "rgba(255,255,255,0.72)", margin: 0, maxWidth: 283 }}>
                  Premium research-grade peptides with verified purity and full documentation.
                </p>
              </div>

              {/* Email form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full lg:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  disabled={loading || added}
                  className="outline-none w-full lg:w-[361px] disabled:opacity-60"
                  style={{
                    height: 48, padding: "12px 24px",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid #fff",
                    borderRadius: 99,
                    fontSize: 16, lineHeight: "24px", color: "#fff",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || added}
                  className="disabled:cursor-default"
                  style={{
                    height: 48, padding: "12px 24px",
                    background: "#fff", borderRadius: 99, border: "none",
                    fontSize: 16, lineHeight: "24px", color: "#001C86",
                    fontWeight: 400, fontFamily: "inherit",
                    cursor: loading || added ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "fit-content",
                  }}
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#001C86" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
                    </svg>
                  ) : added ? "Subscribed!" : "Subscribe"}
                </button>
                {error && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{error}</p>}
              </form>
            </div>

            {/* Right: 4 link columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8 flex-1">
              {footerColumns.map((col, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <h4 style={{ fontSize: 20, fontWeight: 500, lineHeight: "30px", color: "#fff", margin: 0 }}>
                    {col.title}
                  </h4>
                  {col.links.map((link, j) => (
                    <Link
                      key={j}
                      href={link.url}
                      style={{
                        fontSize: 14, lineHeight: "20px", color: "rgba(255,255,255,0.72)",
                        textDecoration: (link as any).underline ? "underline" : "none",
                      }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4" style={{ padding: "48px" }}>
            <p className="text-center md:text-left" style={{ fontSize: 14, lineHeight: "20px", color: "rgba(255,255,255,0.72)", margin: 0 }}>
              &copy; {new Date().getFullYear()} PeptidesFarma. All rights reserved. For research use only.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:opacity-70 transition-opacity"><IconFacebook /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-70 transition-opacity"><IconInstagram /></a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:opacity-70 transition-opacity"><IconX /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:opacity-70 transition-opacity"><IconLinkedIn /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:opacity-70 transition-opacity"><IconYouTube /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
