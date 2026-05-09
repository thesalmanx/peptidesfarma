import { storyblokEditable } from "@storyblok/react/rsc"
import Link from "next/link"

interface HomepageHeroBlok {
  title?: string
  subtitle?: string
  button_text?: string
  button_link?: string
  background_image?: { filename: string; alt?: string }
  _uid: string
  component: string
  [key: string]: any
}

export default function HomepageHeroBlock({ blok }: { blok: HomepageHeroBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background: blok.background_image?.filename
          ? undefined
          : "linear-gradient(180deg, #08122A 0%, #162850 100%)",
      }}
    >
      {blok.background_image?.filename && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${blok.background_image.filename})`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      <div className="relative max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-[-0.03em] mb-4">
          {blok.title || "Research-Grade Peptides"}
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-[600px] mx-auto mb-10">
          {blok.subtitle || "Pharmaceutical-grade compounds verified for purity before they ship."}
        </p>
        <Link
          href={blok.button_link || "/products"}
          className="btn-primary inline-flex items-center justify-center h-14 px-10 rounded-full text-white font-bold text-lg hover:opacity-90 transition-opacity"
        >
          {blok.button_text || "Shop Now"}
        </Link>
      </div>
    </section>
  )
}
