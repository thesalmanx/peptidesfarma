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
          <div className="flex-1 min-h-[536px] lg:min-h-[734px] rounded-[20px] bg-[#DDE9FF] overflow-hidden relative lg:order-2">
            {productImage ? (
              <Image
                src={productImage}
                alt="Research-grade peptide product"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 620px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="relative mx-auto w-28 h-44">
                    <div className="absolute inset-x-6 top-0 h-8 bg-gray-300/60 rounded-t-lg" />
                    <div className="absolute inset-x-4 top-6 h-3 bg-gray-400/40 rounded-sm" />
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

          <div className="flex flex-col gap-6 lg:gap-10 flex-1 lg:order-1">
            <div className="flex flex-col gap-3 lg:gap-5 max-w-[549px]">
              <h2 className="text-[40px] lg:text-[48px] font-bold leading-[48px] lg:leading-[56px] tracking-[-0.03em] text-[#14213D]">
                {headingText}{" "}
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
              <p className="text-[16px] lg:text-[18px] font-normal leading-7 tracking-[-0.01em] text-[#44516B]">
                {description}
              </p>
            </div>

            <div className="flex justify-between lg:justify-start gap-6 lg:gap-10">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col justify-center gap-0.5">
                  <span className="text-[18px] lg:text-[24px] font-bold lg:font-medium leading-6 lg:leading-8 tracking-[-0.02em] text-[#14213D]">
                    {stat.value}
                  </span>
                  <span className="text-[12px] lg:text-[18px] font-normal leading-4 lg:leading-7 tracking-[-0.01em] text-[#44516B]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="card-hover-border flex flex-col p-5 lg:p-6 gap-4 rounded-[24px] border-2 border-[rgba(79,138,247,0.08)]"
              style={{
                background: "linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[16px] lg:text-[18px] font-normal leading-[30px] tracking-[-0.01em] text-[#14213D]">
                  {badge1}
                </span>
                <span className="inline-flex items-center gap-2.5 bg-[#14213D] border border-[rgba(20,33,61,0.08)] rounded-[99px] px-4 lg:px-6 h-8 lg:h-10">
                  <Image
                    src="/icons/checkmark-circle-01.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-5 h-5 lg:w-6 lg:h-6"
                  />
                  <span className="text-[12px] lg:text-[14px] font-normal leading-[22px] tracking-[-0.01em] text-white">
                    {badge2}
                  </span>
                </span>
              </div>

              <p className="text-[16px] lg:text-[18px] font-normal leading-[30px] tracking-[-0.01em] text-[#14213D]">
                {infoDescription}
              </p>

              <div
                className="flex p-4 lg:p-6 rounded-[16px] lg:rounded-[24px] border-2 border-[rgba(79,138,247,0.08)]"
                style={{
                  background: "linear-gradient(95.01deg, rgba(79, 138, 247, 0.2) 16.35%, rgba(122, 162, 255, 0.2) 68.78%), #FFFFFF",
                }}
              >
                <p className="text-[16px] lg:text-[18px] font-normal leading-[30px] tracking-[-0.01em] text-[#14213D]">
                  {calloutText.includes(":") ? (
                    <>
                      <span className="font-semibold">{calloutText.split(":")[0]}:</span>
                      {calloutText.slice(calloutText.indexOf(":") + 1)}
                    </>
                  ) : (
                    calloutText
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3">
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center bg-[#14213D] border border-[rgba(20,33,61,0.08)] rounded-[99px] w-[116px] h-12 lg:w-auto lg:px-6 text-[14px] lg:text-[18px] font-normal leading-6 lg:leading-[30px] tracking-[-0.01em] text-white hover:bg-[#1B2A4A] transition-colors"
              >
                {ctaText}
              </Link>
              <div className="flex items-center gap-2.5 px-[1px] lg:px-6 h-12 rounded-[99px]">
                <Image
                  src="/icons/security-check.png"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <span className="text-[14px] lg:text-[18px] font-normal leading-[30px] tracking-[-0.01em] text-[#14213D]">
                  {ctaNote}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
