"use client"

import { storyblokEditable } from "@storyblok/react"
import type { SbBlokData } from "@storyblok/react"
import Image from "next/image"

interface TrustCard {
  _uid?: string
  component?: string
  icon: string
  title: string
  description: string
}

interface HomepageTrustGridBlok extends SbBlokData {
  cards?: TrustCard[]
}

const cardIcons = [
  "/icons/trust-truck-delivery.svg",
  "/icons/trust-checkmark-badge.svg",
  "/icons/trust-laurel-wreath.svg",
  "/icons/trust-star-award.svg",
  "/icons/trust-checkmark-badge-2.svg",
  "/icons/trust-laurel-wreath-2.svg",
]

export default function HomepageTrustGridBlock({ blok }: { blok: HomepageTrustGridBlok }) {
  const cards = blok.cards || []

  return (
    <section
      {...storyblokEditable(blok)}
      className="relative py-5 px-5 lg:px-20 overflow-hidden"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div className="relative z-10 max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="group flex flex-col items-center md:items-start gap-4 bg-white cursor-pointer rounded-[12px] md:rounded-[24px] p-4 md:py-5 md:px-6 text-center md:text-left md:min-h-[180px]"
            style={{
              border: "1px solid rgba(0, 0, 0, 0.06)",
              boxShadow: "inset 0px 4px 74px rgba(79, 138, 247, 0.05)",
              transition: "border-color 0.3s ease-out, box-shadow 0.3s ease-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(79, 138, 247, 0.5)"
              e.currentTarget.style.boxShadow = "0px 0px 30px 6px rgba(79, 138, 247, 0.25), 0px 4px 24px rgba(0, 0, 0, 0.06), inset 0px 4px 74px rgba(79, 138, 247, 0.1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.06)"
              e.currentTarget.style.boxShadow = "inset 0px 4px 74px rgba(79, 138, 247, 0.05)"
            }}
          >
            <Image src={cardIcons[i]} alt="" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" />
            <div className="flex flex-col gap-3">
              <h3 className="text-[18px] md:text-[20px] font-semibold leading-6 tracking-[-0.03em] text-[#14213D]">
                {card.title}
              </h3>
              <p className="text-[12px] md:text-[16px] leading-[18px] md:leading-6 font-normal tracking-[-0.02em] text-[#14213D]">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
