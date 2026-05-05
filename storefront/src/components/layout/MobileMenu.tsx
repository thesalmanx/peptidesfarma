"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface NavLink {
  label: string
  url: string
}

export default function MobileMenu({ navLinks }: { navLinks: NavLink[] }) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = "0"
      document.body.style.right = "0"
      document.body.style.overflow = "hidden"
      requestAnimationFrame(() => setVisible(true))
    } else {
      const top = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
      if (top) {
        window.scrollTo(0, parseInt(top) * -1)
      }
      setVisible(false)
    }
    return () => {
      const top = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.overflow = ""
      if (top) {
        window.scrollTo(0, parseInt(top) * -1)
      }
    }
  }, [open])

  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [open])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => setOpen(false), 300)
  }

  const menuItems = [
    ...navLinks,
    { label: "My Profile", url: "/account/profile" },
    { label: "My Wishlist", url: "/account/wishlist" },
  ]

  return (
    <div className="md:hidden">
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <line x1="4" y1="5" x2="20" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4" y1="12" x2="20" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4" y1="19" x2="20" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && createPortal(
        <>
          <div
            className="fixed inset-0 z-[90] transition-opacity duration-300"
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              opacity: visible ? 1 : 0,
            }}
            onClick={handleClose}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="mobile-menu-panel fixed top-0 right-0 bottom-0 z-[100] flex flex-col transition-transform duration-300 ease-out"
            style={{
              width: "310px",
              maxWidth: "85%",
              padding: "12px 20px",
              gap: "16px",
              background: "#FFFFFF",
              borderLeft: "1px solid #E0E0E0",
              boxShadow: "0px 0px 12px rgba(0, 0, 0, 0.12)",
              transform: visible ? "translateX(0)" : "translateX(100%)",
              overscrollBehavior: "contain",
            }}
          >
            <button
              ref={closeButtonRef}
              aria-label="Close menu"
              onClick={handleClose}
              className="flex items-center justify-center self-start"
              style={{
                padding: "10px 12px",
                width: "48px",
                height: "44px",
                borderRadius: "14px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="5" x2="20" y2="5" stroke="#52525B" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="12" x2="20" y2="12" stroke="#52525B" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="19" x2="20" y2="19" stroke="#52525B" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="flex flex-col flex-1" style={{ gap: "12px" }}>
              <span
                style={{
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "#18181B",
                }}
              >
                MENU
              </span>

              <div className="flex flex-col" style={{ gap: "4px" }}>
                {menuItems.map((item, i) => {
                  const isActive = pathname === item.url
                  return (
                    <Link
                      key={i}
                      href={item.url}
                      onClick={handleClose}
                      className="flex items-center"
                      style={{
                        padding: "10px 12px",
                        height: "44px",
                        borderRadius: "14px",
                        background: isActive ? "#E4E4E7" : "transparent",
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: isActive ? "#18181B" : "#52525B",
                      }}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col" style={{ marginTop: "auto" }}>
              {isAuthenticated ? (
                <button
                  aria-label="Log out"
                  onClick={async () => {
                    await logout()
                    setOpen(false)
                    router.push("/")
                  }}
                  className="flex items-center"
                  style={{ padding: "8px 16px", height: "40px", gap: "8px", borderRadius: "12px" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: "rotate(180deg)" }}>
                    <path d="M15 12H3M3 12L7 8M3 12L7 16" stroke="#52525B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                    <path d="M12 3H17C18.6569 3 20 4.34315 20 6V18C20 19.6569 18.6569 21 17 21H12" stroke="#52525B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontWeight: 500, fontSize: "14px", lineHeight: "20px", color: "#52525B" }}>Log Out</span>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center"
                  style={{ padding: "8px 16px", height: "40px", gap: "8px", borderRadius: "12px" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 12H3M3 12L7 8M3 12L7 16" stroke="#4F8AF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                    <path d="M12 3H17C18.6569 3 20 4.34315 20 6V18C20 19.6569 18.6569 21 17 21H12" stroke="#4F8AF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontWeight: 500, fontSize: "14px", lineHeight: "20px", color: "#4F8AF7" }}>Log In</span>
                </Link>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
