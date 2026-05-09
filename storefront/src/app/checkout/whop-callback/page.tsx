"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

function WhopCallbackInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const planId = searchParams.get("plan_id")
    const cartId = searchParams.get("cart_id")

    if (!planId || !cartId) {
      setStatus("error")
      setErrorMsg("Missing payment information.")
      return
    }

    async function verifyAndComplete() {
      try {
        // Verify payment with our API
        const verifyRes = await fetch("/api/checkout/whop-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, cartId }),
        })

        const result = await verifyRes.json()

        if (result.success && result.orderNumber) {
          localStorage.removeItem("medusa_cart_id")
          localStorage.removeItem("checkout_form")
          setStatus("success")
          window.location.href = `/checkout/success?orderNumber=${result.orderNumber}`
        } else if (result.success) {
          localStorage.removeItem("medusa_cart_id")
          localStorage.removeItem("checkout_form")
          setStatus("success")
          window.location.href = "/checkout/success"
        } else {
          setStatus("error")
          setErrorMsg(result.error || "Could not verify your payment. Please contact support.")
        }
      } catch (err) {
        setStatus("error")
        setErrorMsg("Network error verifying payment. Please contact support.")
      }
    }

    verifyAndComplete()
  }, [searchParams, router])

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5">
        <div className="p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm max-w-md text-center">
          {errorMsg}
        </div>
        <a href="/checkout" className="text-[#4F8AF7] hover:underline font-semibold text-sm">
          Back to checkout
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-8 h-8 border-2 border-[#4F8AF7] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#52525B] text-sm">Verifying your payment...</p>
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
