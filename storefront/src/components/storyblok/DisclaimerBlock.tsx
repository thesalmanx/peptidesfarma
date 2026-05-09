import { storyblokEditable } from "@storyblok/react/rsc"
import type { SbBlokData } from "@storyblok/react/rsc"

interface DisclaimerBlok extends SbBlokData {
  badge_text?: string
  text?: string
}

export default function DisclaimerBlock({ blok }: { blok: DisclaimerBlok }) {
  const badgeText = blok.badge_text || "DISCLAIMER"
  const text =
    blok.text ||
    "Please note that all products featured on this website are intended exclusively for research and development purposes. They are not designed for any form of human consumption. The claims made on this website have not undergone evaluation by the U.S. Food and Drug Administration. Neither the statements nor the products of this company aim to diagnose, treat, cure, or ward off any disease. Peptidesfarma is a chemical supplier. Peptidesfarma is not a compounding pharmacy or chemical compounding facility as defined under 503A of the Federal Food, Drug, and Cosmetic act. Peptidesfarma is not an outsourcing facility as defined under 503B of the Federal Food, Drug, and Cosmetic act."

  return (
    <section {...storyblokEditable(blok)} className="py-5 lg:py-8 px-5 lg:px-20 bg-white">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center">
        <div
          className="disclaimer-badge flex items-center justify-center rounded-[99px] z-[1]"
          style={{
            background: "#B9CEF7",
            padding: "12px 24px",
            marginBottom: "-20px",
          }}
        >
          <span className="text-[14px] font-bold leading-5 tracking-[-0.03em] text-center text-[#404040]">
            {badgeText}
          </span>
        </div>

        <div
          className="disclaimer-card w-full flex flex-col items-center rounded-[24px] transition-shadow duration-300 hover:shadow-[0_0_48px_rgba(79,138,247,0.24)]"
          style={{
            background: "linear-gradient(180deg, #DDE3F9 11.14%, #F0E5F9 100%)",
            border: "2px solid #FFFFFF",
            padding: "48px 40px",
            gap: "40px",
          }}
        >
          <p className="text-base md:text-[20px] font-normal md:leading-8 tracking-[-0.02em] text-justify text-[#404040] max-w-[1200px]">
            {text}
          </p>
        </div>
      </div>
    </section>
  )
}
