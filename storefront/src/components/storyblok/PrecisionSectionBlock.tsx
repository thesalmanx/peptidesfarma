import { storyblokEditable } from "@storyblok/react/rsc"
import type { SbBlokData } from "@storyblok/react/rsc"
import Image from "next/image"

interface PrecisionFeature {
  _uid?: string
  component?: string
  icon: string
  title: string
  description: string
}

interface PrecisionSectionBlok extends SbBlokData {
  heading?: string
  heading_highlight?: string
  subtitle?: string
  features?: PrecisionFeature[]
  cta_text?: string
  cta_link?: string
}

const defaultFeatures = [
  { icon: "synthesis", title: "High-Purity Synthesis", description: "Each compound is synthesized for molecular accuracy and consistent research results." },
  { icon: "lab", title: "Third-Party Lab Tested", description: "Products undergo external laboratory testing to verify purity and batch consistency." },
  { icon: "coa", title: "Transparent COA Access", description: "Certificates of Analysis provide clear insight into testing results and specifications." },
  { icon: "storage", title: "Controlled Storage", description: "Compounds are stored under controlled conditions to preserve stability and integrity." },
  { icon: "compliance", title: "Research Compliance", description: "All products are clearly labeled and supplied exclusively for research use." },
  { icon: "support", title: "Dedicated Support", description: "Our research specialists are available to assist with any questions you may have." },
]

const iconMap: Record<string, string> = {
  synthesis: "/icons/precision-synthesis.svg",
  lab: "/icons/precision-lab.svg",
  coa: "/icons/precision-coa.svg",
  storage: "/icons/precision-storage.svg",
  compliance: "/icons/precision-compliance.svg",
  support: "/icons/precision-support.svg",
}

export default function PrecisionSectionBlock({ blok }: { blok: PrecisionSectionBlok }) {
  const heading = blok.heading || "Built for Precision"
  const subtitle = blok.subtitle || "Every product we deliver meets the highest standards of pharmaceutical-grade quality and transparency."
  const features = blok.features?.length ? blok.features : defaultFeatures

  const row1 = features.slice(0, 3)
  const row2 = features.slice(3, 6)

  return (
    <section
      {...storyblokEditable(blok)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "96px 56px",
        gap: 48,
        background: "#FFFFFF",
        borderRadius: 0,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, maxWidth: 508 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 14px",
          background: "rgba(0, 28, 134, 0.08)",
          borderRadius: 99,
          fontSize: 14, fontWeight: 500, lineHeight: "20px",
          textTransform: "uppercase", color: "#001C86",
          letterSpacing: "0.05em",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#001C86">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          Our Standards
        </span>
        <h2 style={{
          fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 400, lineHeight: "72px",
          letterSpacing: "-0.02em", color: "#05144D",
          textAlign: "center", margin: 0,
          fontFamily: "var(--pf-display)",
        }}>
          {heading}
        </h2>
        <p style={{
          fontSize: 18, fontWeight: 400, lineHeight: "28px",
          textAlign: "center", color: "#4A557E", margin: 0,
        }}>
          {subtitle}
        </p>
      </div>

      {/* Cards grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 1280 }}>
        {/* Row 1 */}
        <div style={{ display: "flex", gap: 20 }} className="flex-col md:flex-row">
          {row1.map((feature, i) => {
            const iconName = (feature as PrecisionFeature).icon || defaultFeatures[i]?.icon || "synthesis"
            const iconSrc = iconMap[iconName] || iconMap.synthesis
            const isFirst = i === 0

            return (
              <div
                key={(feature as PrecisionFeature)._uid || i}
                style={{
                  display: "flex", flexDirection: "column",
                  justifyContent: "center", alignItems: "flex-start",
                  padding: 32, gap: 36,
                  flex: 1, minHeight: 250,
                  background: isFirst
                    ? "linear-gradient(180deg, rgba(0, 28, 134, 0) 0%, rgba(0, 28, 134, 0.08) 100%)"
                    : "rgba(0, 36, 173, 0.04)",
                  borderRadius: 24,
                  ...(isFirst ? { filter: "drop-shadow(0px 0px 64px rgba(0, 36, 173, 0.16))" } : {}),
                }}
              >
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 64, height: 64,
                  background: isFirst ? "#001C86" : "rgba(0, 28, 134, 0.08)",
                  borderRadius: 99,
                }}>
                  <Image
                    src={iconSrc}
                    alt=""
                    width={32}
                    height={32}
                    style={{ filter: isFirst ? "brightness(0) invert(1)" : "none" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 500, lineHeight: "30px", color: "#05144D", margin: 0 }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: 16, fontWeight: 400, lineHeight: "24px", color: "#4A557E", margin: 0 }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Row 2 */}
        <div style={{ display: "flex", gap: 20 }} className="flex-col md:flex-row">
          {row2.map((feature, i) => {
            const iconName = (feature as PrecisionFeature).icon || defaultFeatures[i + 3]?.icon || "storage"
            const iconSrc = iconMap[iconName] || iconMap.storage

            return (
              <div
                key={(feature as PrecisionFeature)._uid || i + 3}
                style={{
                  display: "flex", flexDirection: "column",
                  justifyContent: "center", alignItems: "flex-start",
                  padding: 32, gap: 36,
                  flex: 1, minHeight: 250,
                  background: "rgba(0, 36, 173, 0.04)",
                  borderRadius: 24,
                }}
              >
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 64, height: 64,
                  background: "rgba(0, 28, 134, 0.08)",
                  borderRadius: 99,
                }}>
                  <Image src={iconSrc} alt="" width={32} height={32} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 500, lineHeight: "30px", color: "#05144D", margin: 0 }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: 16, fontWeight: 400, lineHeight: "24px", color: "#4A557E", margin: 0 }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
