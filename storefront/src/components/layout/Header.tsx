import Link from "next/link"
import dynamic from "next/dynamic"
import HeaderCartButton from "./HeaderCartButton"
import HeaderAccountButton from "./HeaderAccountButton"
import SearchButton from "@/components/search/SearchButton"

const MobileMenu = dynamic(() => import("@/components/layout/MobileMenu"))

interface NavLink {
  label: string
  url: string
}

const defaultNavLinks: NavLink[] = [
  { label: "Home", url: "/" },
  { label: "Products", url: "/products" },
  { label: "About", url: "/about" },
  { label: "Contact", url: "/contact" },
]

export default function Header() {
  const navLinks = defaultNavLinks
  const announcementText = 'Use coupon code "FARMA10" and get 10% off.'

  return (
    <>
      <div
        className="overflow-hidden flex items-center"
        style={{ background: "#0A1430", height: "40px" }}
      >
        <div className="animate-marquee whitespace-nowrap flex items-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="text-white"
              style={{ fontSize: "14px", fontWeight: 400, lineHeight: "24px", letterSpacing: "0.02em", paddingRight: "96px" }}
            >
              {announcementText}
            </span>
          ))}
        </div>
      </div>

      <header
        className="relative h-16 md:h-[88px]"
        style={{ background: "linear-gradient(135deg, #14213D 0%, #1B2A55 50%, #2A4A8C 100%)" }}
      >
        <div className="h-full flex items-center justify-between mx-auto px-5 md:px-20" style={{ maxWidth: "1440px" }}>
          <Link href="/" className="shrink-0">
            <span className="text-white font-bold text-xl md:text-2xl tracking-tight">Peptidesfarma</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden md:flex items-center" style={{ gap: "32px" }}>
            {navLinks.map((link, i) => (
              <Link key={i} href={link.url || "#"} className="text-white hover:opacity-80 transition-opacity" style={{ fontSize: "16px", fontWeight: 500, lineHeight: "24px", letterSpacing: "0.02em" }}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center" style={{ gap: "20px" }}>
            <SearchButton />
            <Link href="/account/wishlist" aria-label="Wishlist" className="hover:opacity-80 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
            </Link>
            <HeaderCartButton />
            <HeaderAccountButton />
          </div>

          <div className="flex md:hidden items-center" style={{ gap: "16px" }}>
            <SearchButton />
            <HeaderCartButton />
            <MobileMenu navLinks={navLinks} />
          </div>
        </div>
      </header>
    </>
  )
}
