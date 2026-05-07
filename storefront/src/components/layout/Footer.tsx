"use client"

import Link from "next/link"
import { useState } from "react"

function PFMonogram({ size = 32, bg = "var(--pf-blue)" }: { size?: number; bg?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: 8, background: bg, color: "#fff", fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: size * 0.42, letterSpacing: "-0.02em" }}>
      pf
    </span>
  )
}

function Wordmark({ color = "#fff", size = 16 }: { color?: string; size?: number }) {
  return (
    <span style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: size, letterSpacing: "-0.02em", color, display: "inline-flex", alignItems: "baseline" }}>
      peptides<span style={{ color: "var(--pf-blue-soft)" }}>farma</span>
    </span>
  )
}

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
              ) : added ? (
                "Subscribed!"
              ) : (
                "Subscribe"
              )}
            </button>
            {error && <p style={{ color: "var(--pf-err)", fontSize: 13, width: "100%", textAlign: "center" }}>{error}</p>}
          </form>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
const columns = [
  { title: "Home", links: [{ label: "Shop", url: "/products" }, { label: "About", url: "/about" }, { label: "Contact Us", url: "/contact" }] },
  { title: "Legal pages", links: [{ label: "FAQs", url: "/faq" }, { label: "Terms & conditions", url: "/terms-of-service" }, { label: "Privacy policy", url: "/privacy-policy" }, { label: "Shipping & Returns", url: "/shipping-and-returns" }] },
  { title: "Contact", links: [{ label: "support@peptidesfarma.com", url: "mailto:support@peptidesfarma.com" }] },
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
      <footer style={{ background: "linear-gradient(180deg, #1B2A4A 0%, #243660 100%)", color: "#fff", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="max-w-[1280px] mx-auto px-9 lg:px-0">
          <div className="py-12 lg:py-14 flex flex-col gap-10 lg:gap-24">
            <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-20">
              <div className="shrink-0">
                <Link href="/">
                  <img src="/peptidesfarma-logo-light.svg" alt="PeptidesFarma" style={{ height: 36 }} />
                </Link>
              </div>

              <div className="flex flex-col gap-6 lg:flex-1 w-full">
                <div className="grid grid-cols-2 gap-20 lg:hidden">
                  {columns.slice(0, 2).map((col, i) => (
                    <div key={i} className="flex flex-col gap-[10px]">
                      <h4 className="text-[16px] font-semibold leading-6 tracking-[-0.01em]" style={{ color: "#fff" }}>{col.title}</h4>
                      <div className="flex flex-col gap-2">
                        {col.links.map((link, j) => (
                          <Link key={j} href={link.url} className="text-[14px] font-normal leading-5 tracking-[-0.03em] hover:opacity-70 transition-colors whitespace-pre-line" style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)" }}>
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {columns.length > 2 && (
                  <div className="flex flex-col gap-3 lg:hidden">
                    <h4 className="text-[16px] font-semibold leading-6 tracking-[-0.01em]" style={{ color: "var(--pf-ink)" }}>{columns[2].title}</h4>
                    <div className="flex flex-col gap-2">
                      {columns[2].links.map((link, j) => (
                        <Link key={j} href={link.url} className="text-[14px] font-normal leading-5 tracking-[-0.03em] hover:opacity-70 transition-colors whitespace-pre-line" style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)" }}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <nav aria-label="Footer navigation" className="hidden lg:grid lg:grid-cols-3 gap-20 w-full">
                  {columns.map((col, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <h4 className="text-[16px] font-semibold leading-6 tracking-[-0.01em]" style={{ color: "#fff" }}>{col.title}</h4>
                      <div className="flex flex-col gap-3">
                        {col.links.map((link, j) => (
                          <Link key={j} href={link.url} className="text-[16px] font-normal leading-6 tracking-[-0.03em] hover:opacity-70 transition-colors whitespace-pre-line" style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)" }}>
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div className="border-t lg:hidden" style={{ borderColor: "rgba(255,255,255,0.10)" }} />

          <div className="py-4 flex flex-col gap-6 lg:hidden">
            <div className="flex flex-col items-center gap-6">
              <span className="text-[16px] font-normal leading-6 tracking-[-0.03em] text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                &copy; {new Date().getFullYear()} Peptidesfarma
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center" style={{ gap: "16px 24px" }}>
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {badge.icon}
                  <span className="text-[14px] font-normal leading-5 tracking-[-0.03em]">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex flex-col">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center" style={{ gap: 24 }}>
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {badge.icon}
                    <span className="text-[14px] font-normal leading-5 tracking-[-0.03em]">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.10)" }} />
            <div className="py-4 flex justify-center">
              <span className="text-[14px] font-normal leading-5 tracking-[-0.03em] text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                &copy; {new Date().getFullYear()} Peptidesfarma. All rights reserved. For research purposes only.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
