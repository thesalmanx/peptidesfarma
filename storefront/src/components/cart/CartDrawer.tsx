"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"
import CouponInput from "@/components/CouponInput"
import CartItem from "./CartItem"
import BacWaterUpsell from "./BacWaterUpsell"
import { FREE_STANDARD_THRESHOLD, FREE_2DAY_THRESHOLD } from "@/lib/constants"

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const dollars = subtotal
  const reachedStandard = dollars >= FREE_STANDARD_THRESHOLD
  const reached2Day = dollars >= FREE_2DAY_THRESHOLD

  let message: React.ReactNode
  let progressPercent: number

  if (reached2Day) {
    message = (
      <span className="text-[14px] leading-[20px] text-[#16a34a] font-medium">
        <span className="font-semibold">Free 2-day shipping</span> unlocked!
      </span>
    )
    progressPercent = 100
  } else if (reachedStandard) {
    const remaining = FREE_2DAY_THRESHOLD - dollars
    message = (
      <span className="text-[14px] leading-[20px] text-[#333]">
        <span className="font-semibold text-[#16a34a]">Free shipping unlocked!</span> &middot; <span className="font-semibold text-[#16a34a]">${remaining.toFixed(2)}</span> to free 2-day
      </span>
    )
    progressPercent = ((dollars - FREE_STANDARD_THRESHOLD) / (FREE_2DAY_THRESHOLD - FREE_STANDARD_THRESHOLD)) * 50 + 50
  } else {
    const remaining = FREE_STANDARD_THRESHOLD - dollars
    message = (
      <span className="text-[14px] leading-[20px] text-[#333]">
        <span className="font-semibold text-[#16a34a]">${remaining.toFixed(2)}</span> away from free shipping
      </span>
    )
    progressPercent = (dollars / FREE_STANDARD_THRESHOLD) * 50
  }


  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#16a34a]">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        {message}
      </div>
      <div className="relative w-full h-[6px] rounded-full bg-[#e5e7eb] overflow-hidden">
        <div className="absolute left-0 top-0 h-full rounded-full bg-[#16a34a] transition-all duration-500 ease-out" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] leading-[16px] ${reachedStandard ? "text-[#16a34a] font-medium" : "text-[#999]"}`}>
          Free standard &middot; ${FREE_STANDARD_THRESHOLD}
        </span>
        <span className={`text-[11px] leading-[16px] ${reached2Day ? "text-[#16a34a] font-medium" : "text-[#999]"}`}>
          Free 2-day &middot; ${FREE_2DAY_THRESHOLD}
        </span>
      </div>
    </div>
  )
}

function ExpressPayButton({ amount, currency, onSuccess }: { amount: number; currency: string; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onConfirm = useCallback(async () => {
    if (!stripe || !elements) return
    setError(null)
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
    })
    if (stripeError) {
      setError(stripeError.message || "Payment failed. Please try again.")
    } else {
      onSuccess()
    }
  }, [stripe, elements, onSuccess])

  if (!ready) {
    // Still render the element but hidden until ready
  }

  return (
    <div className={ready ? "" : "hidden"}>
      <ExpressCheckoutElement
        onReady={() => setReady(true)}
        onConfirm={onConfirm}
        options={{
          buttonHeight: 48,
          layout: { maxColumns: 1, maxRows: 3 },
          paymentMethods: { amazonPay: "never" },
        }}
      />
      {error && (
        <p className="text-red-500 text-[13px] mt-2 text-center">{error}</p>
      )}
    </div>
  )
}

// Cache intent across drawer open/close to avoid re-fetching.
// Invalidated automatically when amount changes (useEffect dependency).
let cachedIntent: { secret: string; amount: number; cartId?: string } | null = null

function ExpressPayWrapper({ amount, currency, cartId, onSuccess }: { amount: number; currency: string; cartId?: string; onSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(
    cachedIntent?.amount === Math.round(amount * 100) ? cachedIntent.secret : null
  )

  useEffect(() => {
    if (amount <= 0) return
    const amountCents = Math.round(amount * 100)

    // Use cached if amount matches
    if (cachedIntent && cachedIntent.amount === amountCents) {
      setClientSecret(cachedIntent.secret)
      return
    }

    fetch("/api/stripe/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency, cartId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.clientSecret) {
          cachedIntent = { secret: d.clientSecret, amount: amountCents }
          setClientSecret(d.clientSecret)
        }
      })
      .catch(() => {})
  }, [amount, currency, cartId])

  if (!clientSecret || !stripePromise) return null

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <ExpressPayButton amount={amount} currency={currency} onSuccess={onSuccess} />
    </Elements>
  )
}

export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, refreshCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isDrawerOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer() }
    if (isDrawerOpen) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isDrawerOpen, closeDrawer])

  const subtotal = cart?.subtotal ?? 0
  const currencyCode = cart?.currency_code ?? "usd"
  const discount = cart?.discount_total ?? 0
  const total = cart?.total ?? subtotal
  const items = cart?.items ?? []

  // Get applied promo code from cart
  const appliedPromoCode = (() => {
    const promos = (cart as any)?.promotions || []
    if (promos.length > 0) return promos[0].code || null
    for (const item of items) {
      const adjs = (item as any).adjustments || []
      for (const adj of adjs) {
        if (adj.code) return adj.code
      }
    }
    return null
  })()

  const handleExpressSuccess = useCallback(() => {
    localStorage.removeItem("medusa_cart_id")
    closeDrawer()
    router.push("/checkout/success")
  }, [closeDrawer, router])

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300 ${isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeDrawer}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 h-full w-full md:w-[390px] bg-white z-[91] flex flex-col transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0" style={{ padding: "20px", height: "70px" }}>
          <h2 style={{ fontWeight: 600, fontSize: "20px", lineHeight: "30px", letterSpacing: "-0.02em", color: "#242424" }}>
            Shopping Cart
          </h2>
          <button onClick={closeDrawer} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3" style={{ padding: "12px 20px" }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ padding: "80px 20px", gap: "24px" }}>
              <div className="flex items-center justify-center" style={{ width: "60px", height: "60px", background: "linear-gradient(95.01deg, rgba(17, 92, 111, 0.08) 16.35%, rgba(54, 132, 142, 0.08) 68.78%), #FFFFFF", border: "2px solid rgba(144, 183, 188, 0.08)", borderRadius: "16px" }}>
                <Image src="/icons/shopping-bag-01.svg" alt="" width={24} height={24} />
              </div>
              <div className="flex flex-col items-center" style={{ gap: "12px" }}>
                <h3 style={{ fontWeight: 600, fontSize: "32px", lineHeight: "40px", textAlign: "center", letterSpacing: "-0.02em", color: "#242424" }}>
                  Your cart is empty
                </h3>
                <p style={{ fontWeight: 400, fontSize: "16px", lineHeight: "24px", textAlign: "center", color: "#242424" }}>
                  Looks like you haven&apos;t added anything to your cart yet.
                </p>
              </div>
              <Link href="/products" onClick={closeDrawer} className="btn-primary flex items-center justify-center self-stretch hover:opacity-90 transition-opacity" style={{ padding: "12px 16px", height: "48px", borderRadius: "110px", fontWeight: 700, fontSize: "16px", lineHeight: "24px", letterSpacing: "-0.01em", color: "#FFFFFF" }}>
                Start shopping
              </Link>
            </div>
          ) : (
            items.map((item) => <CartItem key={item.id} item={item} variant="drawer" />)
          )}
        </div>

        {/* Footer: Subtotal + Shipping + Pay buttons */}
        {items.length > 0 && (
          <div className="shrink-0 flex flex-col" style={{ padding: "16px 20px", gap: "12px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            {/* BAC Water upsell */}
            <BacWaterUpsell />

            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span style={{ fontWeight: 700, fontSize: "18px", lineHeight: "28px", letterSpacing: "-0.02em", color: "#242424" }}>
                Subtotal
              </span>
              <span style={{ fontWeight: 700, fontSize: "18px", lineHeight: "28px", letterSpacing: "-0.02em", color: "#242424" }}>
                {formatPrice(subtotal, currencyCode)}
              </span>
            </div>

            {/* Discount line */}
            {discount > 0 && (
              <div className="flex items-center justify-between">
                <span style={{ fontSize: "14px", color: "#16a34a", fontWeight: 600 }}>Discount</span>
                <span style={{ fontSize: "14px", color: "#16a34a", fontWeight: 600 }}>-{formatPrice(discount, currencyCode)}</span>
              </div>
            )}

            {/* Total after discount */}
            {discount > 0 && (
              <div className="flex items-center justify-between">
                <span style={{ fontWeight: 700, fontSize: "16px", color: "#4F8AF7" }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: "16px", color: "#4F8AF7" }}>{formatPrice(total, currencyCode)}</span>
              </div>
            )}

            {/* Coupon/Promo code */}
            {cart?.id && (
              <CouponInput cartId={cart.id} onApplied={() => { if (cart?.id) refreshCart(cart.id) }} initialCode={appliedPromoCode} />
            )}

            {/* Free shipping bar */}
            <FreeShippingBar subtotal={subtotal} />

            {/* Proceed to Checkout */}
            {(() => {
              const onlyBacWater = items.length > 0 && items.every((item: any) =>
                item.product_handle === "bac-water" || item.product_title?.toLowerCase().includes("bac water")
              )
              if (onlyBacWater) return (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center w-full gap-2 opacity-40 cursor-not-allowed" style={{ height: "52px", borderRadius: "110px", background: "#242424", fontWeight: 700, fontSize: "16px", color: "#FFFFFF" }}>
                    Proceed to Checkout
                  </div>
                  <p className="text-[12px] text-amber-600 font-medium text-center">Add a peptide to checkout — BAC Water can&apos;t be purchased alone.</p>
                </div>
              )
              return (
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="flex items-center justify-center w-full gap-2 hover:opacity-90 transition-opacity"
                  style={{ height: "52px", borderRadius: "110px", background: "#242424", fontWeight: 700, fontSize: "16px", lineHeight: "24px", letterSpacing: "-0.01em", color: "#FFFFFF" }}
                >
                  Proceed to Checkout
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M5 12h14m-6-6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )
            })()}

            {/* Payment logos + secure text */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5">
                <Image src="/icons/Visa_Inc.-Logo.wine.svg" alt="Visa" width={30} height={20} />
                <Image src="/icons/mastercard-logo.svg" alt="Mastercard" width={30} height={20} />
                <Image src="/icons/amex.svg" alt="Amex" width={30} height={20} />
                <Image src="/icons/applepay-logo.svg" alt="Apple Pay" width={30} height={20} />
              </div>
              <span className="text-[11px] text-[#999]">100% secure payments</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
