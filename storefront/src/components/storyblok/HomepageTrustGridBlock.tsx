"use client"

import { storyblokEditable } from "@storyblok/react"
import type { SbBlokData } from "@storyblok/react"
import Image from "next/image"

interface TrustCard {
  _uid?: string
  component?: string
  icon: string
  title: string
  description: string
}

interface HomepageTrustGridBlok extends SbBlokData {
  cards?: TrustCard[]
}

const defaultCards = [
  { title: "Fast Shipping", description: "Orders processed and shipped within 24 hours with full tracking.", icon: "shipping" },
  { title: "100% Safe Payments", description: "All transactions are secured with industry-standard encryption.", icon: "payment" },
  { title: "Pharmaceutical-Grade Quality", description: "Every product meets strict pharmaceutical manufacturing standards.", icon: "pharma" },
  { title: "Third-Party Lab Tested", description: "Independent labs verify purity and potency for every batch.", icon: "testing" },
  { title: "Published COAs", description: "Full Certificates of Analysis available for every product.", icon: "coa" },
  { title: "Made in the USA", description: "All peptides are synthesized and quality-checked in U.S. facilities.", icon: "usa" },
]

const iconMap: Record<string, string> = {
  shipping: "/icons/precision-synthesis.svg",
  payment: "/icons/precision-compliance.svg",
  pharma: "/icons/precision-lab.svg",
  testing: "/icons/precision-coa.svg",
  coa: "/icons/precision-storage.svg",
  usa: "/icons/precision-support.svg",
  truck: "/icons/precision-synthesis.svg",
  shield: "/icons/precision-compliance.svg",
  flask: "/icons/precision-lab.svg",
  microscope: "/icons/precision-coa.svg",
  certificate: "/icons/precision-storage.svg",
  flag: "/icons/precision-support.svg",
}

export default function HomepageTrustGridBlock({ blok }: { blok: HomepageTrustGridBlok }) {
  const cards = blok.cards?.length ? blok.cards : defaultCards
  const row1 = cards.slice(0, 3)
  const row2 = cards.slice(3, 6)

  return (
    <section
      {...storyblokEditable(blok)}
      className="px-5 md:px-14 py-16 md:py-24"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 48,
        background: "#FFFFFF",
        borderRadius: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, maxWidth: 508 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 16px",
          background: "rgba(255,255,255,0.65)",
          border: "1px solid rgba(79,138,247,0.12)",
          borderRadius: 999,
          fontSize: 13, fontWeight: 500, color: "var(--pf-ink)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#001C86">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          Our Promise
        </span>
        <h2 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 400, lineHeight: "72px", letterSpacing: "-0.02em", color: "#05144D", textAlign: "center", margin: 0, fontFamily: "var(--pf-display)" }}>
          Why Researchers Trust Us
        </h2>
        <p style={{ fontSize: 18, fontWeight: 400, lineHeight: "28px", textAlign: "center", color: "#4A557E", margin: 0 }}>
          Everything we do is designed around quality, transparency, and reliability.
        </p>
      </div>

      {/* Cards grid - 2 cols mobile, 3 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 w-full" style={{ maxWidth: 1280 }}>
        {cards.map((card, i) => {
          const iconName = card.icon || defaultCards[i]?.icon || "shipping"
          const iconSrc = iconMap[iconName] || "/icons/precision-synthesis.svg"
          const isFirst = i === 0

          return (
            <div
              key={i}
              className="p-5 md:p-8"
              style={{
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start",
                gap: 20, minHeight: 200,
                background: isFirst
                  ? "linear-gradient(180deg, rgba(0, 28, 134, 0) 0%, rgba(0, 28, 134, 0.08) 100%)"
                  : "rgba(0, 36, 173, 0.04)",
                borderRadius: 24,
                ...(isFirst ? { filter: "drop-shadow(0px 0px 64px rgba(0, 36, 173, 0.16))" } : {}),
              }}
            >
              <div className="w-12 h-12 md:w-16 md:h-16" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isFirst ? "#001C86" : "rgba(0, 28, 134, 0.08)",
                borderRadius: 99,
              }}>
                <Image src={iconSrc} alt="" width={32} height={32} className="w-6 h-6 md:w-8 md:h-8" style={{ filter: isFirst ? "brightness(0) invert(1)" : "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 className="text-base md:text-xl" style={{ fontWeight: 500, lineHeight: "1.4", color: "#05144D", margin: 0 }}>{card.title}</h3>
                <p className="text-sm md:text-base" style={{ fontWeight: 400, lineHeight: "1.5", color: "#4A557E", margin: 0 }}>{card.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
