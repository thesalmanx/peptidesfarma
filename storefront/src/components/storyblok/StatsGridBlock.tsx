import { storyblokEditable } from "@storyblok/react/rsc"

interface Stat {
  value?: string
  label?: string
  _uid: string
}

interface StatsGridBlok {
  stats?: Stat[]
  _uid: string
  component: string
  [key: string]: any
}

export default function StatsGridBlock({ blok }: { blok: StatsGridBlok }) {
  const defaultStats = [
    { value: "99%+", label: "Purity Guaranteed" },
    { value: "24hr", label: "Same-Day Processing" },
    { value: "3rd Party", label: "Independent Testing" },
    { value: "COA", label: "With Every Order" },
  ]

  const stats = blok.stats?.length
    ? blok.stats.map((s) => ({ value: s.value || "", label: s.label || "" }))
    : defaultStats

  return (
    <section
      {...storyblokEditable(blok)}
      className="py-12 md:py-16 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center p-6 rounded-[16px] text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(79, 138, 247, 0.06) 0%, rgba(122, 162, 255, 0.03) 100%), #FFFFFF",
              border: "1px solid rgba(79, 138, 247, 0.12)",
            }}
          >
            <span className="text-3xl md:text-4xl font-bold text-[#4F8AF7] tracking-[-0.03em]">
              {stat.value}
            </span>
            <span className="mt-2 text-[14px] text-[#4A5568] font-medium">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
