"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

const StarryBackground = dynamic(() => import("@/components/StarryBackground"), { ssr: false })
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), { ssr: false })
const EmailCapturePopup = dynamic(() => import("@/components/EmailCapturePopup"), { ssr: false })

export default function LayoutShell({
  children,
  header,
  newsletter,
  footer,
}: {
  children: React.ReactNode
  header: React.ReactNode
  newsletter: React.ReactNode
  footer: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuth = pathname.startsWith("/auth")
  const isHome = pathname === "/"
  const isProduct = pathname.startsWith("/product-page/")
  const isAccount = pathname.startsWith("/account")
  const isCheckout = pathname.startsWith("/checkout")
  const isCart = pathname === "/cart"
  const isTrack = pathname.startsWith("/track")
  const hideNewsletter = isAuth || isAccount || isCheckout || isCart || isTrack

  useEffect(() => {
    // iOS Safari uses body bg for the overscroll rubber-band area.
    // Must match the top edge of the page so overscroll looks seamless.
    if (isHome) {
      document.body.style.backgroundColor = "#0A1430"
    } else if (isProduct) {
      document.body.style.backgroundColor = "#0A1430"
    } else {
      document.body.style.backgroundColor = "#ffffff"
    }

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute("content", isHome || isProduct ? "#14213D" : "#ffffff")
    }

    return () => {
      document.body.style.backgroundColor = ""
    }
  }, [isHome, isProduct])

  const above = isHome ? "relative z-[1]" : ""

  return (
    <>
      {isHome && <StarryBackground />}
      {/* Fixed bottom cover: matches footer color, visible during mobile toolbar
          show/hide resize. z-[-1] keeps it behind the StarryBackground canvas. */}
      {(isHome || isProduct) && (
        <div
          aria-hidden="true"
          className="fixed bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "calc(50px + env(safe-area-inset-bottom, 0px))",
            background: "#14213D",
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
      <div className={isHome ? "relative z-[60]" : ""}>{header}</div>
      <CartDrawer />
      <EmailCapturePopup />
      {isAuth ? (
        children
      ) : (
        <main id="main-content" className={`min-h-screen ${above} ${isHome ? "starry-light" : ""}`}>
          {children}
          {isHome && newsletter}
        </main>
      )}
      {!hideNewsletter && !isHome && <div className={above}>{newsletter}</div>}
      {!isAuth && (
        <div
          className={above}
          style={isHome ? {
            background: "radial-gradient(105.38% 309.82% at 100% 50%, #3D94B5 0%, #14213D 100%)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          } : undefined}
        >
          {footer}
        </div>
      )}
    </>
  )
}
