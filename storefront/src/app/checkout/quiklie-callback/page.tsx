"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://admin.peptidesfarma.com"

function QuiklieCallbackInner() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [orderNumber, setOrderNumber] = useState<string>("")
  const completingRef = useRef(false)

  // The 3DS bank window opens inside an iframe. After verification it
  // redirects to this callback URL inside that same iframe. Break out to the
  // top window so the customer sees the real thank-you page in their main
  // browser tab, not nested in the bank's frame.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.self !== window.top && window.top) {
      try {
        window.top.location.href = window.location.href
      } catch {
        // Cross-origin protection; nothing else to do.
      }
    }
  }, [])

  useEffect(() => {
    if (completingRef.current) return
    completingRef.current = true

    const completeOrder = async () => {
      try {
        // Get cartData from sessionStorage (stored before redirect to Quiklie)
        const cartData = typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem("quiklie_cart_data") || ""
          : ""
        const paymentId = typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem("quiklie_payment_id") || ""
          : ""

        // Also check URL params (Quiklie may append these)
        const urlPaymentId = searchParams.get("paymentId") || searchParams.get("qkpaymentId") || ""
        const urlStatus = searchParams.get("status") || ""
        const urlStatusCode = searchParams.get("statusCode") || ""
        const urlTransactionId = searchParams.get("transactionId") || ""
        const cartId = searchParams.get("cartId") || ""

        const effectivePaymentId = paymentId || urlPaymentId

        if (!cartData && !cartId) {
          setStatus("error")
          setErrorMsg("Payment session expired. Please return to checkout and try again.")
          return
        }

        // Call backend to complete the order
        const res = await fetch(`${MEDUSA_BACKEND_URL}/hooks/quiklie-callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartData: cartData || "",
            paymentId: effectivePaymentId,
            transactionId: urlTransactionId,
            amount: searchParams.get("amount") || "",
            status: urlStatus,
            statusCode: urlStatusCode,
          }),
        })

        const result = await res.json()

        if (!res.ok) {
          setStatus("error")
          setErrorMsg(result?.message || result?.error || "Your payment could not be verified. Please contact support.")
          return
        }

        if (result?.orderNumber) {
          // Clean up sessionStorage
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.removeItem("quiklie_cart_data")
            sessionStorage.removeItem("quiklie_payment_id")
            sessionStorage.removeItem("quiklie_tx_ref")
            // Backfill orderNumber onto the receipt the QuikliePaymentForm
            // stashed before the 3DS bank round-trip.
            try {
              const raw = sessionStorage.getItem("peptidesfarma_last_order_summary")
              if (raw) {
                const parsed = JSON.parse(raw)
                parsed.orderNumber = String(result.orderNumber)
                sessionStorage.setItem("peptidesfarma_last_order_summary", JSON.stringify(parsed))
              }
            } catch {}
          }
          setOrderNumber(result.orderNumber)
          setStatus("success")
          // Redirect to success page
          window.location.href = `/checkout/success?orderNumber=${result.orderNumber}`
        } else if (result?.success) {
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.removeItem("quiklie_cart_data")
            sessionStorage.removeItem("quiklie_payment_id")
            sessionStorage.removeItem("quiklie_tx_ref")
          }
          setStatus("success")
          window.location.href = "/checkout/success"
        } else {
          setStatus("error")
          setErrorMsg("Something went wrong completing your order. Please contact support.")
        }
      } catch (err: any) {
        setStatus("error")
        setErrorMsg("A network error occurred. Please check your connection and contact support if the issue persists.")
      }
    }

    completeOrder()
  }, [searchParams])

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4F8AF7]" />
        <p className="text-[16px] text-[#555]">Completing your order...</p>
        <p className="text-[13px] text-[#888]">Please don&apos;t close this page.</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-[22px] font-bold text-[#242424]">Payment Issue</h2>
        <p className="text-[15px] text-[#555] text-center max-w-md">{errorMsg}</p>
        <div className="flex flex-col gap-2 items-center mt-2">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center h-[48px] px-8 rounded-[110px] text-[16px] font-bold text-white hover:opacity-90"
            style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
          >
            Return to Checkout
          </Link>
          <a href="mailto:support@peptidesfarma.com" className="text-[13px] text-[#888] hover:text-[#555] underline">
            Contact Support
          </a>
        </div>
      </div>
    )
  }

  // Success — redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-[16px] text-[#555]">Order confirmed! Redirecting...</p>
    </div>
  )
}

export default function QuiklieCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4F8AF7]" />
        <p className="text-[16px] text-[#555]">Loading...</p>
      </div>
    }>
      <QuiklieCallbackInner />
    </Suspense>
  )
}
