import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"

interface TrustBadgesBlok extends SbBlokData {
  badges?: SbBlokData[]
}

export default function TrustBadgesBlock({ blok }: { blok: TrustBadgesBlok }) {
  return <div {...storyblokEditable(blok)} />
}
