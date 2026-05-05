"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://admin.peptidesfarma.com"

function QuikliePayInner() {
  const searchParams = useSearchParams()
  const [iframeLoading, setIframeLoading] = useState(true)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [completingOrder, setCompletingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const quikleeUrl = searchParams.get("url") || ""
  const paymentId = searchParams.get("paymentId") || ""
  const amount = searchParams.get("amount") || "0"
  const cartId = searchParams.get("cartId") || ""

  const cartData = typeof sessionStorage !== "undefined"
    ? sessionStorage.getItem("quiklie_cart_data") || ""
    : ""

  useEffect(() => {
    if (!paymentId || !cartData) return
    let attempts = 0
    pollRef.current = setInterval(async () => {
      attempts++
      if (attempts > 60) {
        if (pollRef.current) clearInterval(pollRef.current)
        setError("Payment timed out. If you were charged, please contact support.")
        return
      }
      try {
        const res = await fetch(`${MEDUSA_BACKEND_URL}/hooks/quiklie-callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartData, paymentId, status: "SUCCESS", statusCode: "1" }),
        })
        const result = await res.json()
        if (result?.success && result?.orderNumber) {
          if (pollRef.current) clearInterval(pollRef.current)
          setPaymentComplete(true)
          setCompletingOrder(false)
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.removeItem("quiklie_cart_data")
            sessionStorage.removeItem("quiklie_payment_id")
            sessionStorage.removeItem("quiklie_tx_ref")
          }
          setTimeout(() => {
            window.location.href = `/checkout/success?orderNumber=${result.orderNumber}`
          }, 1500)
        }
      } catch {}
    }, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [paymentId, cartData])

  if (!quikleeUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center max-w-md px-6">
          <h1 className="text-[22px] font-bold text-[#242424] mb-3">Invalid Payment Link</h1>
          <p className="text-[14px] text-[#555] mb-6">This payment session has expired. Please return to checkout.</p>
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center h-[48px] px-8 rounded-[110px] text-[15px] font-bold text-white hover:opacity-90"
            style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
          >
            Return to Checkout
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Minimal header — no logo, just secure badge + amount + back link */}
      <div className="bg-white border-b border-[#242424]/8">
        <div className="max-w-[1100px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" strokeWidth="1.5"/>
                <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#242424]">Secure Checkout</p>
              <p className="text-[11px] text-[#888]">256-bit SSL encrypted</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[20px] font-bold text-[#242424]">${parseFloat(amount).toFixed(2)}</span>
            <Link href="/checkout" className="text-[13px] text-[#4F8AF7] font-semibold hover:underline">
              Cancel
            </Link>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        {paymentComplete ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[20px] font-bold text-[#242424]">Payment Successful!</p>
            <p className="text-[14px] text-[#888]">Redirecting to your order confirmation...</p>
          </div>

        ) : completingOrder ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <svg className="w-10 h-10 animate-spin text-[#4F8AF7]" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20"/>
            </svg>
            <p className="text-[17px] font-semibold text-[#242424]">Completing your order...</p>
            <p className="text-[13px] text-[#888]">Please don&apos;t close this page.</p>
          </div>

        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 px-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[17px] font-bold text-[#242424]">Payment Issue</p>
            <p className="text-[14px] text-[#555] text-center">{error}</p>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center h-[48px] px-8 rounded-[110px] text-[15px] font-bold text-white hover:opacity-90 mt-2"
              style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
            >
              Return to Checkout
            </Link>
          </div>

        ) : (
          <>
            {iframeLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <svg className="w-8 h-8 animate-spin text-[#4F8AF7]" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20"/>
                </svg>
                <p className="text-[14px] text-[#555]">Loading secure payment form...</p>
              </div>
            )}

            {/* Full-width iframe — no max-width constraint so Quiklie can use its own layout */}
            <iframe
              src={quikleeUrl}
              className="w-full flex-1 border-0"
              style={{
                minHeight: "calc(100vh - 60px)",
                display: iframeLoading ? "none" : "block",
              }}
              onLoad={() => setIframeLoading(false)}
              allow="payment"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            />
          </>
        )}
      </div>
    </div>
  )
}

export default function QuikliePayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <svg className="w-8 h-8 animate-spin text-[#4F8AF7]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20"/>
        </svg>
      </div>
    }>
      <QuikliePayInner />
    </Suspense>
  )
}
