import { storyblokEditable } from "@storyblok/react/rsc"
import type { SbBlokData } from "@storyblok/react/rsc"
import Image from "next/image"
import Link from "next/link"

interface QualityStat {
  _uid?: string
  component?: string
  value: string
  label: string
}

interface QualitySectionBlok extends SbBlokData {
  heading?: string
  heading_highlight?: string
  description?: string
  stats?: QualityStat[]
  badge_1?: string
  badge_2?: string
  info_description?: string
  callout_text?: string
  cta_text?: string
  cta_link?: string
  cta_note?: string
  image?: { filename: string; alt?: string }
}

export default function QualitySectionBlock({ blok }: { blok: QualitySectionBlok }) {
  const headingText = blok.heading || "Quality You Can"
  const headingHighlight = blok.heading_highlight || "Verify"
  const description =
    blok.description ||
    "Every batch is independently tested by accredited U.S. laboratories. We don\u2019t ask you to take our word for it\u2014we give you the proof."
  const stats = blok.stats || []
  const badge1 = blok.badge_1 || "Verified Potency"
  const badge2 = blok.badge_2 || "HPLC Analysis"
  const infoDescription =
    blok.info_description ||
    "Every vial is tested to confirm it contains exactly what the label says\u2014down to the microgram."
  const calloutText =
    blok.callout_text ||
    "Why it matters: No guessing games. You get the exact concentration you paid for, every single time."
  const ctaText = blok.cta_text || "Shop Now"
  const ctaLink = blok.cta_link || "/products"
  const ctaNote = blok.cta_note || "Free COA included with every order"
  const productImage = blok.image?.filename

  return (
    <section {...storyblokEditable(blok)} className="py-5 lg:py-8 px-5 lg:px-20 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Image panel */}
          <div className="flex-1 min-h-[400px] lg:min-h-[700px] rounded-[24px] overflow-hidden relative lg:order-2" style={{ background: "linear-gradient(180deg, rgba(0,28,134,0.06) 0%, rgba(79,138,247,0.12) 100%)" }}>
            {productImage ? (
              <Image src={productImage} alt="Research-grade peptide product" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 620px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="relative mx-auto w-28 h-44">
                    <div className="absolute inset-x-6 top-0 h-8 bg-gray-300/60 rounded-t-lg" />
                    <div className="absolute inset-0 top-8 bg-gradient-to-b from-white/80 to-blue-100/60 rounded-b-xl border border-gray-200/50 shadow-sm" />
                    <div className="absolute inset-x-4 top-16 bottom-4 flex flex-col items-center justify-center gap-1">
                      <span className="text-[11px] font-bold text-gray-600 tracking-wide">BPC-157</span>
                      <span className="text-[9px] text-gray-400">5 mg</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">Product image</p>
                </div>
              </div>
            )}
          </div>

          {/* Content panel */}
          <div className="flex flex-col gap-6 lg:gap-8 flex-1 lg:order-1">
            {/* Heading */}
            <div className="flex flex-col gap-3 lg:gap-4 max-w-[549px]">
              <h2 className="text-[36px] lg:text-[48px] leading-[44px] lg:leading-[56px] tracking-[-0.03em]" style={{ fontWeight: 700, color: "#05144D", fontFamily: "var(--pf-display)", margin: 0 }}>
                {headingText}{" "}
                <span style={{
                  background: "linear-gradient(90deg, #001C86 0%, #4F8AF7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {headingHighlight}
                </span>
              </h2>
              <p style={{ fontSize: 16, lineHeight: "26px", color: "#4A557E", margin: 0 }}>
                {description}
              </p>
            </div>

            {/* Stats row */}
            {stats.length > 0 && (
              <div className="flex gap-6 lg:gap-10 flex-wrap">
                {stats.map((stat, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#05144D" }}>
                      {stat.value}
                    </span>
                    <span style={{ fontSize: 13, color: "#4A557E" }}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Info card */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 16,
              padding: "24px",
              background: "var(--pf-paper)",
              borderRadius: 20,
              border: "1px solid var(--pf-line)",
            }}>
              {/* Badges */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#05144D" }}>
                  {badge1}
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", height: 32,
                  background: "#05144D", borderRadius: 99,
                  fontSize: 12, fontWeight: 500, color: "#fff",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>
                  {badge2}
                </span>
              </div>

              <p style={{ fontSize: 15, lineHeight: "24px", color: "#4A557E", margin: 0 }}>
                {infoDescription}
              </p>

              {/* Callout */}
              <div style={{
                padding: "16px 20px",
                background: "rgba(0,28,134,0.04)",
                borderRadius: 14,
                borderLeft: "3px solid #001C86",
              }}>
                <p style={{ fontSize: 14, lineHeight: "22px", color: "#05144D", margin: 0 }}>
                  {calloutText.includes(":") ? (
                    <>
                      <span style={{ fontWeight: 700 }}>{calloutText.split(":")[0]}:</span>
                      {calloutText.slice(calloutText.indexOf(":") + 1)}
                    </>
                  ) : calloutText}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Link
                href={ctaLink}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: 48, padding: "0 28px",
                  background: "#fff", color: "#05144D",
                  border: "1px solid var(--pf-line)",
                  borderRadius: 99,
                  fontSize: 15, fontWeight: 600, textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
                className="hover:bg-[#f0f2f8]"
              >
                {ctaText}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#05144D" style={{ marginLeft: 6 }}><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#001C86"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>
                <span style={{ fontSize: 14, color: "#4A557E" }}>{ctaNote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
