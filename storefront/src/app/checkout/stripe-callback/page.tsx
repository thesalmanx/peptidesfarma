"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { sdk } from "@/lib/medusa"

function StripeCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const completingRef = useRef(false)

  useEffect(() => {
    // //console.log("[stripe-callback] useEffect fired, completingRef:", completingRef.current)
    if (completingRef.current) return
    completingRef.current = true

    const sessionId = searchParams.get("session_id")
    const cartId = searchParams.get("cart_id")
    // //console.log("[stripe-callback] sessionId:", sessionId, "cartId:", cartId)

    if (!sessionId || !cartId) {
      setError("Missing payment information. Please contact support.")
      return
    }

    completeOrder(cartId, sessionId)
  }, [searchParams])

  async function completeOrder(cartId: string, sessionId: string) {
    try {
      // //console.log("[stripe-callback] Starting order completion", { cartId, sessionId })

      // Verify Stripe session is actually paid before completing order
      try {
        // //console.log("[stripe-callback] Verifying Stripe session...")
        const verifyRes = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })
        const verifyData = await verifyRes.json()
        // //console.log("[stripe-callback] Verify result:", verifyData.paymentStatus)
        if (!verifyRes.ok || verifyData.paymentStatus !== "paid") {
          setError("Payment was not completed. Please return to checkout and try again.")
          return
        }
      } catch (e: any) {
        console.error("[stripe-callback] Stripe verification failed:", e?.message)
      }

      // Check if cart is already completed (e.g. user refreshed callback page)
      let cartAlreadyCompleted = false
      try {
        //console.log("[stripe-callback] Checking cart status...")
        const { cart } = await sdk.store.cart.retrieve(cartId)
        //console.log("[stripe-callback] Cart completed_at:", (cart as any)?.completed_at)
        if ((cart as any)?.completed_at) {
          cartAlreadyCompleted = true
        }
      } catch {
        cartAlreadyCompleted = true
      }

      if (cartAlreadyCompleted) {
        //console.log("[stripe-callback] Cart already completed, redirecting...")
        cleanup()
        router.replace("/checkout/success")
        return
      }

      // Add the Stripe session ID to metadata
      //console.log("[stripe-callback] Updating cart metadata...")
      await sdk.store.cart.update(cartId, {
        metadata: { stripe_checkout_session_id: sessionId },
      })
      //console.log("[stripe-callback] Cart metadata updated")

      // Ensure shipping method is set (required for cart completion)
      const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cartId })
      //console.log("[stripe-callback] shipping_options:", shipping_options?.length, shipping_options?.map((o: any) => o.id))
      if (shipping_options?.length) {
        const sorted = [...shipping_options].sort((a: any, b: any) => (a.price_type === "calculated" ? 0 : 1) - (b.price_type === "calculated" ? 0 : 1))
        let shippingAdded = false
        for (const opt of sorted) {
          try {
            await sdk.store.cart.addShippingMethod(cartId, { option_id: opt.id })
            //console.log("[stripe-callback] Added shipping method:", opt.id)
            shippingAdded = true
            break
          } catch (e: any) {
            console.warn("[stripe-callback] Failed to add shipping option:", opt.id, e?.message)
          }
        }
        if (!shippingAdded) {
          console.error("[stripe-callback] Could not add any shipping method")
        }
      } else {
        console.error("[stripe-callback] No shipping options available for cart")
      }

      // Complete cart via Medusa
      await sdk.store.payment.initiatePaymentSession({ id: cartId } as any, { provider_id: "pp_system_default" })
      const completedCart = await sdk.store.cart.complete(cartId)

      // Auto-capture payment in Medusa
      const completedOrderId = (completedCart as any)?.order?.id
      if (completedOrderId) {
        try {
          await fetch("/api/orders/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: completedOrderId }),
          })
        } catch (captureErr) {
          console.error("Payment capture error:", captureErr)
        }
      }

      // Save address for logged-in customers (from sessionStorage backup if available)
      try {
        const pendingData = sessionStorage.getItem("stripe_checkout_data")
        if (pendingData) {
          const { form, customerId } = JSON.parse(pendingData)
          if (customerId && form) {
            const [first_name, ...rest] = form.full_name.trim().split(" ")
            const last_name = rest.join(" ") || first_name
            const { addresses } = await sdk.store.customer.listAddress({ limit: 10 }) as any
            const alreadyHas = (addresses || []).some((a: any) =>
              a.address_1 === form.address_1 && a.postal_code === form.postal_code
            )
            if (!alreadyHas) {
              await sdk.store.customer.createAddress({
                first_name, last_name, address_1: form.address_1, address_2: form.address_2 || undefined,
                city: form.city, province: form.province, postal_code: form.postal_code,
                country_code: (form.country_code || "us").toLowerCase(), phone: form.phone || undefined,
                is_default_shipping: (addresses || []).length === 0,
              })
            }
          }
        }
      } catch { /* Don't block */ }

      cleanup()
      router.replace("/checkout/success")
    } catch (err: any) {
      console.error("Order completion error:", err)
      if (err?.message?.includes("completed") || err?.message?.includes("not found")) {
        cleanup()
        router.replace("/checkout/success")
        return
      }
      setError("Your payment was processed but we had trouble completing the order. Please contact support@peptidesfarma.com. Do NOT retry payment.")
    }
  }

  function cleanup() {
    try { sessionStorage.removeItem("stripe_checkout_data") } catch {}
    localStorage.removeItem("medusa_cart_id")
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 py-16">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-[16px] p-6 text-center">
          <p className="text-red-700 text-[15px] font-medium">{error}</p>
          <a href="mailto:support@peptidesfarma.com" className="text-[#4F8AF7] underline mt-3 inline-block text-[14px]">
            Contact Support
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4F8AF7]" />
        <p className="text-[16px] font-medium text-[#383637]">Completing your order...</p>
        <p className="text-[13px] text-[#383637]/60">Please don't close this page.</p>
      </div>
    </div>
  )
}

export default function StripeCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4F8AF7]" />
      </div>
    }>
      <StripeCallbackInner />
    </Suspense>
  )
}
