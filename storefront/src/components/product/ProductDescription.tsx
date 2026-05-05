"use client"

import { useState, useRef, useEffect, useCallback } from "react"
// Rich text rendering not needed - using plain text descriptions

interface ProductDescriptionProps {
  description: string | Record<string, any>
  title?: string
}

export default function ProductDescription({ description, title = "Product Description" }: ProductDescriptionProps) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  const measure = useCallback(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [measure, description])

  if (!description) return null

  // Plain text descriptions only
  const isRichText = false

  return (
    <section className="w-full bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20 py-6 md:py-10">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="group flex items-center justify-between w-full py-4 md:py-5 border-b border-[#E5E7EB] cursor-pointer"
        >
          <h2 className="text-[20px] md:text-[28px] font-semibold leading-[28px] md:leading-[36px] tracking-[-0.02em] text-[#141414]">
            {title}
          </h2>
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F3F4F6] group-hover:bg-[#E5E7EB] transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-transform duration-300 ease-out" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
              <path d="M5 7.5L10 12.5L15 7.5" stroke="#141414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        <div
          className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ maxHeight: open ? `${height}px` : "0px", opacity: open ? 1 : 0 }}
        >
          <div ref={contentRef} className="pt-5 md:pt-6 pb-2 md:pb-4">
            {isRichText ? null : (
              <PlainTextDescription text={typeof description === "string" ? description : ""} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function PlainTextDescription({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 0)

  return (
    <div className="flex flex-col gap-4 max-w-[800px]">
      {paragraphs.map((para, i) => {
        const isBullet = para.startsWith("- ") || para.startsWith("• ") || /^\d+[.)]\s/.test(para)
        // Treat as heading only when the paragraph is a short, comma-free,
        // title-case label like "Storage" or "Research Use Notes". Anything
        // longer or with prose punctuation renders as body text so descriptions
        // do not appear universally bold.
        const isHeading =
          !isBullet &&
          para.length <= 30 &&
          !/[,.;:!?]/.test(para) &&
          para
            .split(/\s+/)
            .filter((w) => w.length > 2)
            .every((w) => /^[A-Z0-9]/.test(w))

        if (isBullet) {
          const lines = para.split(/\n/).filter((l) => l.trim())
          return (
            <ul key={i} className="flex flex-col gap-2 pl-1">
              {lines.map((line, j) => (
                <li key={j} className="flex items-start gap-3">
                  <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-[#4F8AF7] shrink-0" />
                  <span className="text-[15px] md:text-[16px] leading-[24px] md:leading-[26px] text-[#4B5563]">
                    {line.replace(/^[-•]\s*/, "").replace(/^\d+[.)]\s*/, "")}
                  </span>
                </li>
              ))}
            </ul>
          )
        }

        if (isHeading) {
          return (
            <h3 key={i} className="text-[16px] md:text-[18px] font-semibold leading-[24px] md:leading-[28px] text-[#141414] mt-2">
              {para}
            </h3>
          )
        }

        return (
          <p key={i} className="text-[15px] md:text-[16px] leading-[24px] md:leading-[26px] text-[#4B5563] tracking-[-0.01em]">
            {para}
          </p>
        )
      })}
    </div>
  )
}
