"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    label: "Dashboard",
    href: "/account",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M2 12.204C2 9.915 2 8.771 2.52 7.823C3.038 6.874 3.987 6.286 5.884 5.108L7.884 3.867C9.889 2.622 10.892 2 12 2C13.108 2 14.11 2.622 16.116 3.867L18.116 5.108C20.013 6.286 20.962 6.874 21.481 7.823C22 8.771 22 9.915 22 12.203V13.725C22 17.625 22 19.576 20.828 20.788C19.657 22 17.771 22 14 22H10C6.229 22 4.343 22 3.172 20.788C2 19.576 2 17.626 2 13.725V12.204Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 15V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "My Orders",
    href: "/account/orders",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M3.32352 13.0113C3.6739 10.009 4.18586 7.75784 4.66063 6.15851C5.04994 4.84711 5.24459 4.19141 6.04283 3.5957C6.84107 3 7.65697 3 9.28876 3H14.7113C16.3431 3 17.159 3 17.9572 3.5957C18.7554 4.19141 18.9501 4.84711 19.3394 6.15851C19.8142 7.75784 20.3261 10.009 20.6765 13.0113C21.0895 16.5497 21.2959 18.3189 20.1027 19.6594C18.9095 21 16.9758 21 13.1084 21H10.8916C7.02422 21 5.09052 21 3.89731 19.6594C2.70411 18.3189 2.91058 16.5497 3.32352 13.0113Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 7C9 8.65685 10.3431 10 12 10C13.6569 10 15 8.65685 15 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M13.2574 17.4936C12.9201 17.8184 12.4693 18 12.0002 18C11.531 18 11.0802 17.8184 10.7429 17.4936C7.6543 14.5008 3.51519 11.1575 5.53371 6.30373C6.6251 3.67932 9.24494 2 12.0002 2C14.7554 2 17.3752 3.67933 18.4666 6.30373C20.4826 11.1514 16.3536 14.5111 13.2574 17.4936Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M18 20C18 21.1046 15.3137 22 12 22C8.68629 22 6 21.1046 6 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "My Wishlist",
    href: "/account/wishlist",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "My Profile",
    href: "/account/profile",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        <path d="M15.5 10.5C15.5 8.567 13.933 7 12 7C10.067 7 8.5 8.567 8.5 10.5C8.5 12.433 10.067 14 12 14C13.933 14 15.5 12.433 15.5 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 20C18 16.6863 15.3137 14 12 14C8.68629 14 6 16.6863 6 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function AccountLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { customer, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          router.push("/auth/login?redirect=/account")
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [customer, isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--pf-paper)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--pf-blue)", borderTopColor: "transparent" }} />
      </div>
    )
  }

  if (!isAuthenticated || !customer) return null

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const profileImage = (customer?.metadata as Record<string, unknown> | null)?.profile_image as string | undefined
  const initials = `${customer?.first_name?.[0]?.toUpperCase() || ""}${customer?.last_name?.[0]?.toUpperCase() || ""}`

  const getNavIcon = (item: typeof navItems[0]) => {
    if (item.href === "/account/profile" && profileImage) {
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
      )
    }
    if (item.href === "/account/profile" && initials) {
      return (
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-medium" style={{ background: "var(--pf-blue)" }}>
          {initials}
        </span>
      )
    }
    return item.icon
  }

  return (
    <div className="relative flex flex-row items-start bg-white min-h-screen overflow-x-hidden w-full">
      {/* Sidebar */}
      <aside className="flex flex-col py-3 px-3 lg:py-6 lg:pl-6 lg:pr-6 gap-4 lg:gap-6 w-[80px] lg:w-[260px] shrink-0 sticky top-0 h-screen" style={{ borderRight: "1px solid var(--pf-line)" }}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="lg:hidden flex items-center justify-center w-[44px] h-[44px] rounded-[14px] hover:bg-[var(--pf-paper)] transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{ color: "var(--pf-text-2)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>

        <nav className="flex flex-col items-center lg:items-stretch gap-1 lg:gap-[2px]">
          {navItems.map((item) => {
            const isActive =
              item.href === "/account"
                ? pathname === "/account"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center lg:justify-start gap-3 w-[44px] h-[44px] lg:w-auto lg:h-auto lg:px-3 lg:py-[10px] rounded-[14px] text-[14px] font-medium leading-[20px] transition`}
                style={{
                  background: isActive ? "var(--pf-blue-tint)" : "transparent",
                  color: isActive ? "var(--pf-ink)" : "var(--pf-text-2)",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--pf-paper)" }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent" }}
              >
                <span style={{ color: isActive ? "var(--pf-blue)" : "var(--pf-text-3)" }}>
                  {getNavIcon(item)}
                </span>
                <span className="hidden lg:block flex-1">{item.label}</span>
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            className="flex items-center justify-center lg:justify-start gap-3 w-[44px] h-[44px] lg:w-auto lg:h-auto lg:px-3 lg:py-[10px] rounded-[14px] text-[14px] font-medium leading-[20px] transition"
            style={{ color: "var(--pf-text-2)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--pf-paper)" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            <span className="hidden lg:inline">Log Out</span>
          </button>
        </nav>
      </aside>

      {/* Mobile overlay */}
      <div
        className={`lg:hidden absolute inset-0 z-10 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.08)" }}
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* Mobile slide-out nav */}
      <div
        className={`lg:hidden absolute left-0 top-0 z-20 flex flex-col py-3 px-3 pl-5 gap-4 w-[249px] h-full bg-white transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ borderRight: "1px solid var(--pf-line)", boxShadow: mobileMenuOpen ? "0px 0px 12px rgba(0,0,0,0.12)" : "none" }}
      >
        <button
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation menu"
          className="flex items-center justify-center w-[44px] h-[44px] rounded-[14px] hover:bg-[var(--pf-paper)] transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{ color: "var(--pf-text-2)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/account"
                ? pathname === "/account"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-[10px] rounded-[14px] text-[14px] font-medium leading-[20px] transition"
                style={{
                  background: isActive ? "var(--pf-blue-tint)" : "transparent",
                  color: isActive ? "var(--pf-ink)" : "var(--pf-text-2)",
                }}
              >
                <span style={{ color: isActive ? "var(--pf-blue)" : "var(--pf-text-3)" }}>
                  {getNavIcon(item)}
                </span>
                <span className="flex-1">{item.label}</span>
              </Link>
            )
          })}

          <button
            onClick={() => { setMobileMenuOpen(false); handleLogout() }}
            className="flex items-center gap-3 px-3 py-[10px] rounded-[14px] text-[14px] font-medium leading-[20px] transition text-left"
            style={{ color: "var(--pf-text-2)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            <span>Log Out</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-start pt-6 pr-5 pl-3 lg:py-6 lg:pl-6 lg:pr-20 gap-4 min-w-0">
        {children}
      </main>
    </div>
  )
}
