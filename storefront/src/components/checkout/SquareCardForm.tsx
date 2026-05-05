"use client"

import { useState, useEffect, useRef, useCallback } from "react"

const SQUARE_APP_ID = (process.env.NEXT_PUBLIC_SQUARE_APP_ID || "sq0idp-gLco79rFb-6GoaQx0dE3RA").trim()
const SQUARE_LOCATION_ID = (process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "LSZVSRT2ZF5VS").trim()
const SQUARE_SDK_URL = "https://web.squarecdn.com/v1/square.js"

interface SquareCardFormProps {
  amount: number
  onPaymentComplete: (sourceId: string) => void
  onError: (error: string) => void
  disabled?: boolean
}

export default function SquareCardForm({
  amount,
  onPaymentComplete,
  onError,
  disabled = false,
}: SquareCardFormProps) {
  const [sdkReady, setSdkReady] = useState(false)
  const [cardReady, setCardReady] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const cardRef = useRef<any>(null)
  const paymentsRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initCalledRef = useRef(false)

  // Load the Square Web Payments SDK script
  useEffect(() => {
    if ((window as any).Square) {
      setSdkReady(true)
      return
    }

    const existing = document.querySelector(
      `script[src="${SQUARE_SDK_URL}"]`
    )
    if (existing) {
      existing.addEventListener("load", () => setSdkReady(true))
      return
    }

    const script = document.createElement("script")
    script.src = SQUARE_SDK_URL
    script.async = true
    script.onload = () => setSdkReady(true)
    script.onerror = () => {
      setLoadError("Failed to load payment SDK. Please refresh and try again.")
    }
    document.head.appendChild(script)
  }, [])

  // Initialize the card payment method once SDK is loaded
  useEffect(() => {
    if (!sdkReady || initCalledRef.current) return
    initCalledRef.current = true

    const initCard = async () => {
      try {
        const Square = (window as any).Square
        if (!Square) {
          setLoadError("Payment SDK not available. Please refresh the page.")
          return
        }

        // Initialize with both app ID and location ID — Square SDK needs both
        const appId = SQUARE_APP_ID || "sandbox-sq0idb-_G0Zf7WjvZvOXLRst4Owhw"
        const locId = SQUARE_LOCATION_ID || "LSZVSRT2ZF5VS"
        const payments = await Square.payments(appId, locId)
        paymentsRef.current = payments

        const card = await payments.card()
        cardRef.current = card

        if (containerRef.current) {
          await card.attach(containerRef.current)
          setCardReady(true)
        }
      } catch (err: any) {
        console.error("Square card init error:", err)
        setLoadError(
          err?.message || "Failed to initialize payment form. Please refresh."
        )
      }
    }

    initCard()

    return () => {
      if (cardRef.current) {
        try {
          cardRef.current.destroy()
        } catch {
          // ignore cleanup errors
        }
        cardRef.current = null
      }
      initCalledRef.current = false
    }
  }, [sdkReady])

  const handlePay = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!cardRef.current || processing || disabled) return

      setProcessing(true)
      try {
        const result = await cardRef.current.tokenize()
        if (result.status === "OK") {
          onPaymentComplete(result.token)
        } else {
          const errorMessage =
            result.errors
              ?.map((err: any) => err.message)
              .join(", ") || "Payment failed. Please check your card details."
          onError(errorMessage)
        }
      } catch (err: any) {
        console.error("Tokenize error:", err)
        onError(err?.message || "Payment processing failed. Please try again.")
      } finally {
        setProcessing(false)
      }
    },
    [processing, disabled, onPaymentComplete, onError]
  )

  const formattedAmount = (amount / 100).toFixed(2)

  // Loading state while SDK initializes
  if (loadError) {
    return (
      <div className="rounded-[16px] border border-[#242424]/8 p-5">
        <div className="flex items-center gap-2 text-red-600 text-[14px]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 4.5v4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="11" r="0.75" fill="currentColor" />
          </svg>
          <span>{loadError}</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-4">
      <div className="rounded-[16px] border border-[#242424]/8 p-5">
        {/* Card input container */}
        {!cardReady && (
          <div className="flex items-center justify-center h-[48px] gap-2 text-[14px] text-[#383637]/72">
            <svg
              className="animate-spin h-5 w-5 text-[#2A4A8C]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading payment form...</span>
          </div>
        )}
        <div
          ref={containerRef}
          id="square-card-container"
          style={{ minHeight: cardReady ? undefined : 0, opacity: cardReady ? 1 : 0 }}
        />
      </div>

      <button
        type="submit"
        disabled={!cardReady || processing || disabled}
        className="w-full h-[52px] rounded-[110px] text-white font-bold text-[16px] leading-[24px] transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background:
            "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)",
        }}
      >
        {processing ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <span>Pay ${formattedAmount}</span>
        )}
      </button>
    </form>
  )
}
