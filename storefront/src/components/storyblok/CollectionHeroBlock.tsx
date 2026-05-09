import { storyblokEditable } from "@storyblok/react/rsc"

interface CollectionHeroBlok {
  title?: string
  subtitle?: string
  background_image?: { filename: string; alt?: string }
  _uid: string
  component: string
  [key: string]: any
}

export default function CollectionHeroBlock({ blok }: { blok: CollectionHeroBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{
        background: blok.background_image?.filename
          ? undefined
          : "linear-gradient(180deg, #08122A 0%, #0F1D3D 100%)",
      }}
    >
      {blok.background_image?.filename && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${blok.background_image.filename})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      <div className="relative max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-4">
          {blok.title || "Our Collection"}
        </h1>
        {blok.subtitle && (
          <p className="text-lg text-white/70 max-w-[600px] mx-auto">
            {blok.subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
