"use client"

import Image from "next/image"
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"
import { useState } from "react"

interface FaqItem extends SbBlokData {
  question: string
  answer: string
}

interface FaqBlok extends SbBlokData {
  heading?: string
  subtitle?: string
  items?: FaqItem[]
  hero_badge?: string
  hero_title?: string
  hero_subtitle?: string
}

export default function FaqBlock({ blok }: { blok: FaqBlok }) {
  const heading = blok.heading || "Frequently Asked Questions"
  const subtitle = blok.subtitle || "Common questions about our research peptides"
  const items = blok.items || []
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const showHero = !!(blok.hero_badge || blok.hero_title)
  const heroBadge = blok.hero_badge || ""
  const heroTitle = blok.hero_title || "FAQ"
  const heroSubtitle = blok.hero_subtitle || ""

  const faqJsonLd = items.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } : null

  return (
    <section {...storyblokEditable(blok)}>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {showHero && (
        <div className="fq-hero">
          <div className="fq-hero-inner">
            <div className="fq-vials">
              <Image src="/icons/nad+.png" alt="" width={130} height={120} className="fq-vial fq-vial-1" />
              <Image src="/icons/ghk-cu.png" alt="" width={100} height={90} className="fq-vial fq-vial-2" />
              <Image src="/icons/glp-3.png" alt="" width={110} height={90} className="fq-vial fq-vial-3" />
            </div>
            <div className="fq-hero-content">
              {heroBadge && (
                <div className="fq-badge-wrap">
                  <span className="fq-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#4F8AF7" strokeWidth="2"/>
                      <path d="M12 16v-4M12 8h.01" stroke="#4F8AF7" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {heroBadge}
                  </span>
                </div>
              )}
              <h1 className="fq-title">{heroTitle}</h1>
              {heroSubtitle && <p className="fq-subtitle">{heroSubtitle}</p>}
            </div>
          </div>
        </div>
      )}

      <div className={`${showHero ? 'py-16' : 'py-16'} px-5 md:px-4 bg-white`}>
        <div className="w-full max-w-[896px] mx-auto flex flex-col" style={{ gap: "24px" }}>
          <div className="flex items-start gap-3">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: "40px",
                height: "40px",
                background: "#F4F4F5",
                borderRadius: "12px",
                marginTop: "-4px",
              }}
            >
              <Image src="/icons/question-emoji.svg" alt="" width={12} height={20} />
            </div>
            <div className="flex flex-col" style={{ gap: "3.2px" }}>
              <h2
                style={{
                  fontWeight: 600,
                  fontSize: "32px",
                  lineHeight: "32px",
                  letterSpacing: "-0.8px",
                  color: "#131315",
                }}
              >
                {heading}
              </h2>
              <p
                style={{
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "#5A5A5A",
                }}
              >
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: "4px" }}>
            {items.map((item, i) => {
              const isOpen = openIndex === i
              return (
                <div
                  key={i}
                  className="flex flex-col items-start"
                  style={{
                    boxSizing: "border-box",
                    padding: "20px",
                    gap: "8px",
                    background: isOpen ? "#FAFAFA" : "#FFFFFF",
                    border: isOpen ? "1px solid #9E9EA9" : "1px solid #ECECEE",
                    borderRadius: "20px",
                    transition: "background 200ms ease, border-color 200ms ease",
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                    className="w-full flex items-center justify-between"
                    style={{ gap: "12px" }}
                  >
                    <span
                      id={`faq-question-${i}`}
                      className="text-left"
                      style={{
                        fontWeight: 600,
                        fontSize: "16px",
                        lineHeight: "24px",
                        color: "#131315",
                      }}
                    >
                      {item.question}
                    </span>
                    <div
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        width: "28px",
                        height: "28px",
                        background: isOpen ? "#131315" : "#F4F4F5",
                        borderRadius: "9999px",
                        transition: "background 200ms, transform 200ms",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M4 6L8 10L12 6"
                          stroke={isOpen ? "#FFFFFF" : "#131315"}
                          strokeWidth="1.67"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>

                  <div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    style={{
                      display: "grid",
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      transition: "grid-template-rows 300ms ease",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <p
                        style={{
                          fontWeight: 400,
                          fontSize: "14px",
                          lineHeight: "23px",
                          color: "#4A5568",
                        }}
                      >
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showHero && (
        <style>{`
          .fq-hero {
            background: linear-gradient(180deg, #DDE9FF 0%, #E8EFFF 50%, #F0F4FF 100%);
            position: relative; overflow: hidden; min-height: 320px;
          }
          @media (min-width: 768px) { .fq-hero { min-height: 400px; } }
          .fq-hero-inner {
            max-width: 1280px; margin: 0 auto; position: relative; overflow: hidden;
            display: flex; align-items: center; justify-content: center; min-height: inherit;
          }
          .fq-vials { pointer-events: none; }
          .fq-vial { position: absolute; object-fit: contain; z-index: 0; opacity: 0.7; }
          .fq-vial-1 { width: 55px; height: auto; top: 10%; left: 4px; transform: rotate(-10deg); }
          .fq-vial-2 { width: 48px; height: auto; top: 5%; right: 11px; transform: rotate(-61deg); }
          .fq-vial-3 { width: 50px; height: auto; bottom: 6%; right: 12%; transform: rotate(-5deg); }
          @media (min-width: 768px) {
            .fq-vial { opacity: 0.85; }
            .fq-vial-1 { width: 100px; left: 12%; top: 16%; }
            .fq-vial-2 { width: 85px; right: 2%; top: 8%; transform: rotate(-61deg); }
            .fq-vial-3 { width: 90px; right: 10%; bottom: 8%; }
          }
          @media (min-width: 1200px) {
            .fq-vial-1 { width: 110px; left: 12%; }
            .fq-vial-2 { width: 95px; right: 3%; }
            .fq-vial-3 { width: 100px; right: 12%; }
          }
          .fq-hero-content {
            position: relative; z-index: 1; text-align: center;
            padding: 48px 24px; max-width: 700px;
          }
          @media (min-width: 768px) { .fq-hero-content { padding: 64px 32px; } }
          .fq-badge-wrap { margin-bottom: 20px; }
          .fq-badge {
            display: inline-flex; align-items: center; gap: 8px;
            background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
            color: #1B2A4A; font-size: 14px; font-weight: 600;
            padding: 10px 22px; border-radius: 100px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          }
          .fq-title {
            font-size: clamp(32px, 6vw, 56px); font-weight: 800;
            line-height: 1.08; letter-spacing: -0.03em; color: #14213D; margin: 0 0 16px;
          }
          .fq-subtitle {
            font-size: clamp(16px, 2.2vw, 20px); line-height: 1.55;
            color: #555; max-width: 560px; margin: 0 auto;
          }
        `}</style>
      )}
    </section>
  )
}
