import { storyblokEditable } from "@storyblok/react/rsc"
import { render } from "storyblok-rich-text-react-renderer"

interface ImportantNotesBlok {
  title?: string
  content?: any
  _uid: string
  component: string
  [key: string]: any
}

export default function ImportantNotesBlock({ blok }: { blok: ImportantNotesBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-8 md:py-12 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <div
        className="rounded-[16px] p-6 md:p-8"
        style={{
          background: "linear-gradient(135deg, rgba(79, 138, 247, 0.06) 0%, rgba(122, 162, 255, 0.03) 100%)",
          border: "1px solid rgba(79, 138, 247, 0.15)",
        }}
      >
        <h3 className="text-xl font-bold text-[#141414] mb-4">
          {blok.title || "Important Notes"}
        </h3>
        <div className="prose text-[#4A5568] max-w-none">
          {blok.content ? render(blok.content) : (
            <p>This product is intended for research purposes only. Not for human consumption.</p>
          )}
        </div>
      </div>
    </section>
  )
}
