import { storyblokEditable } from "@storyblok/react/rsc"
import type { SbBlokData } from "@storyblok/react/rsc"
import Image from "next/image"
import Link from "next/link"

interface SubscriptionBannerBlok extends SbBlokData {
  heading?: string
  heading_highlight?: string
  subtitle?: string
  cta_text?: string
  cta_link?: string
  avatar_image?: { filename: string; alt?: string }
  right_heading?: string
  pill_1?: string
  pill_2?: string
  pill_3?: string
}

export default function SubscriptionBannerBlock({ blok }: { blok: SubscriptionBannerBlok }) {
  // Temporarily hidden — re-enable when subscription flow is fixed
  return null

  const heading = blok.heading || "All products can be purchased as subscription with"
  const headingHighlight = blok.heading_highlight || "15% off."
  const subtitle = blok.subtitle || "Pause/cancel anytime"
  const ctaText = blok.cta_text || "Subscribe now"
  const ctaLink = blok.cta_link || "/products"
  const avatarImage = blok.avatar_image?.filename || "/icons/subscription-avatar.svg"
  const rightHeading = blok.right_heading || "Get access to 100+ products"
  const pill1 = blok.pill_1 || "Refer your friends"
  const pill2 = blok.pill_2 || "Cancel anytime"
  const pill3 = blok.pill_3 || "Get 15% off"

  return (
    <section {...storyblokEditable(blok)} className="py-5 lg:py-8 px-5 lg:px-20 bg-white">
      <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-stretch rounded-[48px]">
        <div className="flex flex-col justify-center items-start py-5 lg:py-12 lg:px-9 gap-7 flex-1">
          <h2 className="text-[32px] lg:text-[48px] font-bold leading-[42px] lg:leading-[56px] tracking-[-0.03em] text-[#14213D] max-w-[622px]">
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

          <p className="text-[20px] lg:text-[24px] font-normal leading-[30px] lg:leading-[40px] tracking-[-0.03em] text-[#14213D]">
            {subtitle}
          </p>

          <Link
            href={ctaLink}
            className="btn-primary group inline-flex items-center justify-center rounded-[110px] h-12 text-base font-bold leading-6 tracking-[-0.01em] text-white whitespace-nowrap hover:opacity-90 transition-opacity"
            style={{
              padding: "12px 28px 12px 24px",
            }}
          >
            {ctaText}
            <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
        </div>

        <div
          className="relative shrink-0 w-full lg:w-[47.5%] rounded-[28px] lg:rounded-[48px] overflow-hidden"
          style={{
            background:
              "radial-gradient(50% 131.15% at 100% 50.03%, rgba(213, 145, 221, 0.18) 0%, rgba(122, 162, 255, 0.36) 100%)",
            aspectRatio: "350 / 304",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: "100%",
              aspectRatio: "1",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(180, 200, 230, 0.35)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "78.9%",
              aspectRatio: "1",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(180, 200, 230, 0.35)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "56.9%",
              aspectRatio: "1",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(180, 200, 230, 0.35)",
            }}
          />

          <div
            className="absolute rounded-full overflow-hidden z-[5]"
            style={{
              width: "26.6%",
              aspectRatio: "1",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Image
              src={avatarImage}
              alt="Subscriber"
              width={162}
              height={162}
              className="w-full h-full object-cover"
            />
          </div>

          <p
            className="absolute text-center font-semibold tracking-[-0.01em] text-[#14213D] z-10 text-[16px] leading-5 lg:text-[28px] lg:leading-[34px]"
            style={{
              width: "52.8%",
              left: "50%",
              transform: "translateX(-50%)",
              top: "13.6%",
            }}
          >
            {rightHeading}
          </p>

          <div
            className="absolute bg-white rounded-[63px] lg:rounded-[110px] flex items-center justify-center z-10"
            style={{
              left: "7.9%",
              top: "59.7%",
              padding: "5px 12px",
            }}
          >
            <span className="text-[9px] lg:text-[16px] font-medium leading-[14px] lg:leading-6 tracking-[-0.01em] text-[#14213D] whitespace-nowrap">
              {pill1}
            </span>
          </div>

          <div
            className="absolute bg-white rounded-[63px] lg:rounded-[110px] flex items-center justify-center z-10"
            style={{
              left: "55.4%",
              top: "75.0%",
              padding: "5px 12px",
            }}
          >
            <span className="text-[9px] lg:text-[16px] font-medium leading-[14px] lg:leading-6 tracking-[-0.01em] text-[#14213D] whitespace-nowrap">
              {pill2}
            </span>
          </div>

          <div
            className="absolute bg-white rounded-[63px] lg:rounded-[110px] flex items-center justify-center z-10"
            style={{
              left: "73.8%",
              top: "37.5%",
              padding: "5px 12px",
            }}
          >
            <span className="text-[9px] lg:text-[16px] font-medium leading-[14px] lg:leading-6 tracking-[-0.01em] text-[#14213D] whitespace-nowrap">
              {pill3}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
