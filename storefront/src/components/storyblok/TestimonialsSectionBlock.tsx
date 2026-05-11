"use client"

import { storyblokEditable } from "@storyblok/react"
import type { SbBlokData } from "@storyblok/react"
import { useState } from "react"

interface Testimonial {
  _uid?: string
  component?: string
  quote: string
  author: string
  role?: string
  rating?: string
  title?: string
}

interface TestimonialsSectionBlok extends SbBlokData {
  heading?: string
  heading_highlight?: string
  subtitle?: string
  testimonials?: Testimonial[]
}

const defaultTestimonials = [
  { title: "Great service!", quote: "We have worked with multiple peptide suppliers, but PeptidesFarma stands out for consistency. Documentation is clear, and batch quality has been reliable for our ongoing research needs.", author: "John Doe", role: "CEO Company" },
  { title: "Great service!", quote: "We have worked with multiple peptide suppliers, but PeptidesFarma stands out for consistency. Documentation is clear, and batch quality has been reliable for our ongoing research needs.", author: "John Doe", role: "CEO Company" },
  { title: "Great service!", quote: "We have worked with multiple peptide suppliers, but PeptidesFarma stands out for consistency. Documentation is clear, and batch quality has been reliable for our ongoing research needs.", author: "John Doe", role: "CEO Company" },
  { title: "Great service!", quote: "Exceptional purity and fast shipping. The COAs are thorough and the customer support team is knowledgeable. Highly recommend for any research lab.", author: "Sarah Kim", role: "Research Director" },
  { title: "Great service!", quote: "Switched from our previous supplier after quality issues. Three orders in with PeptidesFarma and zero complaints. NAD+ and Epithalon have been particularly consistent.", author: "Lisa Wang", role: "Lab Manager" },
  { title: "Great service!", quote: "The attention to detail in packaging, the comprehensive COAs, and the research-grade quality make PeptidesFarma our go-to supplier for all peptide compounds.", author: "Robert Hayes", role: "Principal Investigator" },
]

function Stars() {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#001C86">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase()
}

const AVATAR_COLORS = [
  "linear-gradient(135deg, #001C86 0%, #4F8AF7 100%)",
  "linear-gradient(135deg, #0024AD 0%, #7AA2FF 100%)",
  "linear-gradient(135deg, #05144D 0%, #4F8AF7 100%)",
]

export default function TestimonialsSectionBlock({ blok }: { blok: TestimonialsSectionBlok }) {
  const heading = blok.heading || "Hear from our customers"
  const subtitle = blok.subtitle || "Read 100+ reviews left by our customers."
  const testimonials = blok.testimonials?.length ? blok.testimonials : defaultTestimonials
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? testimonials : testimonials.slice(0, 6)
  const row1 = visible.slice(0, 3)
  const row2 = visible.slice(3, 6)

  return (
    <section
      {...storyblokEditable(blok)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "96px 56px", gap: 48,
        background: "#FFFFFF",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, maxWidth: 650 }}>
        <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "20px", textTransform: "uppercase", color: "#4A557E", letterSpacing: "0.05em" }}>
          Testimonials
        </span>
        <h2 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 400, lineHeight: "72px", letterSpacing: "-0.02em", color: "#05144D", textAlign: "center", margin: 0, fontFamily: "var(--pf-display)" }}>
          {heading}
        </h2>
        <p style={{ fontSize: 18, fontWeight: 400, lineHeight: "28px", textAlign: "center", color: "#4A557E", margin: 0 }}>
          {subtitle}
        </p>
      </div>

      {/* Reviews grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 1280 }}>
        {/* Row 1 */}
        <div style={{ display: "flex", gap: 20 }} className="flex-col md:flex-row">
          {row1.map((t, i) => {
            const isFirst = i === 0
            return (
              <div
                key={(t as Testimonial)._uid || i}
                style={{
                  display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start",
                  padding: 32, gap: 24, flex: 1, minHeight: 308,
                  background: isFirst
                    ? "linear-gradient(180deg, rgba(0, 28, 134, 0) 0%, rgba(0, 28, 134, 0.08) 100%)"
                    : "rgba(0, 36, 173, 0.04)",
                  borderRadius: 24,
                  ...(isFirst ? { filter: "drop-shadow(0px 0px 64px rgba(0, 36, 173, 0.16))" } : {}),
                }}
              >
                <Stars />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 500, lineHeight: "30px", color: "#05144D", margin: 0 }}>
                    {(t as Testimonial).title || "Great service!"}
                  </h3>
                  <p style={{ fontSize: 16, fontWeight: 400, lineHeight: "24px", color: "#4A557E", margin: 0 }}>
                    {t.quote}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 70, background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{getInitials(t.author)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", color: "#05144D" }}>{t.author}</div>
                    {t.role && <div style={{ fontSize: 14, fontWeight: 400, lineHeight: "20px", color: "#4A557E" }}>{t.role}</div>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Row 2 */}
        {row2.length > 0 && (
          <div style={{ display: "flex", gap: 20 }} className="flex-col md:flex-row">
            {row2.map((t, i) => (
              <div
                key={(t as Testimonial)._uid || i + 3}
                style={{
                  display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start",
                  padding: 32, gap: 24, flex: 1, minHeight: 308,
                  background: "rgba(0, 36, 173, 0.04)",
                  borderRadius: 24,
                }}
              >
                <Stars />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 500, lineHeight: "30px", color: "#05144D", margin: 0 }}>
                    {(t as Testimonial).title || "Great service!"}
                  </h3>
                  <p style={{ fontSize: 16, fontWeight: 400, lineHeight: "24px", color: "#4A557E", margin: 0 }}>
                    {t.quote}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 70, background: AVATAR_COLORS[(i + 3) % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{getInitials(t.author)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", color: "#05144D" }}>{t.author}</div>
                    {t.role && <div style={{ fontSize: 14, fontWeight: 400, lineHeight: "20px", color: "#4A557E" }}>{t.role}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View all button */}
      {testimonials.length > 6 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            padding: "12px 20px", gap: 10,
            border: "1px solid #4A557E", borderRadius: 99,
            background: "transparent", cursor: "pointer",
            fontSize: 16, fontWeight: 400, lineHeight: "24px",
            color: "#4A557E", fontFamily: "inherit",
          }}
        >
          View all testimonials
        </button>
      )}
      {testimonials.length <= 6 && (
        <button
          style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            padding: "12px 20px", gap: 10,
            border: "1px solid #4A557E", borderRadius: 99,
            background: "transparent", cursor: "pointer",
            fontSize: 16, fontWeight: 400, lineHeight: "24px",
            color: "#4A557E", fontFamily: "inherit",
          }}
        >
          View all testimonials
        </button>
      )}
    </section>
  )
}
