"use client"

import { storyblokEditable } from "@storyblok/react/rsc"
import { useState } from "react"

interface FaqItem {
  question?: string
  answer?: string
  _uid: string
}

interface FaqBlok {
  title?: string
  items?: FaqItem[]
  _uid: string
  component: string
  [key: string]: any
}

export default function FaqBlock({ blok }: { blok: FaqBlok }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const items = blok.items || []

  return (
    <section
      {...storyblokEditable(blok)}
      className="py-12 md:py-16 max-w-[800px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-[#141414] tracking-[-0.02em] mb-8 text-center">
        {blok.title || "Frequently Asked Questions"}
      </h2>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div
            key={item._uid}
            className="rounded-[12px] overflow-hidden transition-all"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0, 0, 0, 0.08)",
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex items-center justify-between w-full p-5 text-left"
            >
              <span className="font-semibold text-[16px] text-[#141414] pr-4">
                {item.question}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="shrink-0 transition-transform"
                style={{
                  transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="#242424"
                  strokeWidth="1.67"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5">
                <p className="text-[15px] leading-[24px] text-[#4A5568]">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
