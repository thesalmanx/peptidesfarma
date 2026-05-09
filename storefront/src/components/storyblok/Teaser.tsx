import { storyblokEditable } from "@storyblok/react/rsc"

interface TeaserBlok {
  headline?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function Teaser({ blok }: { blok: TeaserBlok }) {
  return (
    <div
      {...storyblokEditable(blok)}
      className="py-16 text-center max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      {blok.headline && (
        <h2 className="text-3xl md:text-5xl font-bold text-[#141414] tracking-[-0.03em]">
          {blok.headline}
        </h2>
      )}
    </div>
  )
}
