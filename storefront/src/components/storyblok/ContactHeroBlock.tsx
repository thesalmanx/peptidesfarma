import { storyblokEditable } from "@storyblok/react/rsc"

interface ContactHeroBlok {
  title?: string
  subtitle?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function ContactHeroBlock({ blok }: { blok: ContactHeroBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-16 md:py-24 text-center"
      style={{
        background: "linear-gradient(180deg, #08122A 0%, #0F1D3D 100%)",
      }}
    >
      <div className="max-w-[800px] mx-auto px-5 md:px-6 lg:px-20">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-4">
          {blok.title || "Get in Touch"}
        </h1>
        <p className="text-lg md:text-xl text-white/60 leading-[28px]">
          {blok.subtitle || "We are here to help. Reach out with any questions about our research compounds, orders, or laboratory needs."}
        </p>
      </div>
    </section>
  )
}
