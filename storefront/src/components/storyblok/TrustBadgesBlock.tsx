import { storyblokEditable } from "@storyblok/react/rsc"

interface Badge {
  icon?: { filename: string; alt?: string }
  title?: string
  description?: string
  _uid: string
}

interface TrustBadgesBlok {
  badges?: Badge[]
  _uid: string
  component: string
  [key: string]: any
}

export default function TrustBadgesBlock({ blok }: { blok: TrustBadgesBlok }) {
  const defaultBadges = [
    {
      icon: "/icons/truck-delivery.svg",
      title: "Fast Shipping",
      description: "Same-day processing with discreet, temperature-controlled delivery",
    },
    {
      icon: "/icons/checkmark-badge-01.svg",
      title: "Third-Party Tested",
      description: "Every batch independently verified for purity and potency",
    },
    {
      icon: "/icons/laurel-wreath-01.svg",
      title: "99%+ Purity",
      description: "HPLC-verified pharmaceutical grade research compounds",
    },
  ]

  const badges = blok.badges?.length
    ? blok.badges.map((b) => ({
        icon: b.icon?.filename || "",
        title: b.title || "",
        description: b.description || "",
      }))
    : defaultBadges

  return (
    <section {...storyblokEditable(blok)} className="py-4 md:py-6">
      <div className="flex flex-col md:flex-row justify-center items-stretch px-5 md:px-6 lg:px-20 gap-3 md:gap-4 w-full max-w-[1280px] mx-auto">
        {badges.map((badge, i) => (
          <div
            key={i}
            className="card-hover flex flex-col items-center md:items-start p-5 md:p-6 gap-3 w-full md:flex-1 rounded-[16px] md:rounded-[20px]"
            style={{
              background:
                "linear-gradient(135deg, rgba(79, 138, 247, 0.06) 0%, rgba(122, 162, 255, 0.03) 100%), #FFFFFF",
              border: "2px solid rgba(79, 138, 247, 0.12)",
            }}
          >
            {badge.icon && (
              <img src={badge.icon} alt="" className="w-9 h-9 md:w-10 md:h-10" />
            )}
            <div className="flex flex-col items-center md:items-start gap-1.5 self-stretch">
              <h3 className="font-bold text-[16px] md:text-[18px] leading-[22px] md:leading-[24px] tracking-[-0.02em] text-[#141414] text-center md:text-left self-stretch">
                {badge.title}
              </h3>
              <p className="font-normal text-[13px] md:text-[15px] leading-[19px] md:leading-[22px] tracking-[-0.01em] text-[#4A5568] text-center md:text-left self-stretch">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
