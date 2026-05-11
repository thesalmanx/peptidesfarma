"use client"

import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"
import { useState, useRef, useEffect } from "react"

interface FaqItem {
  _uid?: string
  component?: string
  question: string
  answer: string
}

interface FaqBlok extends SbBlokData {
  heading?: string
  subtitle?: string
  items?: FaqItem[]
}

const defaultItems: FaqItem[] = [
  { question: "How can I be sure of the purity of your peptides?", answer: "Quality is the cornerstone of PeptidesFarma. Every batch undergoes rigorous High-Performance Liquid Chromatography (HPLC) testing to ensure a purity level of 99% or higher. We provide third-party Certificates of Analysis (COAs) for every product, giving you complete transparency into what you are receiving." },
  { question: "Do I need to refrigerate my peptides?", answer: "Yes. For optimal stability, we recommend storing lyophilized peptides at -20C. Once reconstituted, store at 2-8C and use within 30 days. Always protect from light and moisture." },
  { question: "Where are your peptides sourced from?", answer: "All our peptides are synthesized in GMP-compliant facilities within the United States. We work with certified manufacturers who follow strict pharmaceutical-grade protocols." },
  { question: "How do you ensure the peptides stay cold during shipping?", answer: "We use insulated packaging with gel ice packs for all shipments. Orders are processed same-day and shipped via priority carriers to minimize transit time and maintain product integrity." },
  { question: "What is a COA, and where can I find it?", answer: "A Certificate of Analysis (COA) is a document that details the testing results for each batch, including purity, identity confirmation, and endotoxin levels. COAs are available on each product page and included with every order." },
  { question: "Can I return or exchange a product?", answer: "Due to the nature of research compounds, we cannot accept returns on opened products. However, if your order arrives damaged or incorrect, contact us within 48 hours and we will reship at no charge." },
]

function AccordionItem({ item, isOpen, onClick }: { item: FaqItem; isOpen: boolean; onClick: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column",
        padding: 24, cursor: "pointer",
        background: isOpen ? "#FFFFFF" : "rgba(255, 255, 255, 0.2)",
        border: isOpen ? "none" : "1px solid rgba(255, 255, 255, 0.32)",
        borderRadius: 24,
        transition: "background 300ms ease, border 300ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 20 }}>
        <span style={{ fontSize: 20, fontWeight: isOpen ? 500 : 400, lineHeight: "30px", color: "#05144D", flex: 1 }}>
          {item.question}
        </span>
        <div style={{
          width: 40, height: 40, borderRadius: 99, flexShrink: 0,
          background: isOpen ? "#05144D" : "transparent",
          border: isOpen ? "none" : "1px solid #05144D",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 300ms ease, border 300ms ease",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transition: "transform 300ms ease", transform: isOpen ? "rotate(0)" : "rotate(0)" }}>
            <line x1="4" y1="12" x2="20" y2="12" stroke={isOpen ? "#fff" : "#05144D"} strokeWidth="2" style={{ transition: "stroke 300ms ease" }} />
            <line x1="12" y1="4" x2="12" y2="20" stroke={isOpen ? "#fff" : "#05144D"} strokeWidth="2" style={{ transition: "stroke 300ms ease, opacity 300ms ease, transform 300ms ease", opacity: isOpen ? 0 : 1, transform: isOpen ? "scaleY(0)" : "scaleY(1)", transformOrigin: "center" }} />
          </svg>
        </div>
      </div>
      <div
        ref={contentRef}
        style={{
          maxHeight: height,
          overflow: "hidden",
          transition: "max-height 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease, margin-top 300ms ease",
          opacity: isOpen ? 1 : 0,
          marginTop: isOpen ? 12 : 0,
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", color: "#4A557E", margin: 0 }}>
          {item.answer}
        </p>
      </div>
    </div>
  )
}

export default function FaqBlock({ blok }: { blok: FaqBlok }) {
  const heading = blok.heading || "Frequently Asked Questions"
  const items = blok.items?.length ? blok.items : defaultItems
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section {...storyblokEditable(blok)}>
      <div style={{
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "96px 48px", gap: 48,
        background: "#E0E3F0",
        overflow: "hidden",
        isolation: "isolate",
      }}>
        {/* Gradient overlay */}
        <div style={{
          position: "absolute",
          width: 1532, height: 1057,
          left: "calc(50% - 766px - 115px)",
          top: "calc(50% - 529px - 247px)",
          background: "linear-gradient(310.58deg, #001C86 0.29%, #FFFFFF 75.02%)",
          mixBlendMode: "plus-darker",
          opacity: 0.64,
          filter: "blur(62px)",
          transform: "rotate(12.34deg)",
          zIndex: 0,
          pointerEvents: "none",
        }} />

        {/* Header - centered */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1, textAlign: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", letterSpacing: "0.04em", textTransform: "uppercase", color: "#8B6B56" }}>
            FAQs
          </span>
          <h2 style={{ fontSize: "clamp(36px, 4.5vw, 56px)", fontWeight: 500, lineHeight: "64px", color: "#322F29", margin: 0, fontFamily: "var(--pf-display)" }}>
            {heading}
          </h2>
        </div>

        {/* Single column centered FAQs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 800, zIndex: 2 }}>
          {items.map((item, i) => (
            <AccordionItem
              key={(item as FaqItem)._uid || i}
              item={item as FaqItem}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
