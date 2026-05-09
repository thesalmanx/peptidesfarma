import { storyblokEditable } from "@storyblok/react/rsc"
import Link from "next/link"

interface ExploreBannerBlok {
  title?: string
  subtitle?: string
  button_text?: string
  button_link?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function ExploreBannerBlock({ blok }: { blok: ExploreBannerBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-16 md:py-20"
      style={{
        background: "linear-gradient(135deg, #08122A 0%, #162850 100%)",
      }}
    >
      <div className="max-w-[800px] mx-auto px-5 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-[-0.03em] mb-4">
          {blok.title || "Explore Our Full Catalog"}
        </h2>
        {blok.subtitle && (
          <p className="text-lg text-white/60 mb-8">{blok.subtitle}</p>
        )}
        <Link
          href={blok.button_link || "/products"}
          className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-[#4F8AF7] text-white font-bold text-lg hover:opacity-90 transition-opacity"
        >
          {blok.button_text || "View All Products"}
        </Link>
      </div>
    </section>
  )
}
