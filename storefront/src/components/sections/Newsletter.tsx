"use client"

import { useState } from "react"
import Image from "next/image"

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
      <div className="relative w-full max-w-[1280px] mx-auto">
        <Image
          src="/vials/glp-newsletter.png"
          alt=""
          width={126}
          height={180}
          className="absolute pointer-events-none z-10 w-[70px] md:w-[106px] -left-5 md:-left-[59px] -top-[30px] md:-top-[61px]"
          style={{
            height: "auto",
            transform: "rotate(8deg)",
            opacity: 0.9,
          }}
        />
        <Image
          src="/vials/nad-newsletter.png"
          alt=""
          width={126}
          height={180}
          className="absolute pointer-events-none z-10 w-[70px] md:w-[106px] -right-5 md:-right-[69px] -bottom-[30px] md:-bottom-[55px]"
          style={{
            height: "auto",
            transform: "rotate(12deg)",
            opacity: 0.9,
          }}
        />

        <div
          className="newsletter-card relative flex flex-col items-center md:items-start md:flex-row md:justify-between w-full gap-8 md:gap-6 rounded-[20px] md:rounded-[24px] transition-shadow duration-300 hover:shadow-[0_0_48px_rgba(43,132,143,0.24)]"
          style={{
            padding: "48px 40px",
            background: "linear-gradient(180deg, #E2E1F9 11.14%, #FAE5F9 100%)",
            border: "2px solid #FFFFFF",
          }}
        >
          <div className="flex flex-col items-center md:items-start gap-6 md:gap-4">
            <h2
              className="text-[40px] leading-[48px] md:text-[48px] md:leading-[56px] text-center md:text-left"
              style={{
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "#242424",
              }}
            >
              Subscribe to our{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #4F8AF7 0%, #36848E 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Newsletter
              </span>
            </h2>
            <p
              className="text-[16px] leading-[24px] md:text-[20px] md:leading-[22px] text-center md:text-left"
              style={{ fontWeight: 400, color: "#242424" }}
            >
              Subscribe to our newsletter to get daily insights, news, updates.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row items-start w-full md:w-auto shrink-0 gap-3"
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              disabled={loading || added}
              autoComplete="email"
              className="outline-none w-full md:w-[360px] text-center md:text-left disabled:opacity-60"
              style={{
                height: "48px",
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid #242424",
                borderRadius: "16px",
                fontSize: "16px",
                lineHeight: "24px",
                color: "#383637",
              }}
            />
            <button
              type="submit"
              disabled={loading || added}
              className={`group shrink-0 w-full md:w-auto flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                added
                  ? "bg-[#4F8AF7]"
                  : "btn-primary hover:opacity-90"
              } disabled:cursor-default`}
              style={{
                height: "48px",
                padding: "12px 28px 12px 32px",
                borderRadius: "110px",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "25px",
                letterSpacing: "-0.01em",
                color: "#FFFFFF",
              }}
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="50 20"
                  />
                </svg>
              ) : added ? (
                <>
                  <svg className="w-5 h-5 animate-check-pop" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Subscribed!</span>
                </>
              ) : (
                <>
                  Subscribe
                  <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-5 h-5 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </>
              )}
            </button>
            {error && (
              <p className="text-red-600 text-sm w-full text-center md:text-left">{error}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
