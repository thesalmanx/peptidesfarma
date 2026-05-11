"use client"

import { useState } from "react"

export default function Newsletter() {
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
    <section className="bg-white px-5 py-6 md:px-20 md:py-8">
      <div className="w-full max-w-[1280px] mx-auto">
        <div
          className="relative flex flex-col items-center gap-8 rounded-[24px] md:rounded-[32px] overflow-hidden"
          style={{
            padding: "56px 32px",
            background: "linear-gradient(135deg, rgba(0,28,134,0.06) 0%, rgba(79,138,247,0.10) 50%, rgba(0,28,134,0.04) 100%)",
            border: "1px solid rgba(79,138,247,0.12)",
          }}
        >
          {/* Decorative blurred circles */}
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(79,138,247,0.08)", filter: "blur(60px)", top: -40, right: -40, pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "rgba(0,28,134,0.06)", filter: "blur(50px)", bottom: -30, left: -30, pointerEvents: "none" }} />

          {/* Mail icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 99,
            background: "rgba(0,28,134,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#001C86">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>

          {/* Text */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, maxWidth: 480, position: "relative", zIndex: 1 }}>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700,
              letterSpacing: "-0.03em", color: "#05144D",
              textAlign: "center", margin: 0, lineHeight: 1.15,
              fontFamily: "var(--pf-display)",
            }}>
              Subscribe to our{" "}
              <span style={{
                background: "linear-gradient(90deg, #001C86 0%, #4F8AF7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Newsletter
              </span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: "24px", color: "#4A557E", textAlign: "center", margin: 0 }}>
              New lots, COA drops, handling guides and research updates.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3"
            style={{ position: "relative", zIndex: 1 }}
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading || added}
              autoComplete="email"
              className="outline-none w-full sm:w-[320px] disabled:opacity-60"
              style={{
                height: 48, padding: "12px 20px",
                background: "#fff",
                border: "1px solid var(--pf-line)",
                borderRadius: 999,
                fontSize: 14, color: "var(--pf-ink)",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              disabled={loading || added}
              className="pf-btn pf-btn--primary shrink-0 w-full sm:w-auto disabled:cursor-default"
              style={{
                height: 48, padding: "12px 28px",
                fontSize: 14, fontWeight: 600,
              }}
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
                </svg>
              ) : added ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#fff" />
                  </svg>
                  Subscribed!
                </span>
              ) : (
                "Subscribe"
              )}
            </button>
            {error && (
              <p style={{ color: "var(--pf-err)", fontSize: 13, margin: 0, textAlign: "center", width: "100%" }}>{error}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
