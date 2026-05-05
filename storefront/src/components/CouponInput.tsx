"use client"

import { useState, useEffect } from "react"

interface CouponInputProps {
  cartId: string
  onApplied: () => void
  initialCode?: string | null
}

export default function CouponInput({ cartId, onApplied, initialCode }: CouponInputProps) {
  const [code, setCode] = useState("")
  const [appliedCode, setAppliedCode] = useState<string | null>(initialCode || null)

  // Sync applied code when cart data changes (e.g. navigating between pages)
  useEffect(() => {
    if (initialCode) {
      setAppliedCode(initialCode)
    } else if (initialCode === null && appliedCode) {
      // Cart no longer has a promo — clear local state
      setAppliedCode(null)
    }
  }, [initialCode])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleApply = async () => {
    const trimmed = code.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/cart/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id: cartId, code: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid or expired promo code")
        return
      }

      setAppliedCode(trimmed.toUpperCase())
      setCode("")
      setError(null)
      onApplied()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!appliedCode) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        cart_id: cartId,
        code: appliedCode,
      })

      const res = await fetch(`/api/cart/promo?${params.toString()}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to remove promo code")
        return
      }

      setAppliedCode(null)
      setCode("")
      setError(null)
      onApplied()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleApply()
    }
  }

  if (appliedCode) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 h-[40px] px-3 rounded-[12px] border border-green-200 bg-green-50">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M13.333 4L6 11.333 2.667 8"
                stroke="#16a34a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[13px] font-medium text-green-700">
              {appliedCode}
            </span>
            <span className="text-[12px] text-green-600">applied</span>
          </div>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="h-[40px] px-4 rounded-[12px] border border-[#242424]/8 text-[13px] font-semibold text-[#242424]/60 hover:text-[#242424] hover:border-[#242424]/20 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="opacity-75"
                />
              </svg>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Promo code"
          disabled={loading}
          className="flex-1 w-full h-[40px] px-3 text-[14px] rounded-[12px] border border-[#242424]/8 bg-[#242424]/4 outline-none placeholder:text-[#242424]/40 disabled:opacity-50"
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="h-[40px] px-4 rounded-[12px] bg-[#4F8AF7] text-white text-[13px] font-semibold hover:bg-[#3B6FD9] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[72px]"
        >
          {loading ? (
            <svg
              className="animate-spin h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-25"
              />
              <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-75"
              />
            </svg>
          ) : (
            "Apply"
          )}
        </button>
      </div>
      {error && (
        <p className="text-[12px] text-red-500 px-1">{error}</p>
      )}
    </div>
  )
}
