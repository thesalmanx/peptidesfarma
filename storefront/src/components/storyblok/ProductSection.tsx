import { storyblokEditable, StoryblokServerComponent } from "@storyblok/react/rsc"

interface ProductSectionBlok {
  body?: any[]
  title?: string
  subtitle?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function ProductSection({ blok }: { blok: ProductSectionBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-12 md:py-16 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      {blok.title && (
        <h2 className="text-2xl md:text-3xl font-bold text-[#141414] tracking-[-0.02em] mb-2">
          {blok.title}
        </h2>
      )}
      {blok.subtitle && (
        <p className="text-[15px] leading-[22px] text-[#4A5568] mb-8">
          {blok.subtitle}
        </p>
      )}
      {(blok.body || []).map((nestedBlok: any) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </section>
  )
}
