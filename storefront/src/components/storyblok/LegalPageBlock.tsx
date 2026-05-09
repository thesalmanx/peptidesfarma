import { storyblokEditable } from "@storyblok/react/rsc"
import { render } from "storyblok-rich-text-react-renderer"

interface LegalPageBlok {
  title?: string
  content?: any
  last_updated?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function LegalPageBlock({ blok }: { blok: LegalPageBlok }) {
  return (
    <article
      {...storyblokEditable(blok)}
      className="py-12 md:py-16 max-w-[800px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-[#141414] tracking-[-0.03em] mb-2">
        {blok.title || "Legal"}
      </h1>
      {blok.last_updated && (
        <p className="text-[14px] text-[#9CA3AF] mb-8">
          Last updated: {blok.last_updated}
        </p>
      )}
      <div className="prose prose-lg max-w-none text-[#4A5568]">
        {blok.content ? render(blok.content) : null}
      </div>
    </article>
  )
}
