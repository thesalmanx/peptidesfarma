"use client"

import { storyblokEditable } from "@storyblok/react/rsc"
import { useState } from "react"

interface NewsletterBlok {
  title?: string
  subtitle?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function NewsletterBlock({ blok }: { blok: NewsletterBlok }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

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
      setSuccess(true)
      setEmail("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      {...storyblokEditable(blok)}
      className="py-16 md:py-20"
      style={{
        background: "linear-gradient(135deg, #08122A 0%, #0F1D3D 50%, #162850 100%)",
      }}
    >
      <div className="max-w-[600px] mx-auto px-5 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.02em] mb-3">
          {blok.title || "Stay Updated"}
        </h2>
        <p className="text-[15px] leading-[22px] text-white/60 mb-8">
          {blok.subtitle || "Subscribe for new product releases, research updates, and exclusive offers."}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-[440px] mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={loading || success}
            className="no-focus-ring outline-none w-full sm:flex-1 h-12 px-5 rounded-full bg-white/10 border border-white/20 text-white text-[15px] placeholder:text-white/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || success}
            className="shrink-0 h-12 px-8 rounded-full bg-[#4F8AF7] text-white font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "..." : success ? "Subscribed!" : "Subscribe"}
          </button>
        </form>
        {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
      </div>
    </section>
  )
}
