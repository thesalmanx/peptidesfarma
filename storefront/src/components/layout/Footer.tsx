"use client"

import Link from "next/link"
import { useState } from "react"

/* ─── Newsletter ─── */
function NewsletterSection() {
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
      setError(err.message || "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <section style={{ background: "#fff", padding: "24px 20px 32px" }} className="md:px-20 md:py-8">
      <div className="relative w-full max-w-[1280px] mx-auto">
        <div
          className="relative flex flex-col items-center md:items-start md:flex-row md:justify-between w-full gap-8 md:gap-6 rounded-[20px] md:rounded-[24px] transition-shadow duration-300"
          style={{
            padding: "48px 40px",
            background: "linear-gradient(180deg, var(--pf-blue-tint) 11%, #E8EEFF 100%)",
            border: "2px solid #fff",
          }}
        >
          <div className="flex flex-col items-center md:items-start gap-6 md:gap-4">
            <h2
              className="text-[32px] leading-[40px] md:text-[48px] md:leading-[56px] text-center md:text-left"
              style={{ fontWeight: 700, letterSpacing: "-0.04em", color: "var(--pf-ink)" }}
            >
              Subscribe to our{" "}
              <span style={{ color: "var(--pf-blue)" }}>Newsletter</span>
            </h2>
            <p
              className="text-[16px] leading-[24px] md:text-[20px] md:leading-[22px] text-center md:text-left"
              style={{ fontWeight: 400, color: "var(--pf-text-2)" }}
            >
              New lots, COA drops, handling guides and research updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-start w-full md:w-auto shrink-0 gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              disabled={loading || added}
              className="outline-none w-full md:w-[360px] text-center md:text-left disabled:opacity-60"
              style={{
                height: 48, padding: "12px 16px",
                background: "rgba(255,255,255,0.5)",
                border: "1px solid var(--pf-ink)",
                borderRadius: 16, fontSize: 16, color: "var(--pf-ink)",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              disabled={loading || added}
              className="pf-btn pf-btn--primary shrink-0 w-full md:w-auto"
              style={{ height: 48, padding: "12px 28px", borderRadius: 999 }}
            >
              {loading ? (
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" /></svg>
              ) : added ? "Subscribed!" : "Subscribe"}
            </button>
            {error && <p style={{ color: "var(--pf-err)", fontSize: 13, width: "100%", textAlign: "center" }}>{error}</p>}
          </form>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer columns (Figma) ─── */
const columns = [
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

const trustBadges = [
  { label: "SSL Secured", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
  { label: "99%+ purity", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V3" /><path d="M9 3h6" /></svg> },
  { label: "Same day delivery", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="12" height="10" rx="1" /><path d="M14 10h4l3 3v4h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg> },
]

export default function Footer() {
  return (
    <>
      <NewsletterSection />
      <footer style={{ background: "linear-gradient(180deg, #c8d5e5 0%, #f7f8fa 100%)", color: "var(--pf-ink)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="max-w-[1280px] mx-auto px-5 md:px-9 lg:px-12">
          <div className="py-12 lg:py-14 flex flex-col gap-10 lg:gap-20">
            <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-20">
              {/* Logo */}
              <div className="shrink-0">
                <Link href="/">
                  <img src="/peptidesfarma-logo-dark.svg" alt="PeptidesFarma" style={{ height: 36 }} />
                </Link>
                <p style={{ fontSize: 14, lineHeight: "20px", color: "var(--pf-text-2)", margin: "12px 0 0", maxWidth: 260 }}>
                  Premium research-grade peptides with verified purity and full documentation.
                </p>
              </div>

              {/* Link columns */}
              <nav aria-label="Footer navigation" className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-8 lg:gap-12 flex-1 w-full">
                {columns.map((col, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <h4 className="text-[16px] font-semibold leading-6 tracking-[-0.01em]" style={{ color: "var(--pf-ink)", margin: 0 }}>{col.title}</h4>
                    <div className="flex flex-col gap-2">
                      {col.links.map((link, j) => (
                        <Link
                          key={j}
                          href={link.url}
                          className="text-[14px] font-normal leading-5 tracking-[-0.03em] hover:opacity-70 transition-opacity"
                          style={{
                            textDecoration: (link as any).underline ? "underline" : "none",
                            color: "var(--pf-text-2)",
                          }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Trust badges - desktop */}
          <div className="hidden lg:flex items-center justify-between py-4">
            <div className="flex items-center" style={{ gap: 24 }}>
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2" style={{ color: "var(--pf-text-2)" }}>
                  {badge.icon}
                  <span className="text-[14px] font-normal leading-5 tracking-[-0.03em]">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" style={{ borderColor: "var(--pf-line)" }} />

          {/* Bottom bar - desktop */}
          <div className="hidden lg:flex justify-between items-center py-4">
            <span className="text-[14px] font-normal leading-5 tracking-[-0.03em]" style={{ color: "var(--pf-text-3)" }}>
              &copy; {new Date().getFullYear()} PeptidesFarma. All rights reserved. For research use only.
            </span>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="hover:opacity-70 transition-opacity" style={{ color: "var(--pf-text-2)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-70 transition-opacity" style={{ color: "var(--pf-text-2)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:opacity-70 transition-opacity" style={{ color: "var(--pf-text-2)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            </div>
          </div>

          {/* Mobile bottom */}
          <div className="lg:hidden py-6 flex flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center" style={{ gap: "16px 24px" }}>
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2" style={{ color: "var(--pf-text-2)" }}>
                  {badge.icon}
                  <span className="text-[14px] font-normal leading-5 tracking-[-0.03em]">{badge.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" aria-label="Discord" style={{ color: "var(--pf-text-2)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: "var(--pf-text-2)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" style={{ color: "var(--pf-text-2)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            </div>
            <span className="text-[14px] font-normal leading-6 tracking-[-0.03em] text-center" style={{ color: "var(--pf-text-3)" }}>
              &copy; {new Date().getFullYear()} PeptidesFarma. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
