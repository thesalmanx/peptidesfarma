import { storyblokEditable } from "@storyblok/react/rsc"
import type { SbBlokData } from "@storyblok/react/rsc"
import Image from "next/image"
import Link from "next/link"

interface ExploreBannerBlok extends SbBlokData {
  heading?: string
  subtitle?: string
  cta_text?: string
  cta_link?: string
  vial_left?: { filename: string; alt?: string }
  vial_top_right?: { filename: string; alt?: string }
  vial_bottom_right?: { filename: string; alt?: string }
}

export default function ExploreBannerBlock({ blok }: { blok: ExploreBannerBlok }) {
  const heading = blok.heading || "Explore Our Research-Grade Peptides"
  const subtitle =
    blok.subtitle ||
    "A curated selection of high-purity compounds designed for consistency, accuracy, and laboratory research."
  const ctaText = blok.cta_text || "See all products"
  const ctaLink = blok.cta_link || "/products"
  const vialLeft = "/vials/nad.png"
  const vialTopRight = "/vials/glp.png"
  const vialBottomRight = "/vials/ghk.png"

  return (
    <section {...storyblokEditable(blok)} className="py-5 lg:py-8 px-5 lg:px-20 bg-white">
      <div
        className="max-w-[1280px] mx-auto relative overflow-hidden flex flex-col items-center justify-center rounded-[48px]"
        style={{
          background:
            "radial-gradient(117.57% 338.47% at 92.6% 34%, #DDE9FF 13.39%, #7AA2FF 100%), linear-gradient(98.43deg, rgba(122, 162, 255, 0.32) 24.23%, rgba(79, 138, 247, 0.32) 81.63%)",
          padding: "64px 36px",
          gap: "36px",
          minHeight: "440px",
        }}
      >
        <h2 className="text-3xl md:text-[48px] font-bold md:leading-[56px] tracking-[-0.03em] text-[#14213D] text-center max-w-[622px] z-10">
          {heading.replace(/\s*Peptides\s*$/, "")}{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #4F8AF7 0%, #7AA2FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Peptides
            </span>
        </h2>

        <p className="text-[18px] font-normal leading-7 tracking-[-0.01em] text-[#44516B] text-center max-w-[471px] z-10">
          {subtitle}
        </p>

        <Link
          href={ctaLink}
          className="btn-primary group inline-flex items-center justify-center rounded-[110px] h-12 text-base font-bold leading-6 tracking-[-0.01em] text-white hover:opacity-90 transition-opacity z-10"
          style={{ padding: "12px 28px 12px 24px" }}
        >
          {ctaText}
          <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>

        {/* NAD+ vial left -- mobile */}
        <div
          className="absolute lg:hidden"
          style={{
            width: "12%",
            aspectRatio: "231 / 329",
            left: "7%",
            top: "350px",
            transform: "rotate(-6.11deg)",
            zIndex: 5,
          }}
        >
          <Image src={vialLeft} alt="NAD+ peptide vial" width={231} height={329} className="w-full h-full object-contain" />
        </div>
        {/* NAD+ vial left -- desktop */}
        <div
          className="absolute hidden lg:block"
          style={{
            width: "10%",
            aspectRatio: "231 / 329",
            left: "3%",
            top: "26px",
            transform: "rotate(-1.89deg)",
            zIndex: 5,
          }}
        >
          <Image src={vialLeft} alt="NAD+ peptide vial" width={231} height={329} className="w-full h-full object-contain" />
        </div>

        {/* GLP-3 vial top-right -- mobile */}
        <div
          className="absolute lg:hidden"
          style={{
            width: "13.5%",
            aspectRatio: "160 / 227",
            right: "4.6%",
            top: "calc(50% - 31.9% - 16.9%)",
            transform: "rotate(-0.53deg)",
            zIndex: 3,
          }}
        >
          <Image src={vialTopRight} alt="GLP-3 peptide vial" width={160} height={228} className="w-full h-full object-contain" />
        </div>
        {/* GLP-3 vial top-right -- desktop */}
        <div
          className="absolute hidden lg:block"
          style={{
            width: "8.5%",
            aspectRatio: "160 / 227",
            right: "8.6%",
            top: "calc(50% - 33.9% - 12.9%)",
            transform: "rotate(9.47deg)",
            zIndex: 3,
          }}
        >
          <Image src={vialTopRight} alt="GLP-3 peptide vial" width={160} height={228} className="w-full h-full object-contain" />
        </div>

        {/* GHK-Cu vial bottom-right -- mobile */}
        <div
          className="absolute lg:hidden"
          style={{
            width: "12.8%",
            aspectRatio: "125 / 177",
            right: "5%",
            top: "348px",
            transform: "rotate(-0.18deg)",
            zIndex: 4,
          }}
        >
          <Image src={vialBottomRight} alt="GHK-Cu peptide vial" width={125} height={177} className="w-full h-full object-contain" />
        </div>
        {/* GHK-Cu vial bottom-right -- desktop */}
        <div
          className="absolute hidden lg:block"
          style={{
            width: "8.8%",
            aspectRatio: "125 / 177",
            right: "7%",
            top: "calc(52% - 23% + 23.3%)",
            transform: "rotate(-0.18deg)",
            zIndex: 4,
          }}
        >
          <Image src={vialBottomRight} alt="GHK-Cu peptide vial" width={125} height={177} className="w-full h-full object-contain" />
        </div>
      </div>
    </section>
  )
}
