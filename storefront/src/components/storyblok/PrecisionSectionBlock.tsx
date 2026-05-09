import { storyblokEditable } from "@storyblok/react/rsc"
import type { SbBlokData } from "@storyblok/react/rsc"
import Image from "next/image"
import Link from "next/link"

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
  features?: PrecisionFeature[]
  cta_text?: string
  cta_link?: string
}

const defaultFeatures: PrecisionFeature[] = [
  {
    icon: "ai-dna",
    title: "High-purity peptide synthesis",
    description: "Each compound is synthesized for molecular accuracy and consistent research results.",
  },
  {
    icon: "license-third-party",
    title: "Independent third-party lab testing",
    description: "Products undergo external laboratory testing to verify purity, composition, and batch-level consistency.",
  },
  {
    icon: "laurel-wreath-01",
    title: "Transparent COA access",
    description: "Certificates of Analysis are available to provide clear insight into testing results and product specifications.",
  },
  {
    icon: "star-award-01",
    title: "Controlled storage & handling",
    description: "Compounds are stored and handled under controlled conditions to preserve stability and integrity.",
  },
  {
    icon: "chat-secure-01",
    title: "Research-only compliance focus",
    description: "All products are clearly labeled and supplied exclusively for research and laboratory use.",
  },
]

const iconMap: Record<string, string> = {
  "ai-dna": "/icons/ai-dna.svg",
  "license-third-party": "/icons/license-third-party.svg",
  "laurel-wreath-01": "/icons/laurel-wreath-01.svg",
  "star-award-01": "/icons/star-award-01.svg",
  "chat-secure-01": "/icons/chat-secure-01.svg",
  "synthesis": "/icons/ai-dna.svg",
  "testing": "/icons/license-third-party.svg",
  "coa": "/icons/laurel-wreath-01.svg",
  "storage": "/icons/star-award-01.svg",
  "compliance": "/icons/chat-secure-01.svg",
}

export default function PrecisionSectionBlock({ blok }: { blok: PrecisionSectionBlok }) {
  const heading = blok.heading || "Built for Precision."
  const headingHighlight = blok.heading_highlight || "Backed by Verification."
  const features = blok.features?.length ? blok.features : defaultFeatures
  const ctaText = blok.cta_text || "Learn About Our Standards"
  const ctaLink = blok.cta_link || "#"

  return (
    <section {...storyblokEditable(blok)} className="py-5 lg:py-8 px-5 lg:px-20">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10">
          <h2
            className="font-bold text-[#14213D] max-w-[666px] mx-auto text-left md:text-center text-[40px] md:text-[48px] leading-[48px] md:leading-[56px] tracking-[-0.03em]"
          >
            {heading}{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #4F8AF7 0%, #7AA2FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {headingHighlight}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-3 lg:gap-6 mb-10">
          {features.map((feat, i) => (
            <div
              key={i}
              className={`card-hover-border flex flex-col items-start p-4 lg:p-6 gap-4 rounded-[24px] border-2 border-[rgba(79,138,247,0.08)] lg:w-[400px] lg:h-[192px] ${i === features.length - 1 ? "col-span-2 lg:col-span-1" : ""}`}
              style={{
                background: "linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF",
              }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 lg:w-12 lg:h-12 rounded-[9px] lg:rounded-[12px] shrink-0 p-[6px] lg:p-2"
                style={{
                  background: "linear-gradient(95.01deg, rgba(79, 138, 247, 0.16) 16.35%, rgba(122, 162, 255, 0.16) 68.78%)",
                }}
              >
                <Image
                  src={iconMap[feat.icon] || iconMap["ai-dna"]}
                  alt=""
                  width={32}
                  height={32}
                  className="w-6 h-6 lg:w-8 lg:h-8"
                />
              </div>

              <h3 className="text-[14px] lg:text-[18px] font-semibold leading-5 lg:leading-6 tracking-[-0.02em] text-[#14213D]">
                {feat.title}
              </h3>

              <p className="text-[12px] lg:text-[14px] font-normal leading-4 lg:leading-5 tracking-[-0.01em] text-[#14213D]">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={ctaLink}
            className="btn-primary group inline-flex items-center rounded-[110px] py-3 h-12 text-base font-bold leading-6 tracking-[-0.01em] text-white hover:opacity-90 transition-opacity"
            style={{ padding: "12px 28px 12px 24px" }}
          >
            {ctaText}
            <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
