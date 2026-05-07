"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

export const dynamic = "force-dynamic"

function safeRedirect(raw: string | null): string {
  if (!raw) return "/account"
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/account"
  return raw
}

function SignupPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirect(searchParams.get("redirect"))
  const { register, loginWithGoogle, loginWithApple } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions")
      return
    }

    setLoading(true)

    try {
      await register({
        email,
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        marketingConsent,
      })
      router.push(redirectTo)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1
        className="text-[36px] font-bold leading-[44px] tracking-[-0.03em] text-[var(--pf-ink)] mb-2"
      >
        Sign Up
      </h1>
      <p className="text-[16px] font-normal leading-[24px] text-[var(--pf-text-2)] mb-8">
        Create your account to get started
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row gap-5 md:gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label
              htmlFor="firstName"
              className="text-[14px] font-medium leading-[20px] text-[var(--pf-text-2)]"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
              className="w-full h-[48px] px-4 rounded-[12px] border-2 border-[var(--pf-line)] text-[16px] text-[var(--pf-ink)] placeholder-[var(--pf-text-3)] focus:outline-none focus:border-[var(--pf-blue)] transition"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label
              htmlFor="lastName"
              className="text-[14px] font-medium leading-[20px] text-[var(--pf-text-2)]"
            >
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
              className="w-full h-[48px] px-4 rounded-[12px] border-2 border-[var(--pf-line)] text-[16px] text-[var(--pf-ink)] placeholder-[var(--pf-text-3)] focus:outline-none focus:border-[var(--pf-blue)] transition"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[14px] font-medium leading-[20px] text-[var(--pf-text-2)]"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full h-[48px] px-4 rounded-[12px] border-2 border-[var(--pf-line)] text-[16px] text-[var(--pf-ink)] placeholder-[var(--pf-text-3)] focus:outline-none focus:border-[var(--pf-blue)] transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-[14px] font-medium leading-[20px] text-[var(--pf-text-2)]"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="w-full h-[48px] px-4 pr-12 rounded-[12px] border-2 border-[var(--pf-line)] text-[16px] text-[var(--pf-ink)] placeholder-[var(--pf-text-3)] focus:outline-none focus:border-[var(--pf-blue)] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-3)] hover:text-[var(--pf-ink)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                {showPassword ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                ) : (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-[14px] font-medium leading-[20px] text-[var(--pf-text-2)]"
          >
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full h-[48px] px-4 pr-12 rounded-[12px] border-2 border-[var(--pf-line)] text-[16px] text-[var(--pf-ink)] placeholder-[var(--pf-text-3)] focus:outline-none focus:border-[var(--pf-blue)] transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-3)] hover:text-[var(--pf-ink)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                {showConfirmPassword ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                ) : (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-[18px] h-[18px] mt-0.5 rounded-[4px] border-2 border-[var(--pf-line)] text-[var(--pf-blue)] focus:ring-[var(--pf-blue)] cursor-pointer"
          />
          <span className="text-[14px] leading-[20px] text-[var(--pf-text-2)]">
            I agree to the{" "}
            <Link href="#" className="text-[var(--pf-blue)] hover:underline font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-[var(--pf-blue)] hover:underline font-medium">
              Privacy Policy
            </Link>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="w-[18px] h-[18px] mt-0.5 rounded-[4px] border-2 border-[var(--pf-line)] text-[var(--pf-blue)] focus:ring-[var(--pf-blue)] cursor-pointer"
          />
          <span className="text-[14px] leading-[20px] text-[var(--pf-text-2)]">
            Send me research updates, new product alerts, and exclusive offers from Peptidesfarma. Unsubscribe anytime.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full h-[52px] rounded-[110px] text-[16px] font-semibold leading-[24px] tracking-[-0.01em] text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--pf-line)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-[14px] font-medium text-[var(--pf-text-3)]">
            OR
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          aria-label="Sign up with Google"
          className="w-full h-[48px] flex items-center justify-center gap-3 rounded-[99px] border border-[var(--pf-line)] text-[16px] font-medium text-[var(--pf-ink)] hover:bg-gray-50 transition cursor-pointer"
        >
          <Image src="/icons/social/google.svg" alt="" width={24} height={24} />
          Sign up with Google
        </button>
        <button
          type="button"
          onClick={() => loginWithApple()}
          aria-label="Sign up with Apple"
          className="w-full h-[48px] flex items-center justify-center gap-3 rounded-[99px] border border-[var(--pf-line)] text-[16px] font-medium text-[var(--pf-ink)] hover:bg-gray-50 transition cursor-pointer"
        >
          <Image src="/icons/social/apple.svg" alt="" width={24} height={24} />
          Sign up with Apple
        </button>
      </div>

      <p className="mt-8 text-center text-[14px] text-[var(--pf-text-2)]">
        Already have an account?{" "}
        <Link
          href={redirectTo !== "/account" ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : "/auth/login"}
          className="text-[var(--pf-blue)] hover:underline font-semibold"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="h-[48px]" aria-busy="true" />}>
      <SignupPageInner />
    </Suspense>
  )
}
