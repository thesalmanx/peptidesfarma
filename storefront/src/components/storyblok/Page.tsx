import { storyblokEditable, StoryblokServerComponent } from "@storyblok/react/rsc"

interface PageBlok {
  body?: any[]
  _uid: string
  component: string
  [key: string]: any
}

export default function Page({ blok }: { blok: PageBlok }) {
  return (
    <main {...storyblokEditable(blok)}>
      {(blok.body || []).map((nestedBlok: any) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </main>
  )
}
