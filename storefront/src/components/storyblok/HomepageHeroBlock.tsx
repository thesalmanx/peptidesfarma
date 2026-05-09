import { storyblokEditable } from "@storyblok/react/rsc"
import type { SbBlokData } from "@storyblok/react/rsc"
import Link from "next/link"
import Image from "next/image"

interface HomepageHeroBlok extends SbBlokData {
  rating_text?: string
  heading?: string
  heading_highlight?: string
  subtitle?: string
  cta_text?: string
  cta_link?: string
}

export default function HomepageHeroBlock({ blok }: { blok: HomepageHeroBlok }) {
  const heading = blok.heading || "Research-Grade Peptides."
  const headingHighlight = blok.heading_highlight || "Elevated."
  const subtitle =
    blok.subtitle ||
    "High-purity peptide compounds manufactured for advanced research and innovation."
  const ctaText = blok.cta_text || "Shop products"
  const ctaLink = blok.cta_link || "/products"

  return (
    <section
      {...storyblokEditable(blok)}
      className="relative w-full"
      style={{
        overflow: "clip",
        paddingBottom: "320px",
        marginBottom: "-320px",
      }}
    >
      {/* ── Mobile decorative vials (top & bottom edges) ── */}
      <div className="md:hidden absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <Image
          src="/icons/glp-3.png"
          alt=""
          width={146}
          height={109}
          className="absolute pointer-events-none animate-vial-1"
          style={{ width: "230px", height: "176px", top: "470px", left: "10px", objectFit: "contain" }}
        />
        <Image
          src="/icons/nad+.png"
          alt=""
          width={80}
          height={57}
          className="absolute pointer-events-none animate-vial-2"
          style={{ width: "130px", height: "94px", top: "50px", right: "20px", objectFit: "contain" }}
        />
        <Image
          src="/icons/ghk-cu.png"
          alt=""
          width={100}
          height={85}
          className="absolute pointer-events-none animate-vial-3"
          style={{ width: "155px", height: "161px", top: "455px", right: "30px", objectFit: "contain" }}
        />
      </div>




      <div className="relative mx-auto flex flex-col md:flex-row items-center md:items-center justify-start md:justify-between max-w-[1440px] px-5 md:px-10 lg:px-[80px] min-h-[calc(100svh-88px)] md:min-h-0 pt-[130px] md:pt-0 md:py-12 lg:py-16">
        <div className="relative z-10 flex flex-col items-center md:items-start w-full md:max-w-[608px] gap-6 md:gap-8">

          {/* Heading */}
          <div className="flex flex-col items-center md:items-start" style={{ gap: "16px" }}>
            <h1 className="max-w-full text-center md:text-left text-[36px] md:text-[clamp(40px,5vw,72px)] leading-[1.15] md:leading-[1.11] tracking-[-0.03em] md:tracking-[-0.06em] font-bold text-[#14213D] hero-stagger-2">
              {heading}{" "}
              <span style={{ background: "linear-gradient(90deg, #4F8AF7 0%, #7AA2FF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {headingHighlight}
              </span>
            </h1>
            <p className="max-w-[340px] md:max-w-[436px] text-center md:text-left text-[16px] md:text-[18px] font-normal leading-[24px] md:leading-[28px] text-[#14213D]/80 hero-stagger-3">
              {subtitle}
            </p>
          </div>

          {/* CTA */}
          <Link
            href={ctaLink}
            className="btn-primary group inline-flex items-center justify-center hover:opacity-90 transition-opacity h-[52px] md:h-[52px] w-[240px] md:w-auto hero-stagger-4"
            style={{ borderRadius: "110px", padding: "12px 28px" }}
          >
            <span className="text-[16px] md:text-[16px] font-bold leading-[24px] text-white whitespace-nowrap">
              {ctaText}
            </span>
            <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>

          {/* Trust badges — visible on both mobile and desktop */}
          <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-start gap-2 md:gap-3 hero-stagger-5">
            {[
              { icon: "/icons/checkmark-badge.svg", label: "99% verified purity" },
              { icon: "/icons/test-tube.svg", label: "Lab-Tested & Documented" },
              { icon: "/icons/discover-square.svg", label: "Controlled Manufacturing" },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center shrink-0 h-[26px] md:h-[36px] rounded-full py-1 md:py-2 pr-3 md:pr-4 pl-2 md:pl-3 gap-1.5 md:gap-2 bg-[rgba(255,255,255,0.12)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.2)]"
              >
                <Image src={badge.icon} alt="" width={20} height={20} className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0" />
                <span className="text-[10px] md:text-[14px] font-normal leading-[16px] md:leading-[20px] tracking-[-0.02em] whitespace-nowrap" style={{ color: "rgba(20, 33, 61, 0.8)" }}>
                  {badge.label}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* ── Desktop vials — unchanged ── */}
        <div
          className="relative hidden md:block shrink-0 hero-vials-enter"
          style={{ width: "608px", height: "527.67px" }}
        >
          {[
            { left: "199px", top: "342.83px", rotate: "4.71deg" },
            { left: "53px", top: "282.83px", rotate: "-17.39deg" },
            { left: "310px", top: "491.83px", rotate: "0deg" },
            { left: "416px", top: "274.83px", rotate: "123.89deg" },
            { left: "349px", top: "132.83px", rotate: "91.36deg" },
            { left: "17px", top: "55.83px", rotate: "91.36deg" },
          ].map((e, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                width: "168px", height: "36px", left: e.left, top: e.top,
                background: "#7AA2FF", filter: "blur(40px)", transform: `rotate(${e.rotate})`,
              }}
            />
          ))}
          <Image src="/icons/glp-3.png" alt="GLP-3 peptide vial" width={559} height={297} className="absolute pointer-events-none animate-vial-1" style={{ width: "559px", height: "297px", left: "-186.85px", top: "83.43px", objectFit: "contain" }} loading="lazy" />
          <Image src="/icons/ghk-cu.png" alt="GHK-Cu peptide vial" width={518} height={343} className="absolute pointer-events-none animate-vial-3" style={{ width: "518px", height: "343px", left: "137.4px", top: "166px", objectFit: "contain" }} loading="lazy" />
          <Image src="/icons/nad+.png" alt="NAD+ peptide vial" width={520} height={370} className="absolute pointer-events-none animate-vial-2" style={{ width: "520px", height: "370px", left: "14.21px", top: "41.68px", objectFit: "contain" }} loading="lazy" />
        </div>
      </div>
    </section>
  )
}
