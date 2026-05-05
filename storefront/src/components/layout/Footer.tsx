import Link from "next/link"
import Image from "next/image"

interface FooterLink {
  label: string
  url: string
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

const defaultColumns: FooterColumn[] = [
  {
    title: "Home",
    links: [
      { label: "Shop", url: "/products" },
      { label: "About", url: "/about" },
      { label: "Contact Us", url: "/contact" },
    ],
  },
  {
    title: "Legal pages",
    links: [
      { label: "FAQs", url: "/faq" },
      { label: "Terms & conditions", url: "/terms-of-service" },
      { label: "Privacy policy", url: "/privacy-policy" },
      { label: "Shipping & Returns", url: "/shipping-and-returns" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "support@peptidesfarma.com", url: "mailto:support@peptidesfarma.com" },
    ],
  },
]

const trustBadges = [
  { icon: "/icons/social/security-check.svg", label: "SSL Secured" },
  { icon: "/icons/social/test-tube-01.svg", label: "99%+ purity" },
  { icon: "/icons/social/truck-delivery.svg", label: "Same day delivery" },
]

export default function Footer() {
  const columns = defaultColumns
  const copyrightText = `\u00A9 ${new Date().getFullYear()} by Peptidesfarma`

  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #14213D 0%, #1B2A55 50%, #2A4A8C 100%)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-9 lg:px-0">
        <div className="py-12 lg:py-14 flex flex-col gap-10 lg:gap-24">
          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-20">
            <div className="shrink-0">
              <Link href="/">
                <span className="text-white font-bold text-xl md:text-2xl tracking-tight">Peptidesfarma</span>
              </Link>
            </div>

            <div className="flex flex-col gap-6 lg:flex-1 w-full">
              <div className="grid grid-cols-2 gap-20 lg:hidden">
                {columns.slice(0, 2).map((col, i) => (
                  <div key={i} className="flex flex-col gap-[10px]">
                    <h4 className="text-[16px] font-semibold leading-6 tracking-[-0.01em] text-white">{col.title}</h4>
                    <div className="flex flex-col gap-2">
                      {col.links.map((link, j) => (
                        <Link key={j} href={link.url || "#"} className="text-[14px] font-normal leading-5 tracking-[-0.03em] text-white/90 hover:text-white transition-colors whitespace-pre-line">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {columns.length > 2 && (
                <div className="flex flex-col gap-3 lg:hidden">
                  <h4 className="text-[16px] font-semibold leading-6 tracking-[-0.01em] text-white">{columns[2].title}</h4>
                  <div className="flex flex-col gap-2">
                    {columns[2].links.map((link, j) => (
                      <Link key={j} href={link.url || "#"} className="text-[14px] font-normal leading-5 tracking-[-0.03em] text-white/90 hover:text-white transition-colors whitespace-pre-line">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <nav aria-label="Footer navigation" className="hidden lg:grid lg:grid-cols-3 gap-20 w-full">
                {columns.map((col, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <h4 className="text-[16px] font-semibold leading-6 tracking-[-0.01em] text-white">{col.title}</h4>
                    <div className="flex flex-col gap-3">
                      {col.links.map((link, j) => (
                        <Link key={j} href={link.url || "#"} className="text-[16px] font-normal leading-6 tracking-[-0.03em] text-white/90 hover:text-white transition-colors whitespace-pre-line">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 lg:hidden" />

        <div className="py-4 flex flex-col gap-6 lg:hidden">
          <div className="flex flex-col items-center gap-6">
            <span className="text-[16px] font-normal leading-6 tracking-[-0.03em] text-white text-center">{copyrightText}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center" style={{ gap: "16px 24px" }}>
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2">
                <Image src={badge.icon} alt="" width={16} height={16} className="w-4 h-4" />
                <span className="text-[14px] font-normal leading-5 tracking-[-0.03em] text-white/90">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center" style={{ gap: "24px" }}>
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Image src={badge.icon} alt="" width={16} height={16} className="w-4 h-4" />
                  <span className="text-[14px] font-normal leading-5 tracking-[-0.03em] text-white/90">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10" />
          <div className="py-4 flex justify-center">
            <span className="text-[14px] font-normal leading-5 tracking-[-0.03em] text-white/90 text-center">
              {"\u00A9"} {new Date().getFullYear()} Peptidesfarma. All rights reserved. For research purposes only.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
