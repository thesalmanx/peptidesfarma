import { storyblokEditable } from "@storyblok/react/rsc"
import { render } from "storyblok-rich-text-react-renderer"

interface DosingBlok {
  title?: string
  content?: any
  _uid: string
  component: string
  [key: string]: any
}

export default function DosingBlock({ blok }: { blok: DosingBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-12 md:py-16 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-[#141414] tracking-[-0.02em] mb-6">
        {blok.title || "Dosing Information"}
      </h2>
      <div className="prose prose-lg max-w-none text-[#4A5568]">
        {blok.content ? render(blok.content) : (
          <p>Dosing information will be provided with your certificate of analysis. Always follow proper research protocols.</p>
        )}
      </div>
    </section>
  )
}
