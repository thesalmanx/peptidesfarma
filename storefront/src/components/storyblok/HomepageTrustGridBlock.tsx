import { storyblokEditable } from "@storyblok/react/rsc"

interface TrustItem {
  value?: string
  label?: string
  _uid: string
}

interface HomepageTrustGridBlok {
  title?: string
  items?: TrustItem[]
  _uid: string
  component: string
  [key: string]: any
}

export default function HomepageTrustGridBlock({ blok }: { blok: HomepageTrustGridBlok }) {
  const defaultItems = [
    { value: "99%+", label: "Purity" },
    { value: "HPLC", label: "Verified" },
    { value: "COA", label: "Included" },
    { value: "Same-Day", label: "Shipping" },
  ]

  const items = blok.items?.length
    ? blok.items.map((it) => ({ value: it.value || "", label: it.label || "" }))
    : defaultItems

  return (
    <section
      {...storyblokEditable(blok)}
      className="py-12 md:py-16 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      {blok.title && (
        <h2 className="text-2xl md:text-3xl font-bold text-[#141414] tracking-[-0.02em] mb-8 text-center">
          {blok.title}
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-6 rounded-[16px] text-center"
            style={{
              background: "linear-gradient(135deg, rgba(79, 138, 247, 0.06) 0%, rgba(122, 162, 255, 0.03) 100%)",
              border: "1px solid rgba(79, 138, 247, 0.1)",
            }}
          >
            <span className="text-2xl md:text-3xl font-bold text-[#4F8AF7]">
              {item.value}
            </span>
            <span className="mt-1 text-[14px] text-[#4A5568] font-medium">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
