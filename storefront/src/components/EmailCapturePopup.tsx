"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

const DISMISS_KEY = "pf_email_popup_dismissed"
const SHOW_DELAY = 8000 // 8 seconds after page load

export default function EmailCapturePopup() {
  const [show, setShow] = useState(false)
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) return

    const timer = setTimeout(() => {
      setShow(true)
      requestAnimationFrame(() => setVisible(true))
    }, SHOW_DELAY)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (show && visible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [show, visible])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => setShow(false), 350)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || loading || success) return
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
      setSuccess(true)
      setEmail("")
      localStorage.setItem(DISMISS_KEY, Date.now().toString())
      setTimeout(handleClose, 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] transition-opacity duration-300"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
        }}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className="fixed z-[201] left-1/2 top-1/2 w-[calc(100%-32px)] max-w-[540px] transition-all duration-[400ms]"
        style={{
          transform: visible
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -44%) scale(0.95)",
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          className="relative overflow-hidden rounded-[24px]"
          style={{
            background: "linear-gradient(165deg, #E8E3F0 0%, #EDE8F5 35%, #F3F0F8 65%, #E2E1F9 100%)",
            boxShadow: "0 32px 80px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.6) inset",
          }}
        >
          {/* Floating vials */}
          <Image
            src="/icons/nad+.png"
            alt=""
            width={90}
            height={80}
            className="absolute pointer-events-none"
            style={{
              top: "12px",
              left: "-8px",
              width: "65px",
              height: "auto",
              transform: "rotate(-15deg)",
              opacity: 0.6,
              animation: visible ? "popupVialFloat1 3s ease-in-out infinite" : "none",
            }}
          />
          <Image
            src="/icons/ghk-cu.png"
            alt=""
            width={80}
            height={70}
            className="absolute pointer-events-none"
            style={{
              bottom: "20px",
              left: "8px",
              width: "45px",
              height: "auto",
              transform: "rotate(12deg)",
              opacity: 0.45,
              animation: visible ? "popupVialFloat2 3.5s ease-in-out infinite 0.5s" : "none",
            }}
          />
          <Image
            src="/icons/glp-3.png"
            alt=""
            width={70}
            height={60}
            className="absolute pointer-events-none"
            style={{
              bottom: "60px",
              right: "8px",
              width: "45px",
              height: "auto",
              transform: "rotate(-8deg)",
              opacity: 0.5,
              animation: visible ? "popupVialFloat1 4s ease-in-out infinite 1s" : "none",
            }}
          />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            aria-label="Close popup"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3l8 8" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Content */}
          <div className="relative z-[1] flex flex-col items-center px-8 pt-12 pb-10 md:px-10">
            {/* Badge */}
            <span
              className="inline-flex items-center gap-2 mb-5"
              style={{
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                padding: "6px 16px",
                borderRadius: "100px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2.667 4L8 8.667 13.333 4" stroke="#4F8AF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="1.333" y="2.667" width="13.333" height="10.667" rx="2" stroke="#4F8AF7" strokeWidth="1.5"/>
              </svg>
              Exclusive research updates
            </span>

            {/* Title */}
            <h2
              className="text-center mb-3"
              style={{
                fontSize: "clamp(26px, 5vw, 36px)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#141414",
              }}
            >
              Stay ahead in{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #4F8AF7 0%, #36848E 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                research
              </span>
            </h2>

            {/* Subtitle */}
            <p
              className="text-center mb-7"
              style={{
                fontSize: "15px",
                lineHeight: 1.55,
                color: "#555",
                maxWidth: "340px",
              }}
            >
              Subscribe for early access to new compounds, research insights, and exclusive updates delivered to your inbox.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-[340px]">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading || success}
                autoComplete="email"
                className="no-focus-ring outline-none w-full disabled:opacity-60 transition-all"
                style={{
                  height: "48px",
                  padding: "12px 18px",
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "1.5px solid rgba(17, 92, 111, 0.2)",
                  borderRadius: "14px",
                  fontSize: "15px",
                  color: "#242424",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              />

              <button
                type="submit"
                disabled={loading || success}
                className={`group w-full flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:cursor-default ${
                  success ? "bg-[#4F8AF7]" : "btn-primary hover:opacity-90"
                }`}
                style={{
                  height: "48px",
                  borderRadius: "110px",
                  fontWeight: 600,
                  fontSize: "15px",
                  letterSpacing: "-0.01em",
                  color: "#FFFFFF",
                }}
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
                  </svg>
                ) : success ? (
                  <>
                    <svg className="w-5 h-5 animate-check-pop" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>You&apos;re in!</span>
                  </>
                ) : (
                  <>
                    Subscribe
                    <span className="inline-flex overflow-hidden w-0 group-hover:w-6 group-hover:pl-1 transition-all duration-200 ease-out">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-4 h-4 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </>
                )}
              </button>

              {error && (
                <p className="text-red-600 text-xs text-center">{error}</p>
              )}
            </form>

            {/* Trust line */}
            <p
              className="mt-5 text-center"
              style={{
                fontSize: "12px",
                color: "#999",
                lineHeight: 1.4,
              }}
            >
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popupVialFloat1 {
          0%, 100% { transform: translateY(0) rotate(-15deg); }
          50% { transform: translateY(-8px) rotate(-15deg); }
        }
        @keyframes popupVialFloat2 {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-10px) rotate(12deg); }
        }
      `}</style>
    </>
  )
}
