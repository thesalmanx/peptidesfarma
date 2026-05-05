"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber") || ""
  const [stage, setStage] = useState(0)

  // Clear cart on success (card payments don't clear cart before redirect)
  useEffect(() => {
    localStorage.removeItem("medusa_cart_id")
    localStorage.removeItem("checkout_form")
  }, [])

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100)
    const t2 = setTimeout(() => setStage(2), 600)
    const t3 = setTimeout(() => setStage(3), 1100)
    const t4 = setTimeout(() => setStage(4), 1500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 py-16">
      <div
        className="relative w-[64px] h-[64px] rounded-full flex items-center justify-center mb-6 transition-all duration-500 ease-out"
        style={{
          background: stage >= 1 ? "linear-gradient(135deg, #4F8AF7 0%, #4F8AF7 100%)" : "transparent",
          transform: stage >= 1 ? "scale(1)" : "scale(0.3)",
          opacity: stage >= 1 ? 1 : 0,
          boxShadow: stage >= 2 ? "0 8px 40px rgba(17, 92, 111, 0.3), 0 4px 16px rgba(6, 142, 198, 0.2)" : "none",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="transition-all duration-500 ease-out"
          style={{
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 2 ? "scale(1)" : "scale(0.5)",
          }}
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={stage >= 2 ? "animate-draw-check" : ""}
            style={{
              strokeDasharray: 30,
              strokeDashoffset: stage >= 2 ? 0 : 30,
              transition: "stroke-dashoffset 0.6s ease-out 0.1s",
            }}
          />
        </svg>

        {stage >= 2 && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping-slow" style={{ background: "rgba(17, 92, 111, 0.15)" }} />
            <span className="absolute -inset-3 rounded-full animate-ping-slower" style={{ background: "rgba(6, 142, 198, 0.08)" }} />
          </>
        )}
      </div>

      <h1
        className="text-[28px] lg:text-[40px] leading-[36px] lg:leading-[48px] font-bold tracking-[-0.03em] text-[#141414] mb-3 text-center transition-all duration-500 ease-out"
        style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? "translateY(0)" : "translateY(16px)",
        }}
      >
        {orderNumber ? `Order #${orderNumber} Confirmed!` : "Order Placed Successfully!"}
      </h1>

      <p
        className="text-[16px] lg:text-[18px] leading-[24px] lg:leading-[28px] tracking-[-0.01em] text-[#333] mb-3 text-center max-w-[480px] transition-all duration-500 ease-out"
        style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? "translateY(0)" : "translateY(16px)",
          transitionDelay: "100ms",
        }}
      >
        Thank you for your purchase! Your payment has been confirmed. You will receive a confirmation email shortly.
      </p>

      <p
        className="text-[14px] leading-[22px] text-[#242424]/60 mb-8 text-center transition-all duration-500 ease-out"
        style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? "translateY(0)" : "translateY(16px)",
          transitionDelay: "200ms",
        }}
      >
        Check your email inbox for order details and tracking information.
      </p>

      <div
        className="flex flex-col sm:flex-row items-center gap-3 transition-all duration-500 ease-out"
        style={{
          opacity: stage >= 4 ? 1 : 0,
          transform: stage >= 4 ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <Link
          href="/account/orders"
          className="group inline-flex items-center justify-center h-[48px] rounded-[110px] text-[16px] font-bold leading-[24px] tracking-[-0.01em] text-white hover:opacity-90 transition-opacity"
          style={{
            padding: "12px 28px 12px 24px",
            background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)",
          }}
        >
          View My Orders
          <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>
        <Link
          href="/products"
          className="group inline-flex items-center justify-center h-[48px] rounded-[110px] text-[16px] font-bold leading-[24px] tracking-[-0.01em] text-[#242424] bg-[#4F8AF7]/15 hover:bg-[#4F8AF7]/20 transition-colors"
          style={{ padding: "12px 28px 12px 24px" }}
        >
          Continue Shopping
          <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F8AF7]" /></div>}>
      <SuccessContent />
    </Suspense>
  )
}
