"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || "PLACEHOLDER"

export default function IntercomMessenger() {
  const { customer, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const loaded = useRef(false)

  const isContactPage = pathname === "/contact" || pathname === "/contact/"

  useEffect(() => {
    const w = window as typeof window & { Intercom?: (...args: unknown[]) => void }

    // Leaving the contact page: auto-hide the messenger if it's open
    if (!isContactPage) {
      if (w.Intercom) w.Intercom("hide")
    }

    const showOnContact = () => {
      if (!isContactPage) return
      if (w.Intercom) w.Intercom("show")
    }

    const loadIntercom = () => {
      if (loaded.current) {
        showOnContact()
        return
      }
      loaded.current = true

      window.removeEventListener("scroll", loadIntercom)
      window.removeEventListener("click", loadIntercom)
      window.removeEventListener("touchstart", loadIntercom)

      import("@intercom/messenger-js-sdk").then(({ default: IntercomSDK }) => {
        if (isAuthenticated && customer) {
          IntercomSDK({
            app_id: APP_ID,
            name: [customer.first_name, customer.last_name].filter(Boolean).join(" "),
            email: customer.email || undefined,
          })
        } else {
          IntercomSDK({ app_id: APP_ID })
        }

        if (w.Intercom) {
          w.Intercom("onShow", () => document.body.classList.add("intercom-open"))
          w.Intercom("onHide", () => document.body.classList.remove("intercom-open"))
        }

        showOnContact()
      })
    }

    // On the contact page, load immediately and auto-open the messenger
    if (isContactPage) {
      loadIntercom()
      return
    }

    // Otherwise defer until 5s idle OR first interaction
    const timer = setTimeout(loadIntercom, 5000)
    window.addEventListener("scroll", loadIntercom, { once: true, passive: true })
    window.addEventListener("click", loadIntercom, { once: true })
    window.addEventListener("touchstart", loadIntercom, { once: true, passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", loadIntercom)
      window.removeEventListener("click", loadIntercom)
      window.removeEventListener("touchstart", loadIntercom)
    }
  }, [isAuthenticated, customer, pathname, isContactPage])

  return null
}
