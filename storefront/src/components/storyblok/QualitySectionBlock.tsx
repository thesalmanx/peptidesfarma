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
    <section {...storyblokEditable(blok)} className="px-5 md:px-14 py-16 md:py-24 bg-white">
      <div className="max-w-[1280px] mx-auto">
        {/* Top: centered heading */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 48, textAlign: "center" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px",
            background: "rgba(0,28,134,0.06)",
            borderRadius: 99,
            fontSize: 12, fontWeight: 500, color: "#001C86",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#001C86"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>
            Verified Quality
          </span>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#05144D", margin: 0, fontFamily: "var(--pf-display)", lineHeight: 1.1 }}>
            {headingText}{" "}
            <span style={{ background: "linear-gradient(90deg, #001C86 0%, #4F8AF7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {headingHighlight}
            </span>
          </h2>
          <p style={{ fontSize: 17, lineHeight: "28px", color: "#4A557E", margin: 0, maxWidth: 560 }}>
            {description}
          </p>
        </div>

        {/* Stats bar - flex row, evenly distributed */}
        {stats.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6" style={{ marginBottom: 40 }}>
            {stats.map((stat, i) => (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "24px 32px",
                background: i === 0 ? "linear-gradient(180deg, rgba(0,28,134,0) 0%, rgba(0,28,134,0.08) 100%)" : "rgba(0,36,173,0.04)",
                borderRadius: 20,
                flex: "1 1 0%", minWidth: 140, maxWidth: 280,
                ...(i === 0 ? { filter: "drop-shadow(0px 0px 48px rgba(0,36,173,0.12))" } : {}),
              }}>
                <span style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#05144D" }}>
                  {stat.value}
                </span>
                <span style={{ fontSize: 13, color: "#4A557E", textAlign: "center" }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Two-column: image + info */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
          {/* Image */}
          <div className="flex-1 rounded-[24px] overflow-hidden relative flex items-center justify-center" style={{ background: "linear-gradient(180deg, rgba(0,28,134,0.04) 0%, rgba(79,138,247,0.10) 100%)", minHeight: 300 }}>
            <Image
              src={productImage || "/vials/nad.png"}
              alt="Research-grade peptide"
              width={280}
              height={400}
              className="object-contain"
              style={{ maxHeight: "90%", width: "auto", animation: "pf-float-y 7s ease-in-out infinite" }}
            />
          </div>

          {/* Info panel */}
          <div className="flex-1 flex flex-col gap-5 justify-center">
            {/* HPLC badge + description */}
            <div style={{ padding: 24, background: "#05144D", borderRadius: 20, color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#4F8AF7"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>
                <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.02em" }}>{badge2}</span>
              </div>
              <p style={{ fontSize: 15, lineHeight: "24px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                {infoDescription}
              </p>
            </div>

            {/* Callout */}
            <div style={{ padding: "20px 24px", background: "var(--pf-paper)", borderRadius: 20, border: "1px solid var(--pf-line)" }}>
              <p style={{ fontSize: 15, lineHeight: "24px", color: "#05144D", margin: 0 }}>
                {calloutText.includes(":") ? (
                  <>
                    <span style={{ fontWeight: 700, color: "#001C86" }}>{calloutText.split(":")[0]}:</span>
                    {calloutText.slice(calloutText.indexOf(":") + 1)}
                  </>
                ) : calloutText}
              </p>
            </div>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Link
                href={ctaLink}
                className="pf-btn pf-btn--primary"
                style={{ height: 48, padding: "0 28px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                {ctaText}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#001C86"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>
                <span style={{ fontSize: 14, color: "#4A557E" }}>{ctaNote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
