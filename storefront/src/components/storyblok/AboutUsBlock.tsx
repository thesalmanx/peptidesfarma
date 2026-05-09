import Image from "next/image"
import Link from "next/link"
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"

interface ValueItem extends SbBlokData {
  icon: string
  title: string
  description: string
}

interface StatItem extends SbBlokData {
  value: string
  label: string
}

interface TimelineItem extends SbBlokData {
  title: string
  description: string
}

interface AboutUsBlok extends SbBlokData {
  hero_badge?: string
  hero_title?: string
  hero_highlight?: string
  hero_subtitle?: string

  mission_heading?: string
  mission_highlight?: string
  mission_text?: string
  mission_text_2?: string

  values_heading?: string
  values_highlight?: string
  values?: ValueItem[]

  stats?: StatItem[]

  process_heading?: string
  process_highlight?: string
  process_steps?: TimelineItem[]

  cta_heading?: string
  cta_highlight?: string
  cta_subtitle?: string
  cta_button_text?: string
  cta_button_link?: string
}

const iconMap: Record<string, string> = {
  "ai-dna": "/icons/ai-dna.svg",
  "license-third-party": "/icons/license-third-party.svg",
  "laurel-wreath-01": "/icons/laurel-wreath-01.svg",
  "star-award-01": "/icons/star-award-01.svg",
  "chat-secure-01": "/icons/chat-secure-01.svg",
  "checkmark-badge": "/icons/checkmark-badge.svg",
  "flask": "/icons/flask.svg",
  "test-tube": "/icons/test-tube.svg",
  "security-check": "/icons/security-check.png",
  "truck-delivery": "/icons/truck-delivery.svg",
}

const defaultValues: ValueItem[] = [
  {
    icon: "flask",
    title: "Scientific Rigor",
    description:
      "Every compound we offer is held to pharmaceutical-grade purity standards, verified through independent laboratory analysis.",
  } as ValueItem,
  {
    icon: "license-third-party",
    title: "Radical Transparency",
    description:
      "Full Certificates of Analysis, batch tracking, and third-party testing results are available for every product we sell.",
  } as ValueItem,
  {
    icon: "laurel-wreath-01",
    title: "Research-First Mindset",
    description:
      "We exist to advance laboratory research. Every decision we make is guided by what best serves the scientific community.",
  } as ValueItem,
  {
    icon: "chat-secure-01",
    title: "Responsive Support",
    description:
      "Our research support team is available to assist with product questions, reconstitution guidance, and order inquiries.",
  } as ValueItem,
  {
    icon: "star-award-01",
    title: "Quality Assurance",
    description:
      "Products are manufactured in USA-based, FDA-registered facilities following strict cGMP guidelines throughout production.",
  } as ValueItem,
  {
    icon: "ai-dna",
    title: "Innovation-Driven",
    description:
      "We continuously expand our catalog with the latest research compounds, staying at the forefront of peptide science.",
  } as ValueItem,
]

const defaultStats: StatItem[] = [
  { value: "99%+", label: "Purity Standard" } as StatItem,
  { value: "500+", label: "Researchers Served" } as StatItem,
  { value: "50+", label: "Peptide Compounds" } as StatItem,
  { value: "24hr", label: "Avg. Response Time" } as StatItem,
]

const defaultSteps: TimelineItem[] = [
  {
    title: "Synthesis & Manufacturing",
    description:
      "Compounds are synthesized in FDA-registered, USA-based facilities using cGMP-compliant processes for molecular accuracy.",
  } as TimelineItem,
  {
    title: "In-House Quality Check",
    description:
      "Each batch undergoes internal quality assurance review before being submitted for independent testing.",
  } as TimelineItem,
  {
    title: "Third-Party Lab Testing",
    description:
      "Independent, accredited laboratories perform HPLC purity verification and Mass Spectrometry identity confirmation on every batch.",
  } as TimelineItem,
  {
    title: "Certificate of Analysis",
    description:
      "Detailed COA documents are generated for each product, published on its product page, and included with every order.",
  } as TimelineItem,
  {
    title: "Secure Packaging & Shipping",
    description:
      "Products are stored under controlled conditions, packaged with insulated materials, and shipped with temperature protection.",
  } as TimelineItem,
]

export default function AboutUsBlock({ blok }: { blok: AboutUsBlok }) {
  const heroBadge = blok.hero_badge || "About Peptidesfarma"
  const heroTitle = blok.hero_title || "Advancing Research"
  const heroHighlight = blok.hero_highlight || "with Precision"
  const heroSubtitle =
    blok.hero_subtitle ||
    "We provide researchers with the highest-purity peptides and compounds, backed by transparent testing and uncompromising quality standards."

  const missionHeading = blok.mission_heading || "Our"
  const missionHighlight = blok.mission_highlight || "Mission"
  const missionText =
    blok.mission_text ||
    "Peptidesfarma was founded on a simple principle: researchers deserve better. Too many suppliers cut corners on purity, skip independent testing, or obscure their sourcing. We set out to build a different kind of peptide company \u2014 one rooted in scientific integrity and radical transparency."
  const missionText2 =
    blok.mission_text_2 ||
    "Every compound we offer undergoes rigorous third-party laboratory testing, and we publish full Certificates of Analysis for every batch. We believe that when researchers can trust their materials, breakthroughs happen faster."

  const valuesHeading = blok.values_heading || "What We"
  const valuesHighlight = blok.values_highlight || "Stand For"
  const values = blok.values?.length ? blok.values : defaultValues

  const stats = blok.stats?.length ? blok.stats : defaultStats

  const processHeading = blok.process_heading || "Our Quality"
  const processHighlight = blok.process_highlight || "Process"
  const steps = blok.process_steps?.length ? blok.process_steps : defaultSteps

  const ctaHeading = blok.cta_heading || "Ready to Elevate Your"
  const ctaHighlight = blok.cta_highlight || "Research?"
  const ctaSubtitle =
    blok.cta_subtitle ||
    "Browse our catalog of high-purity research peptides with published COAs and same-day shipping."
  const ctaButtonText = blok.cta_button_text || "Shop Products"
  const ctaButtonLink = blok.cta_button_link || "/products"

  return (
    <section {...storyblokEditable(blok)}>
      {/* ── HERO ── */}
      <div className="ab-hero">
        <div className="ab-hero-inner">
          <div className="ab-vials">
            <Image src="/icons/nad+.png" alt="" width={130} height={120} className="ab-vial ab-vial-1" />
            <Image src="/icons/ghk-cu.png" alt="" width={100} height={90} className="ab-vial ab-vial-2" />
            <Image src="/icons/glp-3.png" alt="" width={110} height={90} className="ab-vial ab-vial-3" />
          </div>
          <div className="ab-hero-content">
            <span className="ab-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#4F8AF7" strokeWidth="2" />
                <path d="M12 16v-4M12 8h.01" stroke="#4F8AF7" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {heroBadge}
            </span>
            <h1 className="ab-title">
              {heroTitle} <span className="ab-highlight">{heroHighlight}</span>
            </h1>
            <p className="ab-subtitle">{heroSubtitle}</p>
          </div>
        </div>
      </div>

      {/* ── MISSION SECTION ── */}
      <div className="py-16 px-5 md:px-20 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <div className="flex-1 max-w-[560px]">
              <h2 className="text-[40px] lg:text-[48px] font-bold leading-[48px] lg:leading-[56px] tracking-[-0.03em] text-[#14213D] mb-5">
                {missionHeading}{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #4F8AF7 0%, #7AA2FF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {missionHighlight}
                </span>
              </h2>
              <div className="flex flex-col gap-4">
                <p className="text-[16px] lg:text-[18px] font-normal leading-7 tracking-[-0.01em] text-[#44516B]">
                  {missionText}
                </p>
                <p className="text-[16px] lg:text-[18px] font-normal leading-7 tracking-[-0.01em] text-[#44516B]">
                  {missionText2}
                </p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="card-hover-border flex flex-col items-start p-5 lg:p-6 gap-2 rounded-[24px] border-2 border-[rgba(79,138,247,0.08)]"
                    style={{
                      background:
                        "linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF",
                    }}
                  >
                    <span className="text-[28px] lg:text-[36px] font-bold leading-[36px] lg:leading-[44px] tracking-[-0.03em] text-[#14213D]">
                      {stat.value}
                    </span>
                    <span className="text-[13px] lg:text-[15px] font-normal leading-5 tracking-[-0.01em] text-[#555]">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── VALUES SECTION ── */}
      <div className="py-16 px-5 md:px-20 bg-[#FAFAFA]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[40px] lg:text-[48px] font-bold leading-[48px] lg:leading-[56px] tracking-[-0.03em] text-[#14213D]">
              {valuesHeading}{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #4F8AF7 0%, #7AA2FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {valuesHighlight}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="card-hover-border flex flex-col items-start p-5 lg:p-6 gap-4 rounded-[24px] border-2 border-[rgba(79,138,247,0.08)]"
                style={{
                  background:
                    "linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF",
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-[10px] lg:rounded-[12px] shrink-0 p-[6px] lg:p-2"
                  style={{
                    background:
                      "linear-gradient(95.01deg, rgba(79, 138, 247, 0.16) 16.35%, rgba(122, 162, 255, 0.16) 68.78%)",
                  }}
                >
                  <Image
                    src={iconMap[v.icon] || "/icons/ai-dna.svg"}
                    alt=""
                    width={32}
                    height={32}
                    className="w-6 h-6 lg:w-8 lg:h-8"
                  />
                </div>
                <h3 className="text-[16px] lg:text-[18px] font-semibold leading-6 tracking-[-0.02em] text-[#14213D]">
                  {v.title}
                </h3>
                <p className="text-[13px] lg:text-[14px] font-normal leading-5 tracking-[-0.01em] text-[#555]">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── QUALITY PROCESS SECTION ── */}
      <div className="py-16 px-5 md:px-20 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[40px] lg:text-[48px] font-bold leading-[48px] lg:leading-[56px] tracking-[-0.03em] text-[#14213D]">
              {processHeading}{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #4F8AF7 0%, #7AA2FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {processHighlight}
              </span>
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="card-hover-border flex items-start gap-4 lg:gap-6 p-5 lg:p-6 rounded-[24px] border-2 border-[rgba(79,138,247,0.08)]"
                style={{
                  background:
                    "linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF",
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full shrink-0 text-white font-bold text-[14px] lg:text-[16px]"
                  style={{
                    background: "linear-gradient(135deg, #4F8AF7 0%, #7AA2FF 100%)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16px] lg:text-[18px] font-semibold leading-6 tracking-[-0.02em] text-[#14213D]">
                    {step.title}
                  </h3>
                  <p className="text-[13px] lg:text-[15px] font-normal leading-6 tracking-[-0.01em] text-[#555]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA SECTION ── */}
      <div className="py-16 px-5 md:px-20">
        <div className="max-w-[1280px] mx-auto">
          <div
            className="flex flex-col items-center text-center gap-6 p-8 lg:p-14 rounded-[24px]"
            style={{
              background: "radial-gradient(105.38% 309.82% at 100% 50%, #7AA2FF 0%, #4F8AF7 100%)",
            }}
          >
            <h2 className="text-[28px] lg:text-[40px] font-bold leading-[36px] lg:leading-[48px] tracking-[-0.03em] text-white">
              {ctaHeading}{" "}
              <span style={{ color: "rgba(255,255,255,0.75)" }}>{ctaHighlight}</span>
            </h2>
            <p className="text-[15px] lg:text-[18px] font-normal leading-7 text-white/80 max-w-[520px]">
              {ctaSubtitle}
            </p>
            <Link
              href={ctaButtonLink}
              className="inline-flex items-center justify-center bg-white text-[#4F8AF7] rounded-[99px] px-8 h-12 lg:h-14 text-[15px] lg:text-[17px] font-semibold hover:bg-white/90 transition-colors"
            >
              {ctaButtonText}
            </Link>
          </div>
        </div>
      </div>

      {/* ── HERO STYLES ── */}
      <style>{`
        .ab-hero {
          background: linear-gradient(180deg, #DDE9FF 0%, #E8EFFF 50%, #F0F4FF 100%);
          position: relative; overflow: hidden; min-height: 320px;
        }
        @media (min-width: 768px) { .ab-hero { min-height: 400px; } }
        .ab-hero-inner {
          max-width: 1280px; margin: 0 auto; position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center; min-height: inherit;
        }
        .ab-vials { pointer-events: none; }
        .ab-vial { position: absolute; object-fit: contain; z-index: 0; opacity: 0.7; }
        .ab-vial-1 { width: 55px; height: auto; top: 10%; left: 4px; transform: rotate(-10deg); }
        .ab-vial-2 { width: 48px; height: auto; top: 5%; right: 11px; transform: rotate(-61deg); }
        .ab-vial-3 { width: 50px; height: auto; bottom: 6%; right: 12%; transform: rotate(-5deg); }
        @media (min-width: 768px) {
          .ab-vial { opacity: 0.85; }
          .ab-vial-1 { width: 100px; left: 12%; top: 16%; }
          .ab-vial-2 { width: 85px; right: 2%; top: 8%; transform: rotate(-61deg); }
          .ab-vial-3 { width: 90px; right: 10%; bottom: 8%; }
        }
        @media (min-width: 1200px) {
          .ab-vial-1 { width: 110px; left: 12%; }
          .ab-vial-2 { width: 95px; right: 3%; }
          .ab-vial-3 { width: 100px; right: 12%; }
        }
        .ab-hero-content {
          position: relative; z-index: 1; text-align: center;
          padding: 48px 24px; max-width: 700px;
        }
        @media (min-width: 768px) { .ab-hero-content { padding: 64px 32px; } }
        .ab-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
          color: #1B2A4A; font-size: 14px; font-weight: 600;
          padding: 10px 22px; border-radius: 100px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          margin-bottom: 20px;
        }
        .ab-title {
          font-size: clamp(32px, 6vw, 56px); font-weight: 800;
          line-height: 1.08; letter-spacing: -0.03em; color: #14213D; margin: 0 0 16px;
        }
        .ab-highlight {
          background: linear-gradient(90deg, #4F8AF7 0%, #7AA2FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ab-subtitle {
          font-size: clamp(16px, 2.2vw, 20px); line-height: 1.55;
          color: #555; max-width: 560px; margin: 0 auto;
        }
      `}</style>
    </section>
  )
}
