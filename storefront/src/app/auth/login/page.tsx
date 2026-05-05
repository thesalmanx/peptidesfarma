"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

// Only honor same-origin relative paths to prevent open-redirect abuse
function sanitizeRedirect(raw: string | null): string {
  if (!raw) return "/account"
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/account"
  return raw
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = sanitizeRedirect(searchParams.get("redirect"))
  const { login, loginWithGoogle, loginWithApple } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      router.push(redirectTo)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ gap: "40px" }}>
      <div>
        <h1 className="text-[36px] font-semibold leading-[48px] text-[#383637]">
          Login
        </h1>
        {error && (
          <div className="mt-2 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col">
          <label htmlFor="email" className="text-[14px] font-normal leading-[20px] text-[#52525B] pb-3">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full h-[38px] px-3 rounded-[12px] border-2 border-[#E4E4E7] text-[14px] text-[#141414] placeholder-[#71717A] focus:outline-none focus:border-[#4F8AF7] transition"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05))" }}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="text-[14px] font-normal leading-[20px] text-[#52525B] pb-3">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full h-[38px] px-3 pr-10 rounded-[12px] border-2 border-[#E4E4E7] text-[14px] text-[#141414] placeholder-[#71717A] focus:outline-none focus:border-[#4F8AF7] transition"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05))" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#52525B]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[22px] h-[22px]">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-[6px] border-2 border-[#D4D4D8] text-[#006FEE] focus:ring-[#006FEE] cursor-pointer"
            />
            <span className="text-[14px] font-normal leading-[20px] text-[#3F3F46]">Remember me</span>
          </label>
          <Link href="/auth/forgot-password" className="text-[14px] font-medium leading-[20px] text-[#71717A] hover:underline">
            Forgot password?
          </Link>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          form="login-form"
          disabled={loading}
          className="btn-primary w-full h-[48px] rounded-[110px] text-[16px] font-bold leading-[24px] tracking-[-0.01em] text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#ECECEC]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[10px] font-medium leading-[16px] text-[#AFAFAF]">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loginWithGoogle()}
          aria-label="Sign in with Google"
          className="w-full h-[52px] flex items-center justify-center gap-3 rounded-[99px] border border-[#DADADA] text-[18px] font-semibold leading-[28px] tracking-[-0.02em] text-[#595959] hover:bg-gray-50 transition cursor-pointer"
        >
          <Image src="/icons/social/google.svg" alt="" width={24} height={24} />
          Sign in with Google
        </button>
        <button
          type="button"
          onClick={() => loginWithApple()}
          aria-label="Sign in with Apple"
          className="w-full h-[52px] flex items-center justify-center gap-3 rounded-[99px] border border-[#DADADA] text-[18px] font-semibold leading-[28px] tracking-[-0.02em] text-[#595959] hover:bg-gray-50 transition cursor-pointer"
        >
          <Image src="/icons/social/apple.svg" alt="" width={24} height={24} />
          Sign in with Apple
        </button>
      </div>

      <p className="text-center text-[16px] leading-[24px] text-[#383637]">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-[#4F8AF7] hover:underline font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  )
}
