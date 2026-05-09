import { storyblokEditable, StoryblokServerComponent } from "@storyblok/react/rsc"

interface GridBlok {
  columns?: any[]
  _uid: string
  component: string
  [key: string]: any
}

export default function Grid({ blok }: { blok: GridBlok }) {
  return (
    <div
      {...storyblokEditable(blok)}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20 py-12"
    >
      {(blok.columns || []).map((nestedBlok: any) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </div>
  )
}
