import { storyblokEditable } from "@storyblok/react/rsc"
import Link from "next/link"

interface CtaBannerBlok {
  title?: string
  subtitle?: string
  button_text?: string
  button_link?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function CtaBannerBlock({ blok }: { blok: CtaBannerBlok }) {
  const href = blok.button_link || "/products"

  return (
    <section
      {...storyblokEditable(blok)}
      className="py-16 md:py-20"
      style={{
        background: "linear-gradient(135deg, #4F8AF7 0%, #7AA2FF 100%)",
      }}
    >
      <div className="max-w-[800px] mx-auto px-5 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-[-0.03em] mb-4">
          {blok.title || "Ready to Advance Your Research?"}
        </h2>
        {blok.subtitle && (
          <p className="text-lg text-white/80 mb-8">{blok.subtitle}</p>
        )}
        <Link
          href={href}
          className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-white text-[#4F8AF7] font-bold text-lg hover:opacity-90 transition-opacity"
        >
          {blok.button_text || "Browse Products"}
        </Link>
      </div>
    </section>
  )
}
