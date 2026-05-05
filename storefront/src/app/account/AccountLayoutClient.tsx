"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Profile", href: "/account/profile" },
  { label: "Wishlist", href: "/account/wishlist" },
]

export default function AccountLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { customer, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push("/auth/login?redirect=/account")
    }
  }, [customer, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--pf-blue)] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!customer) return null

  return (
    <div className="min-h-screen bg-[var(--pf-paper)]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight mb-8" style={{ color: "var(--pf-ink)" }}>
          My Account
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
          <aside>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/account" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: active ? "var(--pf-blue)" : "transparent",
                      color: active ? "#fff" : "var(--pf-text-2)",
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--pf-line)" }}>
              <p className="text-xs" style={{ color: "var(--pf-text-3)" }}>
                {customer.first_name} {customer.last_name}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--pf-text-3)" }}>
                {customer.email}
              </p>
            </div>
          </aside>
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
