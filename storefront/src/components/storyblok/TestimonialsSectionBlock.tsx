"use client"

import { storyblokEditable } from "@storyblok/react"
import type { SbBlokData } from "@storyblok/react"
import { useState, useRef } from "react"

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
  { title: "Great service!", quote: "The purity levels are consistently above 99%. Best supplier I have found for my research needs.", author: "Dr. Sarah M." },
  { title: "Great service!", quote: "Same-day shipping and excellent packaging. My peptides always arrive in perfect condition.", author: "James K." },
  { title: "Great service!", quote: "Transparent COAs and responsive support. Peptidesfarma has earned our lab's trust for all peptide orders.", author: "Dr. Emily R." },
  { title: "Great service!", quote: "Switching to Peptidesfarma improved our research consistency. The quality difference is measurable.", author: "Michael T." },
  { title: "Great service!", quote: "Excellent selection of hard-to-find compounds. Customer service is knowledgeable and professional.", author: "Dr. Lisa C." },
  { title: "Great service!", quote: "Fast delivery and competitive pricing without compromising on purity. Highly recommended for serious research.", author: "Robert W." },
]

function Stars() {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#001C86">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
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

function TestimonialCard({ t, i }: { t: Testimonial; i: number }) {
  const isFirst = i === 0
  return (
    <div
      className="p-5 md:p-8"
      style={{
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start",
        gap: 20, flex: 1, minHeight: 260,
        background: isFirst
          ? "linear-gradient(180deg, rgba(0, 28, 134, 0) 0%, rgba(0, 28, 134, 0.08) 100%)"
          : "rgba(0, 36, 173, 0.04)",
        borderRadius: 24,
        ...(isFirst ? { filter: "drop-shadow(0px 0px 64px rgba(0, 36, 173, 0.16))" } : {}),
      }}
    >
      <Stars />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <h3 style={{ fontSize: 18, fontWeight: 500, lineHeight: "26px", color: "#05144D", margin: 0 }}>
          {t.title || "Great service!"}
        </h3>
        <p className="text-sm md:text-base" style={{ fontWeight: 400, lineHeight: "1.5", color: "#4A557E", margin: 0 }}>
          {t.quote}
        </p>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 99, background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{getInitials(t.author)}</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, lineHeight: "22px", color: "#05144D" }}>{t.author}</div>
      </div>
    </div>
  )
}

/* Google Material arrow icons */
function ArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  )
}

export default function TestimonialsSectionBlock({ blok }: { blok: TestimonialsSectionBlok }) {
  const heading = blok.heading || "Hear from our customers"
  const subtitle = blok.subtitle || "Read 100+ reviews left by our customers."
  const testimonials = blok.testimonials?.length ? blok.testimonials : defaultTestimonials
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.clientWidth * 0.75
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" })
    setTimeout(checkScroll, 350)
  }

  // Desktop rows
  const row1 = testimonials.slice(0, 3)
  const row2 = testimonials.slice(3, 6)

  return (
    <section
      {...storyblokEditable(blok)}
      className="px-5 md:px-14 py-16 md:py-24"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 48,
        background: "#FFFFFF",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, maxWidth: 650 }}>
        <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "20px", textTransform: "uppercase", color: "#4A557E", letterSpacing: "0.05em" }}>
          Testimonials
        </span>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 64px)", fontWeight: 400, lineHeight: "1.1", letterSpacing: "-0.02em", color: "#05144D", textAlign: "center", margin: 0, fontFamily: "var(--pf-display)" }}>
          {heading}
        </h2>
        <p className="text-base md:text-lg" style={{ fontWeight: 400, lineHeight: "28px", textAlign: "center", color: "#4A557E", margin: 0 }}>
          {subtitle}
        </p>
      </div>

      {/* Desktop grid - hidden on mobile */}
      <div className="hidden md:flex" style={{ flexDirection: "column", gap: 20, width: "100%", maxWidth: 1280 }}>
        <div style={{ display: "flex", gap: 20 }}>
          {row1.map((t, i) => <TestimonialCard key={(t as Testimonial)._uid || i} t={t as Testimonial} i={i} />)}
        </div>
        {row2.length > 0 && (
          <div style={{ display: "flex", gap: 20 }}>
            {row2.map((t, i) => <TestimonialCard key={(t as Testimonial)._uid || (i + 3)} t={t as Testimonial} i={i + 3} />)}
          </div>
        )}
      </div>

      {/* Mobile slider */}
      <div className="md:hidden w-full" style={{ position: "relative" }}>
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="pf-hide-scrollbar"
          style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}
        >
          {testimonials.map((t, i) => (
            <div key={(t as Testimonial)._uid || i} style={{ flexShrink: 0, width: "80%", scrollSnapAlign: "start" }}>
              <TestimonialCard t={t as Testimonial} i={i} />
            </div>
          ))}
        </div>

        {/* Arrow buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            style={{
              width: 40, height: 40, borderRadius: 999,
              border: "1px solid var(--pf-line)", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: canScrollLeft ? "pointer" : "default",
              color: canScrollLeft ? "var(--pf-ink)" : "var(--pf-text-3)",
              opacity: canScrollLeft ? 1 : 0.4,
              transition: "opacity 0.15s ease",
            }}
            aria-label="Previous review"
          >
            <ArrowLeft />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            style={{
              width: 40, height: 40, borderRadius: 999,
              border: "1px solid var(--pf-line)", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: canScrollRight ? "pointer" : "default",
              color: canScrollRight ? "var(--pf-ink)" : "var(--pf-text-3)",
              opacity: canScrollRight ? 1 : 0.4,
              transition: "opacity 0.15s ease",
            }}
            aria-label="Next review"
          >
            <ArrowRight />
          </button>
        </div>
      </div>

      {/* View all button */}
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
    </section>
  )
}
