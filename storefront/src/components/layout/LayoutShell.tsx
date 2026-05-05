"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), { ssr: false })
const EmailCapturePopup = dynamic(() => import("@/components/EmailCapturePopup"), { ssr: false })

export default function LayoutShell({
  children,
  header,
  footer,
}: {
  children: React.ReactNode
  header: React.ReactNode
  footer: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuth = pathname.startsWith("/auth")
  const isHome = pathname === "/"
  const isProduct = pathname.startsWith("/product-page/")
  const isCheckout = pathname.startsWith("/checkout")

  useEffect(() => {
    // Dark background for overscroll on dark pages
    if (isHome || isProduct) {
      document.body.style.backgroundColor = "#08122A"
    } else {
      document.body.style.backgroundColor = "#F6F7FB"
    }

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute("content", isHome || isProduct ? "#08122A" : "#F6F7FB")
    }

    return () => {
      document.body.style.backgroundColor = ""
    }
  }, [isHome, isProduct])

  return (
    <>
      {/* Fixed bottom cover for dark pages */}
      {(isHome || isProduct) && (
        <div
          aria-hidden="true"
          className="fixed bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "calc(50px + env(safe-area-inset-bottom, 0px))",
            background: "#0E1A33",
            zIndex: -1,
          }}
        />
      )}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-[#4F8AF7] focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      {header}
      <CartDrawer />
      <EmailCapturePopup />
      {isAuth ? (
        children
      ) : (
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
      )}
      {!isAuth && !isCheckout && footer}
    </>
  )
}
