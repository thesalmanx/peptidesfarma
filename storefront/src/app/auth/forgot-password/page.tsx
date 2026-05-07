"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset link. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-[36px] font-semibold leading-[48px] text-[var(--pf-ink)] mb-2">
        Forgot password?
      </h1>
      <p className="text-[16px] font-normal leading-[24px] text-[var(--pf-ink)] mb-8">
        Enter your email so we can send a reset password link.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success ? (
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
          <h2 className="text-lg font-semibold text-[var(--pf-ink)] mb-2">
            Check your email
          </h2>
          <p className="text-[14px] text-[var(--pf-text-2)] mb-6">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent
            password reset instructions.
          </p>
          <Link
            href="/auth/login"
            className="btn-primary inline-block h-[48px] leading-[48px] px-8 rounded-[110px] text-[16px] font-bold tracking-[-0.01em] text-white hover:opacity-90 transition-opacity"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[14px] font-normal leading-[20px] text-[var(--pf-text-2)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full h-[38px] px-3 rounded-[12px] border-2 border-[var(--pf-line)] text-[14px] text-[var(--pf-ink)] placeholder-[var(--pf-text-3)] focus:outline-none focus:border-[var(--pf-blue)] transition"
              style={{
                filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05))",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-[48px] rounded-[110px] text-[16px] font-bold leading-[24px] tracking-[-0.01em] text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Sending..." : "Reset password"}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-[14px] text-[var(--pf-text-2)]">
        Remember your password?{" "}
        <Link
          href="/auth/login"
          className="text-[var(--pf-blue)] hover:underline font-semibold"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
