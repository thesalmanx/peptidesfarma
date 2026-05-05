"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

export default function HeaderAccountButton() {
  const { isAuthenticated, isLoading, customer } = useAuth()

  if (isLoading) {
    return (
      <div className="w-6 h-6 rounded-full bg-white/20 animate-pulse" />
    )
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/login"
        aria-label="Sign In"
        className="hover:opacity-80 transition-opacity"
      >
        <Image
          src="/icons/user-circle.svg"
          alt="Account"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      </Link>
    )
  }

  const profileImage = (customer?.metadata as Record<string, unknown> | null)?.profile_image as string | undefined
  const firstName = customer?.first_name || ""
  const initials = `${customer?.first_name?.[0]?.toUpperCase() || ""}${customer?.last_name?.[0]?.toUpperCase() || ""}`

  return (
    <Link
      href="/account"
      aria-label="My Account"
      className="flex items-center gap-3 rounded-[14px] hover:opacity-80 transition-opacity"
    >
      <span className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-[#3F3F46]">
        {profileImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-[14px] font-medium">
            {initials || "U"}
          </span>
        )}
      </span>
      {firstName && (
        <p className="text-[14px] font-medium leading-[20px] text-white">
          {firstName}
        </p>
      )}
    </Link>
  )
}
