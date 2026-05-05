"use client"

import { useState } from "react"
import type { Metadata } from "next"

const INPUT_CLS = "w-full h-[48px] px-4 text-[16px] text-[#0E1A33] placeholder:text-[#6B7790] rounded-[12px] border border-[#DDE2EC] bg-white outline-none transition-colors focus:border-[#4F8AF7]/40"

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.email || !form.message) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to send message")
      }
      setSuccess(true)
      setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" })
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="product-hero-bg relative flex flex-col justify-center items-center w-full py-20 px-5">
        <h1 className="text-[36px] md:text-[56px] font-bold tracking-[-0.03em] text-center" style={{ color: "#0E1A33" }}>
          Contact <span style={{ color: "#4F8AF7" }}>Us</span>
        </h1>
        <p className="mt-4 text-[18px] leading-[28px] text-center max-w-[480px]" style={{ color: "#44516B" }}>
          Have a question? We would love to hear from you. Send us a message and we will get back to you as soon as possible.
        </p>
      </section>

      <section className="max-w-[600px] mx-auto px-5 py-12 md:py-16">
        {success ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 className="text-[24px] font-bold text-[#0E1A33] mb-2">Message Sent!</h2>
            <p className="text-[16px] text-[#44516B]">Thank you for reaching out. We will get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-[#0E1A33]">First Name *</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className={INPUT_CLS} placeholder="John" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-[#0E1A33]">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={INPUT_CLS} placeholder="Doe" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-[#0E1A33]">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={INPUT_CLS} placeholder="john@example.com" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-[#0E1A33]">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={INPUT_CLS} placeholder="(555) 123-4567" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-[#0E1A33]">Message *</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} className="w-full px-4 py-3 text-[16px] text-[#0E1A33] placeholder:text-[#6B7790] rounded-[12px] border border-[#DDE2EC] bg-white outline-none resize-none transition-colors focus:border-[#4F8AF7]/40" placeholder="How can we help?" />
            </div>
            {error && <p className="text-red-600 text-[14px]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-[52px] rounded-full text-[16px] font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
