"use client"

import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"
import Image from "next/image"
import { useMemo } from "react"

interface LegalPageBlok extends SbBlokData {
  badge_text?: string
  title?: string
  subtitle?: string
  last_updated?: string
  body?: string
}

// Sanitize HTML: strip script tags, event handlers, and dangerous protocols
function sanitizeHtml(html: string): string {
  return html
    // Remove script/style/iframe tags and their content
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    // Remove event handlers (onclick, onerror, onload, etc.)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Remove javascript: and data: URLs in href/src attributes
    .replace(/(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, "")
    .replace(/(?:href|src)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, "")
}

export default function LegalPageBlock({ blok }: { blok: LegalPageBlok }) {
  const badge = blok.badge_text || ""
  const title = blok.title || "Policy"
  const subtitle = blok.subtitle || ""
  const lastUpdated = blok.last_updated || ""
  const rawBody = blok.body || ""
  const body = useMemo(() => sanitizeHtml(rawBody), [rawBody])

  return (
    <section {...storyblokEditable(blok)}>
      <div className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-vials">
            <Image src="/icons/nad+.png" alt="" width={130} height={120} className="lp-vial lp-vial-1" />
            <Image src="/icons/ghk-cu.png" alt="" width={100} height={90} className="lp-vial lp-vial-2" />
            <Image src="/icons/glp-3.png" alt="" width={110} height={90} className="lp-vial lp-vial-3" />
          </div>
          <div className="lp-hero-content">
            {badge && (
              <div className="lp-badge-wrap">
                <span className="lp-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#4F8AF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="#4F8AF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {badge}
                </span>
              </div>
            )}
            <h1 className="lp-title">{title}</h1>
            {subtitle && <p className="lp-subtitle">{subtitle}</p>}
            {lastUpdated && <p className="lp-updated">Last updated: {lastUpdated}</p>}
          </div>
        </div>
      </div>

      <div className="lp-body-wrap">
        <div className="lp-body-inner">
          <div className="legal-content" dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      </div>

      <style>{`
        /* ========== HERO ========== */
        .lp-hero {
          background: linear-gradient(180deg, #DDE9FF 0%, #E8EFFF 50%, #F0F4FF 100%);
          position: relative; overflow: hidden; min-height: 320px;
        }
        @media (min-width: 768px) { .lp-hero { min-height: 400px; } }
        .lp-hero-inner {
          max-width: 1280px; margin: 0 auto; position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center; min-height: inherit;
        }
        .lp-vials { pointer-events: none; }
        .lp-vial { position: absolute; object-fit: contain; z-index: 0; opacity: 0.7; }
        .lp-vial-1 { width: 55px; height: auto; top: 10%; left: 4px; transform: rotate(-10deg); }
        .lp-vial-2 { width: 48px; height: auto; top: 5%; right: 11px; transform: rotate(-61deg); }
        .lp-vial-3 { width: 50px; height: auto; bottom: 6%; right: 12%; transform: rotate(-5deg); }
        @media (min-width: 768px) {
          .lp-vial { opacity: 0.85; }
          .lp-vial-1 { width: 100px; left: 12%; top: 16%; }
          .lp-vial-2 { width: 85px; right: 2%; top: 8%; transform: rotate(-61deg); }
          .lp-vial-3 { width: 90px; right: 10%; bottom: 8%; }
        }
        @media (min-width: 1200px) {
          .lp-vial-1 { width: 110px; left: 12%; }
          .lp-vial-2 { width: 95px; right: 3%; }
          .lp-vial-3 { width: 100px; right: 12%; }
        }
        .lp-hero-content {
          position: relative; z-index: 1; text-align: center;
          padding: 48px 24px; max-width: 700px;
        }
        @media (min-width: 768px) { .lp-hero-content { padding: 64px 32px; } }
        .lp-badge-wrap { margin-bottom: 20px; }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
          color: #4F8AF7; font-size: 14px; font-weight: 600;
          padding: 10px 22px; border-radius: 100px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .lp-title {
          font-size: clamp(32px, 6vw, 56px); font-weight: 800;
          line-height: 1.08; letter-spacing: -0.03em; color: #14213D; margin: 0 0 16px;
        }
        .lp-subtitle {
          font-size: clamp(16px, 2.2vw, 20px); line-height: 1.55;
          color: #555; max-width: 560px; margin: 0 auto 8px;
        }
        .lp-updated { font-size: 13px; color: #999; margin: 16px 0 0; }

        /* ========== BODY ========== */
        .lp-body-wrap { background: #FAFBFC; padding: 48px 20px 64px; }
        @media (min-width: 768px) { .lp-body-wrap { padding: 64px 32px 80px; } }
        .lp-body-inner { max-width: 800px; margin: 0 auto; }

        /* ========== TYPOGRAPHY ========== */
        .legal-content { font-size: 15.5px; line-height: 1.8; color: #4B5563; }

        .legal-content h2 {
          font-size: 22px; font-weight: 700; color: #4F8AF7;
          margin: 52px 0 18px; letter-spacing: -0.015em;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(79,138,247,0.12);
        }
        .legal-content h2:first-child { margin-top: 0; }

        .legal-content h3 {
          font-size: 18px; font-weight: 600; color: #4F8AF7; margin: 28px 0 10px;
        }
        .legal-content p { margin: 0 0 16px; }
        .legal-content ul, .legal-content ol { margin: 0 0 20px; padding-left: 0; list-style: none; }
        .legal-content li {
          margin-bottom: 10px; padding-left: 24px; position: relative;
        }
        .legal-content li::before {
          content: '';
          position: absolute; left: 0; top: 9px;
          width: 6px; height: 6px; border-radius: 50%;
          background: linear-gradient(135deg, #4F8AF7, #7AA2FF);
        }
        .legal-content a { color: #4F8AF7; text-decoration: none; font-weight: 500; }
        .legal-content a:hover { color: #1B2A4A; text-decoration: underline; }
        .legal-content strong { font-weight: 600; color: #1f2937; }

        /* ========== ICON CIRCLES ========== */
        .legal-content .ic {
          display: inline-flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 12px;
          flex-shrink: 0; margin-right: 14px; vertical-align: middle;
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.16) 16.35%, rgba(122, 162, 255, 0.16) 68.78%);
        }
        .legal-content .ic svg { width: 20px; height: 20px; color: #4F8AF7; }
        .legal-content .ic-blue, .legal-content .ic-teal, .legal-content .ic-purple,
        .legal-content .ic-amber, .legal-content .ic-rose, .legal-content .ic-emerald {
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.16) 16.35%, rgba(122, 162, 255, 0.16) 68.78%);
        }
        .legal-content .ic-blue svg, .legal-content .ic-teal svg, .legal-content .ic-purple svg,
        .legal-content .ic-amber svg, .legal-content .ic-rose svg, .legal-content .ic-emerald svg {
          color: #4F8AF7;
        }

        /* ========== INFO CARDS ========== */
        .legal-content .info-card {
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF;
          border: 2px solid rgba(79, 138, 247, 0.08);
          border-radius: 24px;
          padding: 24px; margin: 20px 0;
          box-shadow: inset 0px 4px 74px rgba(79, 138, 247, 0.05);
          transition: border-color 0.3s ease-out, box-shadow 0.3s ease-out;
        }
        .legal-content .info-card:hover {
          border-color: rgba(79, 138, 247, 0.7);
          box-shadow: 0 0 12px 2px rgba(79, 138, 247, 0.35), 0 0 4px 1px rgba(79, 138, 247, 0.2);
        }
        .legal-content .info-card h3 {
          margin: 0 0 10px; color: #4F8AF7; font-size: 17px;
          display: flex; align-items: center;
        }
        .legal-content .info-card p:last-child { margin-bottom: 0; }

        /* ========== INFO GRID ========== */
        .legal-content .info-grid {
          display: grid; grid-template-columns: 1fr; gap: 16px; margin: 20px 0;
        }
        @media (min-width: 640px) {
          .legal-content .info-grid { grid-template-columns: 1fr 1fr; }
        }
        .legal-content .info-grid .info-card { margin: 0; }

        /* ========== GUARANTEE BANNER ========== */
        .legal-content .guarantee-banner {
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.12) 16.35%, rgba(122, 162, 255, 0.12) 68.78%), #FFFFFF;
          border: 2px solid rgba(79, 138, 247, 0.08);
          border-radius: 24px;
          padding: 40px 32px; margin: 32px 0; text-align: center;
        }
        .legal-content .guarantee-banner .banner-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.16) 16.35%, rgba(122, 162, 255, 0.16) 68.78%);
          margin-bottom: 18px;
        }
        .legal-content .guarantee-banner .banner-icon svg { width: 26px; height: 26px; color: #4F8AF7; }
        .legal-content .guarantee-banner h3 { color: #4F8AF7; margin: 0 0 10px; font-size: 22px; font-weight: 700; }
        .legal-content .guarantee-banner p { color: #4B5563; margin: 0; font-size: 15px; max-width: 500px; margin: 0 auto; }

        /* ========== STEPS ========== */
        .legal-content .steps-grid {
          display: grid; grid-template-columns: 1fr; gap: 16px; margin: 24px 0;
        }
        @media (min-width: 640px) {
          .legal-content .steps-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .legal-content .step-card {
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF;
          border: 2px solid rgba(79, 138, 247, 0.08);
          border-radius: 24px; padding: 28px 20px; text-align: center;
          box-shadow: inset 0px 4px 74px rgba(79, 138, 247, 0.05);
          transition: border-color 0.3s ease-out, box-shadow 0.3s ease-out;
        }
        .legal-content .step-card:hover {
          border-color: rgba(79, 138, 247, 0.7);
          box-shadow: 0 0 12px 2px rgba(79, 138, 247, 0.35), 0 0 4px 1px rgba(79, 138, 247, 0.2);
        }
        .legal-content .step-number {
          display: inline-flex; align-items: center; justify-content: center;
          width: 46px; height: 46px; border-radius: 50%;
          background: linear-gradient(135deg, #4F8AF7 0%, #7AA2FF 100%);
          color: #fff; font-weight: 700; font-size: 18px; margin-bottom: 16px;
        }
        .legal-content .step-card h4 { font-size: 16px; font-weight: 700; color: #4F8AF7; margin: 0 0 8px; }
        .legal-content .step-card p { font-size: 14px; color: #6B7280; margin: 0; line-height: 1.5; }

        /* ========== ELIGIBILITY ========== */
        .legal-content .eligibility-grid {
          display: grid; grid-template-columns: 1fr; gap: 16px; margin: 24px 0;
        }
        @media (min-width: 640px) {
          .legal-content .eligibility-grid { grid-template-columns: 1fr 1fr; }
        }
        .legal-content .eligible-card {
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF;
          border: 2px solid rgba(79, 138, 247, 0.08);
          border-radius: 24px; padding: 26px;
        }
        .legal-content .eligible-card h4 { color: #4F8AF7; font-size: 16px; font-weight: 700; margin: 0 0 16px; }
        .legal-content .not-eligible-card {
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.04) 16.35%, rgba(122, 162, 255, 0.04) 68.78%), #FFFFFF;
          border: 2px solid rgba(79, 138, 247, 0.08);
          border-radius: 24px; padding: 26px;
        }
        .legal-content .not-eligible-card h4 { color: #4F8AF7; font-size: 16px; font-weight: 700; margin: 0 0 16px; }
        .legal-content .check-item, .legal-content .x-item {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 11px; font-size: 14.5px; line-height: 1.4;
        }
        .legal-content .check-item:last-child, .legal-content .x-item:last-child { margin-bottom: 0; }
        .legal-content .check-icon {
          flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%;
          background: linear-gradient(135deg, #4F8AF7, #7AA2FF);
          color: #fff; display: inline-flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
        }
        .legal-content .x-icon {
          flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%;
          background: #D5DEE0;
          color: #6B7280; display: inline-flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
        }

        /* ========== ICON CARDS ========== */
        .legal-content .icon-cards {
          display: grid; grid-template-columns: 1fr; gap: 16px; margin: 24px 0;
        }
        @media (min-width: 640px) {
          .legal-content .icon-cards { grid-template-columns: repeat(3, 1fr); }
        }
        .legal-content .icon-card {
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF;
          border: 2px solid rgba(79, 138, 247, 0.08);
          border-radius: 24px; padding: 28px 20px; text-align: center;
          box-shadow: inset 0px 4px 74px rgba(79, 138, 247, 0.05);
          transition: border-color 0.3s ease-out, box-shadow 0.3s ease-out;
        }
        .legal-content .icon-card:hover {
          border-color: rgba(79, 138, 247, 0.7);
          box-shadow: 0 0 12px 2px rgba(79, 138, 247, 0.35), 0 0 4px 1px rgba(79, 138, 247, 0.2);
        }
        .legal-content .icon-card .card-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 48px; height: 48px; border-radius: 12px; margin-bottom: 16px;
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.16) 16.35%, rgba(122, 162, 255, 0.16) 68.78%);
        }
        .legal-content .icon-card .card-icon svg { width: 24px; height: 24px; color: #4F8AF7; }
        .legal-content .icon-card h4 { font-size: 15px; font-weight: 700; color: #4F8AF7; margin: 0 0 6px; }
        .legal-content .icon-card p { font-size: 13.5px; color: #6B7280; margin: 0; line-height: 1.5; }

        /* ========== TIMELINE TABLE ========== */
        .legal-content .timeline-table {
          background: #FFFFFF;
          border: 2px solid rgba(79, 138, 247, 0.08);
          border-radius: 24px; overflow: hidden; margin: 24px 0;
          box-shadow: inset 0px 4px 74px rgba(79, 138, 247, 0.05);
        }
        .legal-content .timeline-header {
          display: grid; grid-template-columns: 1fr 1fr;
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%);
          padding: 14px 24px; border-bottom: 2px solid rgba(79, 138, 247, 0.08);
          font-size: 12px; font-weight: 700; color: #4F8AF7;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .legal-content .timeline-row {
          display: grid; grid-template-columns: 1fr 1fr;
          padding: 16px 24px; border-bottom: 1px solid #F3F4F6; font-size: 14.5px;
        }
        .legal-content .timeline-row:last-child { border-bottom: none; }
        .legal-content .timeline-row .method { font-weight: 600; color: #1f2937; }
        .legal-content .timeline-row .time { color: #6B7280; }

        /* ========== HIGHLIGHT BOX ========== */
        .legal-content .highlight-box {
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.16) 16.35%, rgba(122, 162, 255, 0.16) 68.78%), rgba(79, 138, 247, 0.08);
          border: 2px solid rgba(79, 138, 247, 0.2);
          border-radius: 24px; padding: 24px 28px; margin: 24px 0;
        }
        .legal-content .highlight-box h3 {
          color: #4F8AF7; margin: 0 0 10px; font-size: 16px;
          display: flex; align-items: center;
        }
        .legal-content .highlight-box h3 .ic { margin-right: 12px; }
        .legal-content .highlight-box p { color: #374151; margin: 0; font-size: 14.5px; line-height: 1.65; }

        /* ========== CONTACT CARD ========== */
        .legal-content .contact-card {
          background: radial-gradient(105.38% 309.82% at 100% 50%, #7AA2FF 0%, #4F8AF7 100%);
          border-radius: 24px; padding: 40px 32px;
          margin: 48px 0 0; text-align: center;
        }
        .legal-content .contact-card h3 { color: #fff; margin: 0 0 10px; font-size: 20px; font-weight: 700; }
        .legal-content .contact-card p { color: rgba(255,255,255,0.7); margin: 0 0 6px; font-size: 15px; }
        .legal-content .contact-card a {
          color: #DDE9FF; font-weight: 600; text-decoration: none;
          transition: color 0.15s;
        }
        .legal-content .contact-card a:hover { color: #fff; }

        /* ========== SHIPPING GRID ========== */
        .legal-content .shipping-grid {
          display: grid; grid-template-columns: 1fr; gap: 16px; margin: 20px 0;
        }
        @media (min-width: 640px) {
          .legal-content .shipping-grid { grid-template-columns: 1fr 1fr; }
        }
        .legal-content .shipping-card {
          background: linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF;
          border: 2px solid rgba(79, 138, 247, 0.08);
          border-radius: 24px; padding: 24px;
          box-shadow: inset 0px 4px 74px rgba(79, 138, 247, 0.05);
          transition: border-color 0.3s ease-out, box-shadow 0.3s ease-out;
        }
        .legal-content .shipping-card:hover {
          border-color: rgba(79, 138, 247, 0.7);
          box-shadow: 0 0 12px 2px rgba(79, 138, 247, 0.35), 0 0 4px 1px rgba(79, 138, 247, 0.2);
        }
        .legal-content .shipping-card h4 {
          font-size: 16px; font-weight: 700; color: #4F8AF7; margin: 0 0 8px;
          display: flex; align-items: center;
        }
        .legal-content .shipping-card p { font-size: 14px; color: #6B7280; margin: 0; line-height: 1.5; }
      `}</style>
    </section>
  )
}
