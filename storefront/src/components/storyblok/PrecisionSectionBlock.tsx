import { storyblokEditable } from "@storyblok/react/rsc"
import { render } from "storyblok-rich-text-react-renderer"

interface PrecisionSectionBlok {
  title?: string
  subtitle?: string
  content?: any
  image?: { filename: string; alt?: string }
  _uid: string
  component: string
  [key: string]: any
}

export default function PrecisionSectionBlock({ blok }: { blok: PrecisionSectionBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-16 md:py-20 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl md:text-4xl font-bold text-[#141414] tracking-[-0.03em] mb-4">
            {blok.title || "Precision in Every Compound"}
          </h2>
          {blok.subtitle && (
            <p className="text-lg text-[#4F8AF7] font-semibold mb-4">{blok.subtitle}</p>
          )}
          <div className="prose prose-lg text-[#4A5568] max-w-none">
            {blok.content ? render(blok.content) : (
              <p>
                Every peptide undergoes rigorous HPLC testing and quality verification to
                ensure the highest standards for your research.
              </p>
            )}
          </div>
        </div>
        {blok.image?.filename && (
          <div className="w-full md:w-1/2">
            <img
              src={blok.image.filename}
              alt={blok.image.alt || blok.title || ""}
              className="w-full rounded-[20px]"
            />
          </div>
        )}
      </div>
    </section>
  )
}
