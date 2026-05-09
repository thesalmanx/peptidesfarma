import { storyblokEditable } from "@storyblok/react/rsc"
import Link from "next/link"

interface SubscriptionBannerBlok {
  title?: string
  subtitle?: string
  button_text?: string
  button_link?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function SubscriptionBannerBlock({ blok }: { blok: SubscriptionBannerBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-12 md:py-16 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <div
        className="rounded-[24px] p-8 md:p-12 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(79, 138, 247, 0.08) 0%, rgba(122, 162, 255, 0.04) 100%)",
          border: "2px solid rgba(79, 138, 247, 0.15)",
        }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-[#141414] tracking-[-0.02em] mb-3">
          {blok.title || "Subscribe & Save"}
        </h2>
        <p className="text-[15px] leading-[24px] text-[#4A5568] mb-8 max-w-[500px] mx-auto">
          {blok.subtitle || "Set up a monthly subscription and save on your research supplies. Cancel anytime."}
        </p>
        <Link
          href={blok.button_link || "/products"}
          className="btn-primary inline-flex items-center justify-center h-12 px-8 rounded-full text-white font-bold text-[15px] hover:opacity-90 transition-opacity"
        >
          {blok.button_text || "Get Started"}
        </Link>
      </div>
    </section>
  )
}
