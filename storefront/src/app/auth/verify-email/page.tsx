"use client"

import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 text-green-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
          />
        </svg>
      </div>
      <h1 className="text-[36px] font-semibold leading-[48px] text-[#383637] mb-2">
        Account Created!
      </h1>
      <p className="text-[16px] font-normal leading-[24px] text-[#52525B] mb-6">
        Your account has been created successfully. Check your email for a welcome message from Peptidesfarma.
      </p>
      <Link
        href="/account"
        className="btn-primary inline-block h-[48px] leading-[48px] px-8 rounded-[110px] text-[16px] font-bold tracking-[-0.01em] text-white hover:opacity-90 transition-opacity"
      >
        Go to My Account
      </Link>
      <p className="mt-6 text-center text-[14px] text-[#52525B]">
        Or{" "}
        <Link
          href="/"
          className="text-[#4F8AF7] hover:underline font-semibold"
        >
          continue shopping
        </Link>
      </p>
    </div>
  )
}
