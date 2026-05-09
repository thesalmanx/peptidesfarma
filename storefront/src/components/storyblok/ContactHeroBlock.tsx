import Image from "next/image"
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"

interface ContactHeroBlok extends SbBlokData {
  heading?: string
  highlight?: string
  subtitle?: string
}

export default function ContactHeroBlock({ blok }: { blok: ContactHeroBlok }) {
  const heading = blok.heading || "How can we"
  const highlight = blok.highlight || "help?"
  const subtitle =
    blok.subtitle ||
    "Our research support team is here to assist with orders, product questions, reconstitution guidance, and more."

  return (
    <section
      className="ch-hero"
      {...storyblokEditable(blok)}
    >
      <div className="ch-inner">
        {/* 3 floating vials — 1 left, 2 right */}
        <div className="ch-vials">
          <Image
            src="/icons/nad+.png"
            alt=""
            width={140}
            height={130}
            className="ch-vial ch-vial-1"
          />
          <Image
            src="/icons/ghk-cu.png"
            alt=""
            width={110}
            height={95}
            className="ch-vial ch-vial-2"
          />
          <Image
            src="/icons/glp-3.png"
            alt=""
            width={120}
            height={100}
            className="ch-vial ch-vial-3"
          />
        </div>
        <div className="ch-content">
          <span className="ch-badge">
            <span className="ch-badge-dot" />
            Typically respond within 24 hours
          </span>
          <h1 className="ch-title">
            {heading}{" "}
            <span className="ch-highlight">{highlight}</span>
          </h1>
          <p className="ch-subtitle">{subtitle}</p>
        </div>
      </div>

      <style>{`
        .ch-hero {
          background: linear-gradient(180deg, #DDE9FF 0%, #E8EFFF 40%, #F0F4FF 100%);
          position: relative;
          overflow: hidden;
          min-height: 340px;
        }
        @media (min-width: 768px) {
          .ch-hero { min-height: 420px; }
        }

        .ch-inner {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: inherit;
        }

        .ch-vials {
          pointer-events: none;
        }
        .ch-vial {
          position: absolute;
          object-fit: contain;
          z-index: 0;
          opacity: 0.7;
        }
        .ch-vial-1 {
          width: 55px;
          height: auto;
          top: 10%;
          left: 4px;
          transform: rotate(-12deg);
        }
        .ch-vial-2 {
          width: 48px;
          height: auto;
          top: 5%;
          right: 11px;
          transform: rotate(-61deg);
        }
        .ch-vial-3 {
          width: 50px;
          height: auto;
          bottom: 10%;
          right: 12%;
          transform: rotate(-6deg);
        }
        @media (min-width: 768px) {
          .ch-vial { opacity: 0.85; }
          .ch-vial-1 { width: 100px; left: 12%; top: 18%; }
          .ch-vial-2 { width: 85px; right: 2%; top: 10%; transform: rotate(-61deg); }
          .ch-vial-3 { width: 90px; right: 10%; }
        }
        @media (min-width: 1200px) {
          .ch-vial-1 { width: 110px; left: 12%; }
          .ch-vial-2 { width: 95px; right: 3%; }
          .ch-vial-3 { width: 100px; right: 12%; }
        }

        .ch-content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 48px 24px;
          max-width: 650px;
        }
        @media (min-width: 768px) {
          .ch-content { padding: 64px 32px; }
        }

        .ch-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 20px;
          border-radius: 100px;
          margin-bottom: 22px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .ch-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22C55E;
          flex-shrink: 0;
        }

        .ch-title {
          font-size: clamp(32px, 6vw, 56px);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: #14213D;
          margin: 0 0 16px;
        }
        .ch-highlight {
          background: linear-gradient(90deg, #4F8AF7 0%, #7AA2FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ch-subtitle {
          font-size: clamp(16px, 2.2vw, 20px);
          line-height: 1.55;
          color: #555;
          max-width: 520px;
          margin: 0 auto;
        }
      `}</style>
    </section>
  )
}
