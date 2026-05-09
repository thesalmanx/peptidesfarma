"use client"

import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"
import { useState } from "react"
import { usePathname } from "next/navigation"

interface ContactFormBlok extends SbBlokData {
  heading?: string
  highlight?: string
  subtitle?: string
  submit_text?: string
}

export default function ContactFormBlock({ blok }: { blok: ContactFormBlok }) {
  const heading = blok.heading || "Get in"
  const highlight = blok.highlight || "Touch"
  const subtitle = blok.subtitle || "Choose the best way to reach our team"
  const submitText = blok.submit_text || "Submit message"
  const pathname = usePathname()
  const dark = pathname === "/"

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Failed to send message")
      }
      setSubmitted(true)
      form.reset()
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputCls = dark
    ? "w-full outline-none placeholder-white/40 text-[14px] leading-[21px] md:text-[16px] md:leading-[24px] h-[45px] md:h-[48px] rounded-[12px] md:rounded-[16px]"
    : "w-full outline-none placeholder-[rgba(56,54,55,0.72)] text-[14px] leading-[21px] md:text-[16px] md:leading-[24px] h-[45px] md:h-[48px] rounded-[12px] md:rounded-[16px]"

  const inputStyle = dark
    ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", padding: "12px 16px", color: "#FFFFFF" }
    : { background: "rgba(20, 33, 61, 0.04)", border: "1px solid rgba(20, 33, 61, 0.08)", padding: "12px 16px", color: "#383637" }

  const labelCls = dark
    ? "text-[12px] leading-[18px] md:text-[14px] md:leading-[22px] font-semibold text-white"
    : "text-[12px] leading-[18px] md:text-[14px] md:leading-[22px] font-semibold text-[#383637]"

  return (
    <section className={`py-9 px-4 lg:px-20${dark ? "" : " bg-white"}`} {...storyblokEditable(blok)}>
      <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <h2 className={`text-3xl md:text-[48px] font-bold md:leading-[56px] tracking-[-0.03em] text-center ${dark ? "text-white" : "text-[#14213D]"}`}>
            {heading}{" "}
              <span
                style={{
                  background: dark
                    ? "linear-gradient(90deg, #7AA2FF 0%, #A8E6CF 100%)"
                    : "linear-gradient(90deg, #4F8AF7 0%, #7AA2FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {highlight}
              </span>
          </h2>
          <p
            style={{
              fontWeight: 400,
              fontSize: "18px",
              lineHeight: "28px",
              textAlign: "center",
              letterSpacing: "-0.01em",
              color: dark ? "rgba(255,255,255,0.7)" : "#44516B",
            }}
          >
            {subtitle}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`w-full flex flex-col items-start p-5 md:p-10${dark ? " transition-shadow duration-300 hover:shadow-[0_0_32px_rgba(255,255,255,0.08)]" : ""}`}
          style={{
            maxWidth: "720px",
            gap: "20px",
            borderRadius: "20px",
            ...(dark
              ? { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }
              : { background: "#F7F7F7", border: "1px solid #EFEFF1" }),
          }}
        >
          <div className="flex flex-col md:flex-row w-full" style={{ gap: "20px" }}>
            <div className="flex flex-col flex-1 gap-[2px] md:gap-1">
              <label className={labelCls}>First name</label>
              <input type="text" name="firstName" required placeholder="Enter first name" className={inputCls} style={inputStyle} />
            </div>
            <div className="flex flex-col flex-1 gap-[2px] md:gap-1">
              <label className={labelCls}>Last name</label>
              <input type="text" name="lastName" placeholder="Enter last name" className={inputCls} style={inputStyle} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row w-full" style={{ gap: "20px" }}>
            <div className="flex flex-col flex-1 gap-[2px] md:gap-1">
              <label className={labelCls}>Email address</label>
              <input type="email" name="email" required placeholder="Enter email address" className={inputCls} style={inputStyle} />
            </div>
            <div className="flex flex-col flex-1 gap-[2px] md:gap-1">
              <label className={labelCls}>Phone number</label>
              <input type="tel" name="phone" placeholder="Enter phone number" className={inputCls} style={inputStyle} />
            </div>
          </div>

          <div className="flex flex-col w-full gap-[2px] md:gap-1">
            <label className={labelCls}>Message</label>
            <textarea
              name="message"
              required
              placeholder="Type message"
              className={dark
                ? "w-full outline-none resize-none placeholder-white/40 text-[14px] leading-[21px] md:text-[16px] md:leading-[24px] rounded-[12px] md:rounded-[16px]"
                : "w-full outline-none resize-none placeholder-[rgba(56,54,55,0.72)] text-[14px] leading-[21px] md:text-[16px] md:leading-[24px] rounded-[12px] md:rounded-[16px]"}
              style={{
                height: "99px",
                padding: "12px 16px",
                ...(dark
                  ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#FFFFFF" }
                  : { background: "rgba(20, 33, 61, 0.04)", border: "1px solid rgba(20, 33, 61, 0.08)", color: "#383637" }),
              }}
            />
          </div>

          {error && (
            <p className="w-full text-center text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || submitted}
            className={`group w-auto self-center flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
              submitted
                ? "bg-[#4F8AF7] h-11 text-sm leading-5"
                : "btn-primary hover:opacity-90 h-11 md:h-12 text-[14px] leading-[20px] md:text-[16px] md:leading-[24px]"
            } disabled:cursor-default`}
            style={{
              padding: "12px 28px 12px 32px",
              borderRadius: "110px",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
            }}
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
              </svg>
            ) : submitted ? (
              <>
                <svg className="w-5 h-5 animate-check-pop" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Message sent!</span>
              </>
            ) : (
              <>
                {submitText}
                <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-5 h-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  )
}
