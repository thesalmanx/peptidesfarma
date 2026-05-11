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
import { sdk } from "@/lib/medusa"

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

/* ─── Icons (Google Material style) ─── */
function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="var(--pf-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconShipping() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--pf-blue)">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  )
}

function IconBag() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" fill="var(--pf-text-3)" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pf-text-3)">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
    </svg>
  )
}

function IconAdd() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#fff" />
    </svg>
  )
}

/* ─── Free Shipping Bar ─── */
function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const dollars = subtotal
  const reachedStandard = dollars >= FREE_STANDARD_THRESHOLD
  const reached2Day = dollars >= FREE_2DAY_THRESHOLD

  let message: React.ReactNode
  let progressPercent: number

  if (reached2Day) {
    message = <span style={{ fontSize: 13, fontWeight: 500, color: "#16a34a" }}>Free 2-day shipping unlocked!</span>
    progressPercent = 100
  } else if (reachedStandard) {
    const remaining = FREE_2DAY_THRESHOLD - dollars
    message = (
      <span style={{ fontSize: 13, color: "var(--pf-ink)" }}>
        <span style={{ fontWeight: 600, color: "#16a34a" }}>Free shipping!</span> &middot; <span style={{ fontWeight: 600 }}>${remaining.toFixed(0)}</span> to free 2-day
      </span>
    )
    progressPercent = ((dollars - FREE_STANDARD_THRESHOLD) / (FREE_2DAY_THRESHOLD - FREE_STANDARD_THRESHOLD)) * 50 + 50
  } else {
    const remaining = FREE_STANDARD_THRESHOLD - dollars
    message = (
      <span style={{ fontSize: 13, color: "var(--pf-ink)" }}>
        <span style={{ fontWeight: 600 }}>${remaining.toFixed(0)}</span> away from free shipping
      </span>
    )
    progressPercent = (dollars / FREE_STANDARD_THRESHOLD) * 50
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <IconShipping />
        {message}
      </div>
      <div style={{ position: "relative", width: "100%", height: 5, borderRadius: 99, background: "#e5e7eb", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 99, background: "#16a34a", transition: "width 500ms ease-out", width: `${Math.min(progressPercent, 100)}%` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: reachedStandard ? "#16a34a" : "var(--pf-text-3)", fontWeight: reachedStandard ? 500 : 400 }}>
          Free standard &middot; ${FREE_STANDARD_THRESHOLD}
        </span>
        <span style={{ fontSize: 11, color: reached2Day ? "#16a34a" : "var(--pf-text-3)", fontWeight: reached2Day ? 500 : 400 }}>
          Free 2-day &middot; ${FREE_2DAY_THRESHOLD}
        </span>
      </div>
    </div>
  )
}

/* ─── Upsell Product Card ─── */
interface UpsellProduct {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  variantId: string
  price: number
  currency: string
}

function UpsellCard({ product, onAdd, adding, layout }: { product: UpsellProduct; onAdd: () => void; adding: boolean; layout: "sidebar" | "inline" }) {
  const imgSize = layout === "sidebar" ? 140 : 110

  return (
    <div style={{
      flexShrink: 0,
      width: layout === "sidebar" ? "100%" : 110,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <Link
        href={`/product/${product.handle}`}
        style={{
          display: "block",
          width: "100%",
          aspectRatio: "1/1",
          borderRadius: 14,
          overflow: "hidden",
          background: "var(--pf-paper)",
          position: "relative",
        }}
      >
        {product.thumbnail && (
          <Image src={product.thumbnail} alt={product.title} fill className="object-cover" sizes={`${imgSize}px`} style={{ objectPosition: "80% center" }} />
        )}
      </Link>
      <div style={{ fontSize: layout === "sidebar" ? 13 : 11, fontWeight: 500, color: "var(--pf-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: "16px" }}>
        {product.title}
      </div>
      <div style={{ fontSize: layout === "sidebar" ? 14 : 12, fontWeight: 700, color: "var(--pf-ink)", lineHeight: "18px" }}>
        {formatPrice(product.price, product.currency)}
      </div>
      <button
        onClick={onAdd}
        disabled={adding}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          width: "100%", height: layout === "sidebar" ? 34 : 30, borderRadius: 999,
          background: "var(--pf-ink)", color: "#fff", border: "none",
          fontSize: layout === "sidebar" ? 12 : 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          opacity: adding ? 0.6 : 1,
          transition: "opacity 0.15s ease",
        }}
      >
        <IconAdd />
        Add
      </button>
    </div>
  )
}

/* ─── Upsell data hook ─── */
function useUpsellProducts(cartItems: Array<{ product_id?: string | null; variant_id?: string | null }>) {
  const [products, setProducts] = useState<UpsellProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const cachedRid = sessionStorage.getItem("peptidesfarma_region_id")
        let rid = cachedRid || ""
        if (!rid) {
          const { regions } = await sdk.store.region.list({ limit: 10 })
          const usd = regions?.find((r) => r.currency_code === "usd")
          rid = usd?.id || regions?.[0]?.id || ""
          if (rid) sessionStorage.setItem("peptidesfarma_region_id", rid)
        }
        const { products: items } = await sdk.store.product.list({
          limit: 12, region_id: rid, fields: "+variants.calculated_price",
        })
        if (cancelled) return

        const cartVariantIds = new Set(cartItems.map((i) => i.variant_id))
        const cartProductIds = new Set(cartItems.map((i) => i.product_id))

        const mapped: UpsellProduct[] = (items || [])
          .filter((p: any) => !cartProductIds.has(p.id))
          .map((p: any) => {
            const v = p.variants?.[0]
            return {
              id: p.id, handle: p.handle, title: p.title, thumbnail: p.thumbnail,
              variantId: v?.id || "",
              price: v?.calculated_price?.calculated_amount || 0,
              currency: v?.calculated_price?.currency_code || "usd",
            }
          })
          .filter((p: UpsellProduct) => p.variantId && !cartVariantIds.has(p.variantId))
          .slice(0, 8)

        setProducts(mapped)
      } catch {}
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [cartItems])

  return { products, loading }
}

/* ─── Express Pay ─── */
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
    if (stripeError) setError(stripeError.message || "Payment failed. Please try again.")
    else onSuccess()
  }, [stripe, elements, onSuccess])

  return (
    <div className={ready ? "" : "hidden"}>
      <ExpressCheckoutElement
        onReady={() => setReady(true)}
        onConfirm={onConfirm}
        options={{ buttonHeight: 48, layout: { maxColumns: 1, maxRows: 3 }, paymentMethods: { amazonPay: "never" } }}
      />
      {error && <p style={{ color: "var(--pf-err)", fontSize: 13, marginTop: 8, textAlign: "center" }}>{error}</p>}
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

/* ─── Cart Drawer ─── */
export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, refreshCart, addItem } = useCart()
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

  const { products: upsellProducts, loading: upsellLoading } = useUpsellProducts(items)
  const [addingId, setAddingId] = useState<string | null>(null)
  const hasUpsell = items.length > 0 && !upsellLoading && upsellProducts.length > 0

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

  const handleUpsellAdd = async (variantId: string) => {
    setAddingId(variantId)
    await addItem(variantId, 1)
    setAddingId(null)
  }

  const onlyBacWater = items.length > 0 && items.every((item: any) =>
    item.product_handle === "bac-water" || item.product_title?.toLowerCase().includes("bac water")
  )

  // Desktop width: 660px when upsell sidebar shown, 440px otherwise
  const drawerWidth = hasUpsell ? "min(660px, 100vw)" : "min(440px, 100vw)"

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        style={{
          position: "fixed", inset: 0, zIndex: 90,
          background: "rgba(5,20,77,0.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: isDrawerOpen ? 1 : 0,
          pointerEvents: isDrawerOpen ? "auto" : "none",
          transition: "opacity 300ms ease",
        }}
      />

      {/* Drawer wrapper */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: drawerWidth,
          zIndex: 91,
          transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 420ms cubic-bezier(.22,1,.36,1), width 300ms ease",
          display: "flex",
          flexDirection: "row",
          boxShadow: "-8px 0 40px rgba(5,20,77,0.12)",
        }}
      >
        {/* ─── Desktop upsell sidebar (hidden on mobile) ─── */}
        {hasUpsell && (
          <div
            className="hidden md:flex"
            style={{
              width: 220,
              flexShrink: 0,
              background: "var(--pf-paper)",
              borderRight: "1px solid var(--pf-line)",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--pf-line)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--pf-ink)", letterSpacing: "-0.02em" }}>
                You might also like
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 16 }} className="pf-hide-scrollbar">
              {upsellProducts.map((p) => (
                <UpsellCard
                  key={p.id}
                  product={p}
                  onAdd={() => handleUpsellAdd(p.variantId)}
                  adding={addingId === p.variantId}
                  layout="sidebar"
                />
              ))}
            </div>
          </div>
        )}

        {/* ─── Main cart panel ─── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", minWidth: 0 }}>
          {/* Header */}
          <div style={{
            padding: "18px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid var(--pf-line)",
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--pf-text-3)" }}>Cart</div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--pf-ink)", marginTop: 2 }}>
                Your order ({items.length})
              </div>
            </div>
            <button onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Close cart">
              <IconClose />
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--pf-text-3)" }}>
                <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: 99, background: "var(--pf-paper)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconBag />
                </div>
                <div style={{ fontWeight: 600, color: "var(--pf-ink)", marginBottom: 4 }}>Cart is empty</div>
                <div style={{ fontSize: 13 }}>Browse the catalog to start an order.</div>
                <Link href="/products" onClick={closeDrawer} className="pf-btn pf-btn--ink" style={{ marginTop: 16 }}>Shop catalog</Link>
              </div>
            ) : (
              <>
                {items.map((item) => <CartItem key={item.id} item={item} variant="drawer" />)}
                <BacWaterUpsell />

                {/* Mobile upsell - horizontal scroll (hidden on desktop when sidebar is shown) */}
                {hasUpsell && (
                  <div className="md:hidden" style={{ padding: "16px 0 0" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--pf-ink)", marginBottom: 10, letterSpacing: "-0.01em" }}>
                      You might also like
                    </div>
                    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }} className="pf-hide-scrollbar">
                      {upsellProducts.map((p) => (
                        <UpsellCard
                          key={p.id}
                          product={p}
                          onAdd={() => handleUpsellAdd(p.variantId)}
                          adding={addingId === p.variantId}
                          layout="inline"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div style={{ borderTop: "1px solid var(--pf-line)", padding: "20px 24px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                <span style={{ color: "var(--pf-text-2)" }}>Subtotal</span>
                <span style={{ fontWeight: 700, color: "var(--pf-ink)" }}>{formatPrice(subtotal, currencyCode)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4, color: "#16a34a" }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 600 }}>-{formatPrice(discount, currencyCode)}</span>
                </div>
              )}

              {cart?.id && (
                <CouponInput cartId={cart.id} onApplied={() => { if (cart?.id) refreshCart(cart.id) }} initialCode={appliedPromoCode} />
              )}

              <div style={{ margin: "12px 0" }}>
                <FreeShippingBar subtotal={subtotal} />
              </div>

              <div style={{ fontSize: 11, color: "var(--pf-text-3)", marginBottom: 12 }}>
                Tax and shipping calculated at checkout.
              </div>

              {onlyBacWater ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div className="pf-btn pf-btn--primary pf-btn--lg" style={{ width: "100%", opacity: 0.4, cursor: "not-allowed" }}>
                    Checkout &middot; {formatPrice(total, currencyCode)}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--pf-warn)", fontWeight: 500, textAlign: "center", margin: 0 }}>Add a peptide to checkout</p>
                </div>
              ) : (
                <Link href="/checkout" onClick={closeDrawer} className="pf-btn pf-btn--primary pf-btn--lg" style={{ width: "100%" }}>
                  Checkout &middot; {formatPrice(total, currencyCode)}
                </Link>
              )}

              <Link href="/cart" onClick={closeDrawer} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "100%", height: 40, marginTop: 8,
                fontSize: 13, fontWeight: 500, color: "var(--pf-text-2)",
                textDecoration: "none", borderRadius: 999,
                border: "1px solid var(--pf-line)", background: "transparent",
              }}>
                View full cart
              </Link>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 12 }}>
                <IconLock />
                <span style={{ fontSize: 11, color: "var(--pf-text-3)" }}>100% secure &amp; encrypted payments</span>
              </div>

              <div style={{ marginTop: 12, padding: 10, background: "var(--pf-paper)", borderRadius: 10, fontSize: 11, color: "var(--pf-text-3)", lineHeight: 1.5, textAlign: "center" }}>
                For research purposes only. Not for human consumption.
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
