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
    <section className="bg-white px-5 py-6 md:px-20 md:py-10">
      <div className="w-full max-w-[1280px] mx-auto">
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: 32,
            background: "#05144D",
            padding: 0,
          }}
        >
          {/* Animated gradient mesh bg */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,138,247,0.3) 0%, transparent 70%)", top: -200, right: -100, animation: "pf-float-y 12s ease-in-out infinite" }} />
            <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(122,162,255,0.2) 0%, transparent 70%)", bottom: -150, left: -80, animation: "pf-float-y 10s ease-in-out 2s infinite" }} />
            <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,138,247,0.15) 0%, transparent 70%)", top: "40%", left: "50%", animation: "pf-float-y 8s ease-in-out 1s infinite" }} />
            {/* Grid pattern overlay */}
            <div style={{
              position: "absolute", inset: 0, opacity: 0.04,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start md:justify-between gap-10 md:gap-16 px-8 py-14 md:px-16 md:py-20">
            {/* Left side */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 460 }} className="items-center md:items-start">
              {/* Badge */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 999,
                fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
                Stay Updated
              </span>

              <h2 className="text-center md:text-left" style={{
                fontSize: "clamp(32px, 4.5vw, 48px)", fontWeight: 700,
                letterSpacing: "-0.03em", color: "#fff",
                margin: 0, lineHeight: 1.1,
                fontFamily: "var(--pf-display)",
              }}>
                Subscribe to our{" "}
                <span style={{
                  background: "linear-gradient(90deg, #7AA2FF 0%, #4F8AF7 50%, #7AA2FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Newsletter
                </span>
              </h2>

              <p className="text-center md:text-left" style={{ fontSize: 16, lineHeight: "26px", color: "rgba(255,255,255,0.6)", margin: 0 }}>
                New lots, COA drops, handling guides and research updates. Be the first to know.
              </p>
            </div>

            {/* Right side - form */}
            <div className="w-full md:w-auto flex flex-col gap-4 md:pt-8" style={{ minWidth: 0 }}>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3"
                style={{ width: "100%" }}
              >
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 3,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Email address</span>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    disabled={loading || added}
                    autoComplete="email"
                    className="outline-none w-full md:w-[340px] disabled:opacity-60 focus:border-[#4F8AF7]"
                    style={{
                      height: 52, padding: "14px 20px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 16,
                      fontSize: 15, color: "#fff",
                      fontFamily: "inherit",
                      transition: "border-color 0.2s ease",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || added}
                  className="shrink-0 w-full disabled:cursor-default"
                  style={{
                    height: 52, padding: "14px 28px",
                    fontSize: 15, fontWeight: 600,
                    background: added ? "#16a34a" : "#fff",
                    color: added ? "#fff" : "#05144D",
                    border: "none", borderRadius: 16,
                    cursor: loading || added ? "default" : "pointer",
                    fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "background 0.2s ease, transform 0.1s ease",
                  }}
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#05144D" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
                    </svg>
                  ) : added ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#fff" />
                      </svg>
                      Subscribed!
                    </>
                  ) : (
                    <>
                      Subscribe
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#05144D">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                      </svg>
                    </>
                  )}
                </button>
                {error && (
                  <p style={{ color: "#f87171", fontSize: 13, margin: 0, textAlign: "center" }}>{error}</p>
                )}
              </form>

              {/* Trust line */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.35)">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                </svg>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>No spam, unsubscribe anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
