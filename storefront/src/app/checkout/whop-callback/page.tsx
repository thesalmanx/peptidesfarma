"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"

function WhopCallbackInner() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")
  const verifyingRef = useRef(false)

  useEffect(() => {
    if (verifyingRef.current) return
    verifyingRef.current = true

    // Whop may pass plan_id or planId depending on redirect configuration
    const planId = searchParams.get("plan_id") || searchParams.get("planId") || ""
    const cartId = searchParams.get("cart_id") || searchParams.get("cartId") || ""

    if (!planId || !cartId) {
      setStatus("error")
      setErrorMsg("Missing payment information. Please contact support.")
      return
    }

    async function verifyAndComplete() {
      // Retry up to 3 times with increasing delay (Whop webhook may need a moment)
      const MAX_RETRIES = 3
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const verifyRes = await fetch("/api/checkout/whop-verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId, cartId }),
          })

          const result = await verifyRes.json()

          if (result.success) {
            // Clear cart
            try {
              localStorage.removeItem("medusa_cart_id")
              localStorage.removeItem("checkout_form")
              sessionStorage.removeItem("whop_checkout_data")
            } catch {}

            setStatus("success")
            const orderNum = result.orderNumber
            window.location.href = orderNum
              ? `/checkout/success?orderNumber=${orderNum}`
              : "/checkout/success"
            return
          }

          // If payment not confirmed yet and we have retries left, wait and retry
          if (verifyRes.status === 402 && attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, 2000 * attempt))
            continue
          }

          setStatus("error")
          setErrorMsg(result.error || "Could not verify your payment. Please contact support.")
          return
        } catch (err) {
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, 2000 * attempt))
            continue
          }
          setStatus("error")
          setErrorMsg("Network error verifying payment. Please contact support.")
          return
        }
      }
    }

    verifyAndComplete()
  }, [searchParams])

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-[22px] font-bold text-[#242424]">Payment Issue</h2>
        <p className="text-[15px] text-[#555] text-center max-w-md">{errorMsg}</p>
        <div className="flex flex-col gap-2 items-center mt-2">
          <a href="/checkout" className="inline-flex items-center justify-center h-[48px] px-8 rounded-[110px] text-[16px] font-bold text-white hover:opacity-90" style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}>
            Return to Checkout
          </a>
          <a href="mailto:support@peptidesfarma.com" className="text-[13px] text-[#888] hover:text-[#555] underline">
            Contact Support
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-8 h-8 border-2 border-[#4F8AF7] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#52525B] text-sm">Verifying your payment...</p>
      <p className="text-[#999] text-xs">Please don&apos;t close this page.</p>
    </div>
  )
}

export default function WhopCallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[#4F8AF7] border-t-transparent rounded-full animate-spin" /></div>}>
      <WhopCallbackInner />
    </Suspense>
  )
}
