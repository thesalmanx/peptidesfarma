import Image from "next/image"

export default function TrustBadges({ transparent }: { transparent?: boolean } = {}) {
  const badges = [
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

  return (
    <section className={`py-4 md:py-6 ${transparent ? "" : "bg-white"}`}>
      <div className="flex flex-col md:flex-row justify-center items-stretch px-5 md:px-6 lg:px-20 gap-3 md:gap-4 w-full max-w-[1280px] mx-auto">
      {badges.map((badge) => (
        <div
          key={badge.title}
          className="card-hover flex flex-col items-center md:items-start p-5 md:p-6 gap-3 w-full md:flex-1 rounded-[16px] md:rounded-[20px]"
          style={{
            background: "linear-gradient(135deg, rgba(17, 92, 111, 0.06) 0%, rgba(54, 132, 142, 0.03) 100%), #FFFFFF",
            border: "2px solid rgba(17, 92, 111, 0.12)",
          }}
        >
          <Image src={badge.icon} alt="" width={40} height={40} className="w-9 h-9 md:w-10 md:h-10" />
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
