"use client"

import { storyblokEditable } from "@storyblok/react/rsc"
import type { SbBlokData } from "@storyblok/react/rsc"
import Link from "next/link"
import Image from "next/image"
import HeroParticles from "@/components/HeroParticles"

interface TrustItem extends SbBlokData {
  label?: string
  value?: string
  icon?: string
}

interface HomepageHeroBlok extends SbBlokData {
  rating_text?: string
  heading?: string
  heading_highlight?: string
  subtitle?: string
  cta_text?: string
  cta_link?: string
  secondary_cta_text?: string
  secondary_cta_link?: string
  trust_items?: TrustItem[]
}

const trustIcons: Record<string, string> = {
  checkmark: "/icons/checkmark-badge.svg",
  lab: "/icons/license-third-party.svg",
  laurel: "/icons/laurel-wreath.svg",
  purity: "/icons/checkmark-badge.svg",
  tested: "/icons/license-third-party.svg",
  manufacturing: "/icons/laurel-wreath.svg",
}

export default function HomepageHeroBlock({ blok }: { blok: HomepageHeroBlok }) {
  const heading = blok.heading || "Research-Grade Peptides."
  const headingHighlight = blok.heading_highlight || "Elevated."
  const subtitle = blok.subtitle || "High-purity peptide compounds manufactured for advanced research and innovation."
  const ctaText = blok.cta_text || "Shop products"
  const ctaLink = blok.cta_link || "/products"
  const secondaryCtaText = blok.secondary_cta_text || "See how it works"
  const secondaryCtaLink = blok.secondary_cta_link || "/about"
  const ratingText = blok.rating_text || "Third-party HPLC \u00B7 99.2% avg purity"

  const trustItems = blok.trust_items?.length
    ? blok.trust_items.map((t) => ({
        label: t.label || t.value || "",
        icon: trustIcons[t.icon || "checkmark"] || "/icons/checkmark-badge.svg",
      }))
    : [
        { label: "99%+ verified purity", icon: "/icons/checkmark-badge.svg" },
        { label: "Lab-Tested & Documented", icon: "/icons/license-third-party.svg" },
        { label: "Controlled Manufacturing", icon: "/icons/laurel-wreath.svg" },
      ]

  return (
    <section
      {...storyblokEditable(blok)}
      style={{
        position: "relative",
        overflow: "hidden",
        marginTop: -1,
        background: "linear-gradient(180deg, #f7f8fa 0%, #c8d5e5 100%)",
        color: "var(--pf-ink)",
      }}
    >

      {/* Centered content with vials inside container */}
      <div className="pf-wrap" style={{ position: "relative", minHeight: 680, paddingBlock: "80px 96px" }}>
        {/* Floating vials */}
        <img src="/icons/glp-3.png" alt="" className="absolute pointer-events-none hidden md:block" style={{ width: 200, left: 0, top: 80, objectFit: "contain", animation: "pf-float-y 7s ease-in-out infinite", zIndex: 1 }} />
        <img src="/icons/nad+.png" alt="" className="absolute pointer-events-none hidden md:block" style={{ width: 170, right: 0, top: 60, objectFit: "contain", animation: "pf-float-y 8s ease-in-out 1s infinite", zIndex: 1 }} />
        <img src="/icons/ghk-cu.png" alt="" className="absolute pointer-events-none hidden md:block" style={{ width: 150, left: 60, bottom: 60, objectFit: "contain", animation: "pf-float-y 6s ease-in-out 0.5s infinite", zIndex: 1 }} />
        <img src="/icons/glp-3.png" alt="" className="absolute pointer-events-none hidden md:block" style={{ width: 140, right: 60, bottom: 80, objectFit: "contain", animation: "pf-float-y 9s ease-in-out 2s infinite", zIndex: 1, transform: "scaleX(-1)" }} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center", minHeight: 520 }}>
          {/* Badge */}
          <div className="hero-stagger-1" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 8px", background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 999, marginBottom: 28 }}>
            <Image src="/icons/reviews.svg" alt="" width={18} height={18} />
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pf-text-2)", letterSpacing: "0.01em" }}>{ratingText}</span>
          </div>

          {/* Heading from Storyblok */}
          <h1 className="hero-stagger-2" style={{ fontFamily: "var(--pf-display)", fontWeight: 700, fontSize: "clamp(40px, 5.2vw, 72px)", lineHeight: 1.05, letterSpacing: "-0.032em", margin: "0 0 20px", color: "var(--pf-ink)", maxWidth: 740 }}>
            {heading}{" "}
            <span style={{ fontFamily: "var(--pf-serif)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.015em", background: "linear-gradient(135deg, #4F8AF7 0%, #7AA2FF 60%, #4F8AF7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {headingHighlight}
            </span>
          </h1>

          {/* Subtitle from Storyblok */}
          <p className="hero-stagger-3" style={{ fontSize: 17, lineHeight: 1.6, color: "var(--pf-text-2)", maxWidth: 520, margin: "0 0 32px" }}>
            {subtitle}
          </p>

          {/* CTA buttons from Storyblok */}
          <div className="hero-stagger-4" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
            <Link href={ctaLink} className="pf-btn pf-btn--primary pf-btn--lg" style={{ padding: "0 28px" }}>
              {ctaText}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </Link>
            <Link href={secondaryCtaLink} className="pf-btn pf-btn--ghost pf-btn--lg">{secondaryCtaText} &rarr;</Link>
          </div>

          {/* Trust pills from Storyblok */}
          <div className="pf-hero-stats hero-stagger-5" style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {trustItems.map((t) => (
              <div key={t.label} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(255,255,255,0.65)", borderRadius: 999, border: "1px solid rgba(79,138,247,0.12)" }}>
                <Image src={t.icon} alt="" width={20} height={20} />
                <span style={{ fontSize: 13, color: "var(--pf-ink)", fontWeight: 500 }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
