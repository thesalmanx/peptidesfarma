import { storyblokEditable } from "@storyblok/react/rsc"
import { render } from "storyblok-rich-text-react-renderer"

interface AboutUsBlok {
  title?: string
  subtitle?: string
  content?: any
  image?: { filename: string; alt?: string }
  _uid: string
  component: string
  [key: string]: any
}

export default function AboutUsBlock({ blok }: { blok: AboutUsBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-16 md:py-20 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <div className="flex flex-col md:flex-row items-start gap-10 md:gap-16">
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl md:text-5xl font-bold text-[#141414] tracking-[-0.03em] mb-4">
            {blok.title || "About Peptidesfarma"}
          </h1>
          {blok.subtitle && (
            <p className="text-lg text-[#4F8AF7] font-semibold mb-6">{blok.subtitle}</p>
          )}
          <div className="prose prose-lg text-[#4A5568] max-w-none">
            {blok.content ? render(blok.content) : (
              <p>
                Peptidesfarma is dedicated to providing the highest quality research peptides
                and compounds for laboratory use. With rigorous quality control and
                independent third-party testing, we ensure 99%+ purity on every product.
              </p>
            )}
          </div>
        </div>
        {blok.image?.filename && (
          <div className="w-full md:w-1/2">
            <img
              src={blok.image.filename}
              alt={blok.image.alt || blok.title || "About Peptidesfarma"}
              className="w-full rounded-[20px]"
            />
          </div>
        )}
      </div>
    </section>
  )
}
