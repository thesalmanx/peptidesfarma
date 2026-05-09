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
      {error && <p className="text-red-500 text-[13px] mt-2 text-center">{error}</p>}
    </div>
  )
}

let cachedIntent: { secret: string; amount: number; cartId?: string } | null = null

function ExpressPayWrapper({ amount, currency, cartId, onSuccess }: { amount: number; currency: string; cartId?: string; onSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(
    cachedIntent?.amount === Math.round(amount * 100) ? cachedIntent.secret : null
  )

  useEffect(() => {
    if (amount <= 0) return
    const amountCents = Math.round(amount * 100)
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
    if (isDrawerOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[90] transition-opacity duration-300 ${isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(8,18,42,0.5)", backdropFilter: "blur(4px)" }}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <aside
        className="pf-cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(440px, 100vw)",
          background: "#fff",
          zIndex: 91,
          transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 460ms cubic-bezier(.22,1,.36,1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--pf-shadow-lg)",
        }}
      >
        {/* Header */}
        <div className="pf-cart-drawer-header" style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--pf-line)" }}>
          <div>
            <div className="pf-eyebrow">Cart</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>Your order ({items.length})</div>
          </div>
          <button onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }} aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m6 6 12 12" /><path d="m18 6-12 12" /></svg>
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div style={{ padding: "0 24px", borderBottom: "1px solid var(--pf-line)", background: "var(--pf-paper)" }}>
            <FreeShippingBar subtotal={subtotal} />
          </div>
        )}

        {/* Cart items */}
        <div className="pf-cart-drawer-body" style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--pf-text-3)" }}>
              <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: 32, background: "var(--pf-paper-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg>
              </div>
              <div style={{ fontWeight: 600, color: "var(--pf-text)", marginBottom: 4 }}>Cart is empty</div>
              <div style={{ fontSize: 13 }}>Browse the catalog to start an order.</div>
              <Link href="/products" onClick={closeDrawer} className="pf-btn pf-btn--ink" style={{ marginTop: 16 }}>Shop catalog</Link>
            </div>
          ) : (
            items.map((item) => <CartItem key={item.id} item={item} variant="drawer" />)
          )}

          {/* BAC Water upsell */}
          {items.length > 0 && <BacWaterUpsell />}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="pf-cart-drawer-footer" style={{ borderTop: "1px solid var(--pf-line)", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: "var(--pf-mono)", fontWeight: 600 }}>{formatPrice(subtotal, currencyCode)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6, color: "var(--pf-ok)" }}>
                <span>Discount</span>
                <span style={{ fontWeight: 600 }}>-{formatPrice(discount, currencyCode)}</span>
              </div>
            )}

            {/* Coupon */}
            {cart?.id && (
              <CouponInput cartId={cart.id} onApplied={() => { if (cart?.id) refreshCart(cart.id) }} initialCode={appliedPromoCode} />
            )}

            <div style={{ fontSize: 12, color: "var(--pf-text-3)", marginBottom: 16, marginTop: 8 }}>Tax and shipping calculated at checkout.</div>

            {/* Checkout button */}
            {(() => {
              const onlyBacWater = items.length > 0 && items.every((item: any) =>
                item.product_handle === "bac-water" || item.product_title?.toLowerCase().includes("bac water")
              )
              if (onlyBacWater) return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div className="pf-btn pf-btn--primary pf-btn--lg" style={{ width: "100%", opacity: 0.4, cursor: "not-allowed" }}>
                    Checkout &middot; {formatPrice(total, currencyCode)}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--pf-warn)", fontWeight: 500, textAlign: "center" }}>Add a peptide to checkout</p>
                </div>
              )
              return (
                <Link href="/checkout" onClick={closeDrawer} className="pf-btn pf-btn--primary pf-btn--lg" style={{ width: "100%", marginBottom: 8 }}>
                  Checkout &middot; {formatPrice(total, currencyCode)}
                </Link>
              )
            })()}

            <Link href="/cart" onClick={closeDrawer} className="pf-btn pf-btn--ghost" style={{ width: "100%" }}>View full cart</Link>

            <div style={{ marginTop: 16, padding: 12, background: "var(--pf-paper)", borderRadius: 8, fontSize: 11, color: "var(--pf-text-3)", lineHeight: 1.5 }}>
              For research purposes only. Not for human consumption. Compounds are supplied for laboratory use.
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
