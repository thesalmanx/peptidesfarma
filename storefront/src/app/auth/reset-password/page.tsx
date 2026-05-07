"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { sdk } from "@/lib/medusa"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!token) {
      setError("Invalid or missing reset token. Please request a new reset link.")
      return
    }

    setLoading(true)

    try {
      await sdk.auth.updateProvider("customer", "emailpass", { password }, token)
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. The link may have expired."
      )
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-[36px] font-semibold leading-[48px] text-[var(--pf-ink)] mb-4">
          Invalid Reset Link
        </h1>
        <p className="text-[16px] text-[var(--pf-text-2)] mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/auth/forgot-password"
          className="btn-primary inline-block h-[48px] leading-[48px] px-8 rounded-[110px] text-[16px] font-bold tracking-[-0.01em] text-white hover:opacity-90 transition-opacity"
        >
          Request New Link
        </Link>
      </div>
    )
  }

  if (success) {
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
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[var(--pf-ink)] mb-2">
          Password Reset Successfully
        </h2>
        <p className="text-[14px] text-[var(--pf-text-2)] mb-6">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Link
          href="/auth/login"
          className="btn-primary inline-block h-[48px] leading-[48px] px-8 rounded-[110px] text-[16px] font-bold tracking-[-0.01em] text-white hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-[36px] font-semibold leading-[48px] text-[var(--pf-ink)] mb-2">
        Reset password
      </h1>
      <p className="text-[16px] font-normal leading-[24px] text-[var(--pf-ink)] mb-8">
        {email ? `Enter a new password for ${email}` : "Enter your new password below."}
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-[14px] font-normal leading-[20px] text-[var(--pf-text-2)]"
          >
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            minLength={8}
            className="w-full h-[38px] px-3 rounded-[12px] border-2 border-[var(--pf-line)] text-[14px] text-[var(--pf-ink)] placeholder-[var(--pf-text-3)] focus:outline-none focus:border-[var(--pf-blue)] transition"
            style={{
              filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05))",
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-[14px] font-normal leading-[20px] text-[var(--pf-text-2)]"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={8}
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
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="text-center">
        <p className="text-[16px] text-[var(--pf-text-2)]">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
