"use client"

import { storyblokEditable } from "@storyblok/react/rsc"
import { useState } from "react"

interface ContactFormBlok {
  title?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function ContactFormBlock({ blok }: { blok: ContactFormBlok }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || success) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Failed to send message")
      }
      setSuccess(true)
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "no-focus-ring outline-none w-full h-12 px-4 rounded-[12px] bg-white border border-[#E5E7EB] text-[15px] text-[#141414] placeholder:text-[#9CA3AF] disabled:opacity-50"

  return (
    <section
      {...storyblokEditable(blok)}
      className="py-12 md:py-16 max-w-[640px] mx-auto px-5 md:px-6 lg:px-20"
    >
      {blok.title && (
        <h2 className="text-2xl font-bold text-[#141414] mb-8 text-center">{blok.title}</h2>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Your name"
          required
          disabled={loading || success}
          className={inputClass}
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="Your email"
          required
          disabled={loading || success}
          className={inputClass}
        />
        <input
          type="text"
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          placeholder="Subject"
          disabled={loading || success}
          className={inputClass}
        />
        <textarea
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          placeholder="Your message"
          required
          disabled={loading || success}
          rows={5}
          className="no-focus-ring outline-none w-full px-4 py-3 rounded-[12px] bg-white border border-[#E5E7EB] text-[15px] text-[#141414] placeholder:text-[#9CA3AF] disabled:opacity-50 resize-none"
        />
        <button
          type="submit"
          disabled={loading || success}
          className="h-12 rounded-full bg-[#4F8AF7] text-white font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Sending..." : success ? "Message Sent!" : "Send Message"}
        </button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </section>
  )
}
