import { storyblokEditable } from "@storyblok/react/rsc"

interface FeatureBlok {
  name?: string
  description?: string
  icon?: { filename: string; alt?: string }
  _uid: string
  component: string
  [key: string]: any
}

export default function Feature({ blok }: { blok: FeatureBlok }) {
  return (
    <div
      {...storyblokEditable(blok)}
      className="flex flex-col items-center p-6 gap-3 text-center"
    >
      {blok.icon?.filename && (
        <img
          src={blok.icon.filename}
          alt={blok.icon.alt || blok.name || ""}
          className="w-12 h-12 object-contain"
        />
      )}
      {blok.name && (
        <h3 className="font-bold text-lg text-[#141414]">{blok.name}</h3>
      )}
      {blok.description && (
        <p className="text-[15px] leading-[22px] text-[#4A5568]">
          {blok.description}
        </p>
      )}
    </div>
  )
}
