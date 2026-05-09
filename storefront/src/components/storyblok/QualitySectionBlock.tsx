import { storyblokEditable } from "@storyblok/react/rsc"
import { render } from "storyblok-rich-text-react-renderer"

interface QualitySectionBlok {
  title?: string
  content?: any
  image?: { filename: string; alt?: string }
  _uid: string
  component: string
  [key: string]: any
}

export default function QualitySectionBlock({ blok }: { blok: QualitySectionBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-16 md:py-20 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16">
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl md:text-4xl font-bold text-[#141414] tracking-[-0.03em] mb-6">
            {blok.title || "Quality You Can Trust"}
          </h2>
          <div className="prose prose-lg text-[#4A5568] max-w-none">
            {blok.content ? render(blok.content) : (
              <p>
                Our commitment to quality is backed by independent third-party testing,
                certificates of analysis with every order, and HPLC-verified purity
                standards exceeding 99%.
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
