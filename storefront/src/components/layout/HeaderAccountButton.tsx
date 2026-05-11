"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

export default function HeaderAccountButton() {
  const { isAuthenticated, isLoading, customer } = useAuth()

  if (isLoading) {
    return <div className="w-6 h-6 rounded-full animate-pulse" style={{ background: "var(--pf-line)" }} />
  }

  if (!isAuthenticated) {
    return (
      <Link href="/auth/login" aria-label="Sign In" className="hover:opacity-80 transition-opacity" style={{ color: "var(--pf-ink)" }}>
        <Image src="/icons/user-circle.svg" alt="Account" width={24} height={24} className="w-6 h-6" />
      </Link>
    )
  }

  const profileImage = (customer?.metadata as Record<string, unknown> | null)?.profile_image as string | undefined
  const firstName = customer?.first_name || ""
  const initials = `${customer?.first_name?.[0]?.toUpperCase() || ""}${customer?.last_name?.[0]?.toUpperCase() || ""}`

  return (
    <Link href="/account" aria-label="My Account" className="flex items-center gap-3 rounded-[14px] hover:opacity-80 transition-opacity">
      <span className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: "var(--pf-blue-tint)" }}>
        {profileImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-[14px] font-medium" style={{ color: "var(--pf-ink)" }}>{initials || "U"}</span>
        )}
      </span>
      {firstName && (
        <p className="text-[14px] font-medium leading-[20px] hidden lg:block" style={{ color: "var(--pf-ink)" }}>{firstName}</p>
      )}
    </Link>
  )
}
