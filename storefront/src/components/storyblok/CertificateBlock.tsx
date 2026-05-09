"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"

interface CertItem extends SbBlokData {
  variant: string
  lot_number: string
  labeled: string
  actual: string
  purity: string
  tested: string
  is_latest: boolean
  coa_url: string
}

interface CertificateBlok extends SbBlokData {
  heading?: string
  subheading?: string
  certificates?: CertItem[]
}

function COAModal({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 99999, background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div className="relative flex flex-col" style={{ width: "min(900px, 95vw)", height: "90vh" }} onClick={(e) => e.stopPropagation()}>
        {/* Top toolbar */}
        <div className="flex items-center gap-2 pb-3 shrink-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Open in new tab"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a
            href={url}
            download
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Download PDF"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* PDF iframe */}
        <iframe
          src={`${url}#toolbar=0&navpanes=0&view=FitH`}
          className="flex-1 w-full rounded-lg"
          style={{ background: "white", border: "none", minHeight: 0 }}
          title="Certificate of Analysis"
        />
      </div>
    </div>
  )
}

function COACard({ cert }: { cert: CertItem }) {
  const [showModal, setShowModal] = useState(false)

  const details = [
    { label: "Variant", value: cert.variant },
    { label: "Lot #", value: cert.lot_number },
    { label: "Labeled", value: cert.labeled },
    { label: "Actual", value: cert.actual, highlight: true },
    { label: "Tested", value: cert.tested },
  ]

  const viewCoaInner = (
    <>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M13 9.5V7.75C13 7.15326 12.7629 6.58097 12.341 6.15901C11.919 5.73705 11.3467 5.5 10.75 5.5H9.75C9.55109 5.5 9.36032 5.42098 9.21967 5.28033C9.07902 5.13968 9 4.94891 9 4.75V3.75C9 3.15326 8.76295 2.58097 8.34099 2.15901C7.91903 1.73705 7.34674 1.5 6.75 1.5H5.5M5.5 10H10.5M5.5 12H8M7 1.5H3.75C3.336 1.5 3 1.836 3 2.25V13.75C3 14.164 3.336 14.5 3.75 14.5H12.25C12.664 14.5 13 14.164 13 13.75V7.5C13 5.9087 12.3679 4.38258 11.2426 3.25736C10.1174 2.13214 8.5913 1.5 7 1.5Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "14px", lineHeight: "20px", color: "#FFFFFF" }}>
        View COA
      </span>
    </>
  )

  const viewCoaStyle = {
    height: "40px" as const,
    background: "#14213D",
    borderRadius: "12px",
    cursor: cert.coa_url ? "pointer" as const : "default" as const,
  }

  return (
    <>
      <div
        className="card-hover-border flex flex-col justify-between items-start shrink-0"
        style={{
          width: "280px",
          height: "367px",
          padding: "20px",
          background: "#FFFFFF",
          border: "2px solid rgba(79, 138, 247, 0.12)",
          borderRadius: "16px",
        }}
      >
        <div style={{ paddingBottom: "12px", minHeight: "32px" }}>
          {cert.is_latest && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                background: "#14213D",
                borderRadius: "9999px",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "10px",
                lineHeight: "12px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                color: "#FFFFFF",
              }}
            >
              Latest
            </span>
          )}
        </div>

        <div className="flex flex-col items-center w-full" style={{ height: "70px" }}>
          <span style={{ fontWeight: 600, fontSize: "32px", lineHeight: "32px", letterSpacing: "-0.8px", color: "#4F8AF7", textAlign: "center" }}>
            {cert.purity}
          </span>
          <span style={{ fontWeight: 600, fontSize: "12px", lineHeight: "16px", letterSpacing: "0.6px", textTransform: "uppercase", color: "#14213D", textAlign: "center", marginTop: "5px" }}>
            Purity
          </span>
        </div>

        <div style={{ width: "100%", background: "#FAFAFA", borderRadius: "12px", padding: "12px", paddingBottom: "0px" }}>
          {details.map((row) => (
            <div key={row.label} className="flex items-center justify-between" style={{ padding: "6px 0", width: "100%" }}>
              <span style={{ fontWeight: 400, fontSize: "13px", lineHeight: "18px", color: "#4A5568" }}>{row.label}</span>
              <span style={{ fontWeight: 600, fontSize: "13px", lineHeight: "18px", textAlign: "right", color: row.highlight ? "#4F8AF7" : "#14213D" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {cert.coa_url ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 w-full"
            style={viewCoaStyle}
          >
            {viewCoaInner}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full opacity-50" style={viewCoaStyle}>
            {viewCoaInner}
          </div>
        )}
      </div>

      {showModal && cert.coa_url && typeof document !== "undefined" &&
        createPortal(
          <COAModal url={cert.coa_url} onClose={() => setShowModal(false)} />,
          document.body
        )
      }
    </>
  )
}

export default function CertificateBlock({ blok }: { blok: CertificateBlok }) {
  const heading = blok.heading || "Certificate of Analysis"
  const subheading = blok.subheading || "Third Party Tested by Freedom Diagnostics"
  const certs = blok.certificates || []

  return (
    <section className="bg-white py-4 md:py-6" {...storyblokEditable(blok)}>
      <div className="flex flex-col items-start gap-4 w-full max-w-[1440px] mx-auto px-5 md:px-20">
        <div className="flex items-center justify-center gap-3 w-full">
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(95.01deg, rgba(79, 138, 247, 0.16) 16.35%, rgba(122, 162, 255, 0.16) 68.78%)",
              borderRadius: "12px",
            }}
          >
            <Image src="/icons/flask.svg" alt="" width={20} height={20} />
          </div>
          <div className="flex flex-col">
            <h2 style={{ fontWeight: 700, fontSize: "22px", lineHeight: "28px", letterSpacing: "-0.5px", color: "#14213D" }}>
              {heading}
            </h2>
            <p style={{ fontWeight: 400, fontSize: "14px", lineHeight: "20px", color: "#4A5568" }}>
              {subheading}
            </p>
          </div>
        </div>

        {certs.length > 0 && (
          <div className="flex items-center md:justify-center gap-3 w-full overflow-x-auto" style={{ padding: "8px 0" }}>
            {certs.map((cert, i) => (
              <COACard key={cert._uid || i} cert={cert} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
