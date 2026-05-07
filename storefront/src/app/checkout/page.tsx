"use client"

import { useState, useEffect, useRef, useCallback, useMemo, Suspense, Fragment } from "react"
import { FREE_STANDARD_THRESHOLD, FREE_2DAY_THRESHOLD } from "@/lib/constants"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { formatPrice } from "@/lib/format-price"
import { sdk } from "@/lib/medusa"
import { trackBeginCheckout, trackPurchase } from "@/lib/gtag"
import AddressAutocomplete from "@/components/AddressAutocomplete"
import SquareCardForm from "@/components/checkout/SquareCardForm"
import CouponInput from "@/components/CouponInput"
import BacWaterUpsell from "@/components/cart/BacWaterUpsell"
import QuikliePaymentForm from "@/components/checkout/QuikliePaymentForm"
import Stepper from "@mui/material/Stepper"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import { CiDeliveryTruck, CiHeadphones } from "react-icons/ci"
import { PiCurrencyDollarLight } from "react-icons/pi"
import { IoIosCheckboxOutline } from "react-icons/io"


// Extract readable error message from Medusa SDK errors
function extractError(err: any, fallback = "Something went wrong. Please try again."): string {
  return err?.response?.data?.message || err?.body?.message || err?.message || fallback
}

const INPUT_CLASS =
  "no-focus-ring w-full h-[48px] px-4 text-[16px] leading-[24px] font-normal text-[#383637] placeholder:text-[#383637]/72 rounded-[16px] border border-[#242424]/8 bg-[#242424]/4 outline-none transition-colors focus:border-[#4F8AF7]/40"
const LABEL_CLASS = "text-[14px] leading-[22px] font-semibold text-[#383637]"

// ── MUI Stepper ──
const STEP_LABELS = ["Shipping", "Delivery", "Payment"]
function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-8 max-w-[520px]">
      <Stepper
        activeStep={step - 1}
        alternativeLabel
        sx={{
          "& .MuiStepConnector-line": { borderColor: "#D1D5DB", borderTopWidth: 2 },
          "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": { borderColor: "#4F8AF7" },
          "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": { borderColor: "#4F8AF7" },
          "& .MuiStepIcon-root": { color: "#D1D5DB", fontSize: 24 },
          "& .MuiStepIcon-root.Mui-active": { color: "#4F8AF7" },
          "& .MuiStepIcon-root.Mui-completed": { color: "#4F8AF7" },
          "& .MuiStepLabel-label": { fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "#999", marginTop: "6px" },
          "& .MuiStepLabel-label.Mui-active": { color: "#4F8AF7", fontWeight: 600 },
          "& .MuiStepLabel-label.Mui-completed": { color: "#4F8AF7", fontWeight: 500 },
        }}
      >
        {STEP_LABELS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  )
}

// ── Section Header (numbered badge + title + checkmark + edit) ──
function SectionHeader({ number, title, completed, onEdit, dimmed }: { number: number; title: string; completed: boolean; onEdit?: () => void; dimmed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${dimmed ? "bg-[#D1D5DB] text-white" : "bg-[#242424] text-white"}`}>
        {number}
      </div>
      <h2 className={`text-[18px] font-bold flex-1 ${dimmed ? "text-[#D1D5DB]" : "text-[#242424]"}`}>{title}</h2>
      {completed && (
        <>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="shrink-0">
            <circle cx="11" cy="11" r="11" fill="#22C55E"/>
            <path d="M7 11l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {onEdit && (
            <button type="button" onClick={onEdit} className="text-[16px] font-medium text-[#242424] hover:underline ml-1">Edit</button>
          )}
        </>
      )}
    </div>
  )
}

// ── Copy Button ──
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement("textarea")
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <button type="button" onClick={handleCopy} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#242424]/5 hover:bg-[#242424]/10 text-[12px] font-medium text-[#333] transition-colors">
      {copied ? (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Copied!</>
      ) : (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M5 15V5a2 2 0 012-2h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>{label}</>
      )}
    </button>
  )
}

// ── Helper: complete manual order (shared by both Venmo and legacy manual) ──
// completeManualOrder removed — order now completes on payment-pending page

// ── Venmo Payment Form — same as production (manual capture flow) ──
function VenmoPaymentForm({ calculatedTotal, currencyCode, form, cart, items, shippingCost, tax, taxRate, taxJurisdiction, selectedShippoRate, customer, agreed, setAgreed }: any) {
  const router = useRouter()
  const { clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submittedRef = useRef(false)

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittedRef.current) return
    submittedRef.current = true
    if (!cart) return
    if (!form.postal_code?.trim()) { setError("Please enter a postal/ZIP code."); submittedRef.current = false; return }
    if (!form.address_1?.trim() || !form.city?.trim()) { setError("Please fill in your full shipping address."); submittedRef.current = false; return }

    setSubmitting(true)
    setError(null)

    // Create the order HERE on the checkout page — don't rely on sessionStorage
    try {
      const res = await fetch("/api/checkout/complete-venmo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: cart.id, form, selectedShippoRate, calculatedTotal, tax, taxRate, taxJurisdiction }),
      })
      const result = await res.json()

      if (!res.ok || !result?.orderId) {
        // Retry once
        await new Promise((r) => setTimeout(r, 2000))
        const res2 = await fetch("/api/checkout/complete-venmo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartId: cart.id, form, selectedShippoRate, calculatedTotal, tax, taxRate, taxJurisdiction }),
        })
        const result2 = await res2.json()
        if (!res2.ok || !result2?.orderId) {
          throw new Error(result2?.error || result?.error || "Order creation failed")
        }
        Object.assign(result, result2)
      }

      const orderNumber = result.orderDisplayId ? String(Number(result.orderDisplayId) + 11000) : ""

      // Build redirect params for payment-pending display
      const itemsData = items.map((item: any) => ({
        title: item.product_title || "",
        variant: item.variant_title || undefined,
        quantity: item.quantity,
        price: ((item.unit_price ?? 0) * (item.quantity ?? 1)).toFixed(2),
        thumbnail: item.thumbnail || undefined,
      }))
      const addressData = {
        name: form.full_name,
        line1: form.address_1,
        line2: form.address_2 || undefined,
        city: form.city,
        state: form.province,
        zip: form.postal_code,
        country: form.country_code.toUpperCase(),
      }
      const params = new URLSearchParams({
        total: calculatedTotal.toFixed(2),
        cartId: cart.id,
        orderNumber,
        orderId: result.orderId || "",
        items: encodeURIComponent(JSON.stringify(itemsData)),
        address: encodeURIComponent(JSON.stringify(addressData)),
      })

      clearCart()
      localStorage.removeItem("checkout_form")
      router.push(`/checkout/payment-pending?${params.toString()}`)
    } catch (err: any) {
      setError(err?.message || "Order creation failed. Please try again.")
      submittedRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleCompleteOrder} className="flex flex-col gap-4">
      {/* Venmo info */}
      <div className="rounded-[16px] border border-[#008CFF]/20 bg-[#008CFF]/5 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-[10px] bg-[#008CFF] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.5 3.6c.6 1 .9 2.1.9 3.4 0 4.2-3.6 9.6-6.5 13.4H7.8L5.4 3.3l5.2-.5 1.4 11.1c1.3-2.1 2.8-5.4 2.8-7.7 0-1.2-.2-2-.5-2.7l5.2-0.9z" /></svg>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[#242424]">Pay with Venmo after placing your order</p>
          <p className="text-[13px] text-[#555] mt-1 leading-[20px]">After you click &quot;Complete Order&quot;, you&apos;ll receive Venmo payment instructions with a QR code and direct payment link. Please complete payment within 24 hours.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-[16px] p-4 text-[14px]">{error}</div>}

      <DisclaimerSection agreed={agreed} setAgreed={setAgreed} />

      <button
        type="submit"
        disabled={submitting || !agreed[0] || !agreed[1]}
        className="w-full h-[52px] flex items-center justify-center gap-2 rounded-[110px] text-[16px] font-bold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
      >
        {submitting ? (
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
          </svg>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Complete Order
          </>
        )}
      </button>
    </form>
  )
}

// ── Card Payment Form — redirects to vulaskin.com, order created AFTER payment ──
function CardPaymentForm({ calculatedTotal, currencyCode, form, cart, items, shippingCost, tax, taxRate, taxJurisdiction, selectedShippoRate, shippingRates, selectedRate, customer, agreed, setAgreed }: any) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVulaModal, setShowVulaModal] = useState(false)
  const submittedRef = useRef(false)

  const redirectToPayment = async () => {
    const PAYMENT_DOMAIN = process.env.NEXT_PUBLIC_PAYMENT_DOMAIN || "https://vulaskin.com"
    const returnUrl = `${PAYMENT_DOMAIN}/r?to=/checkout/success`
    const cancelUrl = `${PAYMENT_DOMAIN}/r?to=/checkout&resume=1`

    // Pre-setup cart (address + shipping + payment) BEFORE redirecting
    // so the webhook only needs to call cart.complete() — 5s instead of 27s
    try {
      const [first_name, ...rest] = form.full_name.trim().split(" ")
      const last_name = rest.join(" ") || first_name
      const countryCode = (form.country_code || "us").toLowerCase()

      // Step 1: Update cart with address + metadata
      await sdk.store.cart.update(cart.id, {
        email: form.email,
        shipping_address: { first_name, last_name, address_1: form.address_1, address_2: form.address_2 || undefined, city: form.city, province: form.province, postal_code: form.postal_code, country_code: countryCode, phone: form.phone },
        billing_address: { first_name, last_name, address_1: form.address_1, address_2: form.address_2 || undefined, city: form.city, province: form.province, postal_code: form.postal_code, country_code: countryCode, phone: form.phone },
        metadata: {
          payment_method: "card",
          customer_paid_total: String(calculatedTotal),
          tax_amount: String(tax),
          tax_rate: String(taxRate),
          tax_jurisdiction: taxJurisdiction || "",
          ...(selectedShippoRate ? {
            shippo_shipping_cost: selectedShippoRate.amount,
            shippo_shipping_provider: selectedShippoRate.provider,
            shippo_shipping_service: selectedShippoRate.service,
            shippo_shipping_estimated_days: selectedShippoRate.estimatedDays,
            shippo_shipping_free: selectedShippoRate.freeShipping,
            shippo_rate_id: selectedShippoRate.id,
          } : {}),
        },
      })

      // Step 2: Add shipping method
      const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id })
      if (shipping_options?.length) {
        const sorted = [...shipping_options].sort((a: any, b: any) => (a.price_type === "calculated" ? 0 : 1) - (b.price_type === "calculated" ? 0 : 1))
        for (const opt of sorted) {
          try {
            await sdk.store.cart.addShippingMethod(cart.id, { option_id: opt.id })
            break
          } catch {}
        }
      }

      // Step 3: Init payment session
      await sdk.store.payment.initiatePaymentSession(cart as any, { provider_id: "pp_system_default" })
    } catch (err: any) {
      console.warn("Pre-setup failed, webhook will handle it:", err?.message)
      // Don't block — the webhook can still do all steps as fallback
    }

    const cartData = JSON.stringify({
      cartId: cart.id,
      form,
      selectedShippoRate,
      calculatedTotal,
      tax,
      taxRate,
      taxJurisdiction,
      preSetup: true, // Flag so webhook knows to skip steps 1-3
    })

    const paymentParams = new URLSearchParams({
      cartId: cart.id,
      amount: calculatedTotal.toFixed(2),
      email: form.email,
      name: form.full_name,
      returnUrl,
      cancelUrl,
      cartData: btoa(encodeURIComponent(cartData)),
    })

    // Save shipping state so it survives the VulaSkin redirect (mobile back button)
    try {
      sessionStorage.setItem("checkout_shipping_rates", JSON.stringify(shippingRates))
      sessionStorage.setItem("checkout_selected_rate", selectedRate || "")
    } catch {}

    window.location.href = `${PAYMENT_DOMAIN}/checkout/paypal?${paymentParams.toString()}`
  }

  const handlePayWithCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittedRef.current) return
    if (!cart) return
    if (!form.postal_code?.trim()) { setError("Please enter a postal/ZIP code."); return }
    if (!form.address_1?.trim() || !form.city?.trim()) { setError("Please fill in your full shipping address."); return }

    setError(null)
    setShowVulaModal(true)
  }

  const handleContinueToPayment = () => {
    submittedRef.current = true
    setShowVulaModal(false)
    setSubmitting(true)
    redirectToPayment()
  }

  return (
    <>
      <form onSubmit={handlePayWithCard} className="flex flex-col gap-4">
        <div className="rounded-[16px] border border-[#4F8AF7]/20 bg-[#4F8AF7]/5 p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.5"/>
              <path d="M2 10h20" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#242424]">Pay with Credit / Debit Card</p>
            <p className="text-[13px] text-[#555] mt-1 leading-[20px]">You&apos;ll be redirected to our secure payment processor to complete your purchase.</p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-[16px] p-4 text-[14px]">{error}</div>}

        <DisclaimerSection agreed={agreed} setAgreed={setAgreed} />

        <button
          type="submit"
          disabled={submitting || !agreed[0] || !agreed[1]}
          className="w-full h-[52px] flex items-center justify-center gap-2 rounded-[110px] text-[16px] font-bold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
        >
          {submitting ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
            </svg>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" strokeWidth="2"/>
                <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Proceed to Payment
            </>
          )}
        </button>
      </form>

      {/* VULA Payment Processor Disclaimer Modal */}
      {showVulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowVulaModal(false)}>
          <div className="bg-white rounded-[20px] max-w-[400px] w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.5"/>
                  <path d="M2 10h20" stroke="white" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[#242424] mb-2">We process payments with VULA</h3>
                <p className="text-[14px] text-[#555] leading-[22px]">
                  You may see this on the payment screen. This is our processing company that we use for all payments.
                </p>
              </div>
              <button
                type="button"
                onClick={handleContinueToPayment}
                className="w-full h-[48px] rounded-[110px] text-[16px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
              >
                Continue to payment
              </button>
              <button
                type="button"
                onClick={() => setShowVulaModal(false)}
                className="text-[13px] text-[#888] hover:text-[#555] transition-colors"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Legacy Manual Payment Instructions ──
// Legacy ManualPaymentForm removed — Venmo flow handles manual payments now
function ManualPaymentForm(_props: any) { return null }
function _Unused() { const handleCompleteOrder = () => {}; const submitting = false; const error = ""; const agreed: [boolean,boolean] = [false,false]; const setAgreed = (_v: any) => {};

  return (
    <form onSubmit={handleCompleteOrder} className="flex flex-col gap-4">
      {/* Manual Payment Card */}
      <div className="rounded-[16px] border border-[#242424]/12 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#242424]/8">
          <div className="w-10 h-10 rounded-[10px] bg-[#F2F7FD] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="#4F8AF7" strokeWidth="1.5"/>
              <path d="M2 10h20" stroke="#4F8AF7" strokeWidth="1.5"/>
              <path d="M6 14h4" stroke="#4F8AF7" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[16px] font-semibold text-[#242424]">Manual Payment</span>
        </div>

        {/* Body */}
        <div className="px-5 py-5 bg-[#FAFBFC] flex flex-col gap-5 text-[14px] leading-[22px] text-[#333]">
          <p className="text-[15px] font-medium text-[#242424]">
            Our current credit card processor is temporarily unavailable. In the meantime, if you would like to place your order, please follow the steps below:
          </p>

          <div>
            <p className="font-bold text-[15px] text-[#242424] mb-1">IMPORTANT: READ BEFORE COMPLETING ORDER</p>
            <p className="text-[#555]">This checkout method is for manual payments only using the following options:</p>
          </div>

          {/* Accepted Payment Methods */}
          <div>
            <p className="font-bold text-[15px] text-[#242424] flex items-center gap-1.5">
              <span className="text-[18px]">&#9989;</span> Accepted Payment Methods
            </p>
            <ul className="mt-2 ml-5 flex flex-col gap-1.5 list-disc">
              <li><strong>Apple Pay:</strong> 949-922-1991</li>
              <li><strong>Zelle:</strong> 949-280-9362</li>
              <li><strong>Venmo:</strong> @valtosi</li>
            </ul>
          </div>

          {/* Payment Time Window */}
          <div>
            <p className="font-bold text-[15px] text-[#242424] flex items-center gap-1.5">
              <span className="text-[18px]">&#9888;&#65039;</span> Payment Time Window (Required)
            </p>
            <ul className="mt-2 ml-5 flex flex-col gap-1.5 list-disc">
              <li>After you click &ldquo;Proceed to Payment&rdquo;, you will have 30 minutes to send payment</li>
              <li>If payment is not sent within 30 minutes, your order will be VOIDED automatically</li>
            </ul>
          </div>

          {/* Important Instructions */}
          <div>
            <p className="font-bold text-[15px] text-[#242424] flex items-center gap-1.5">
              <span className="text-[18px]">&#9989;</span> Important Instructions
            </p>
            <ul className="mt-2 ml-5 flex flex-col gap-1.5 list-disc">
              <li>Include ONLY your name in the payment notes. No order details etc.</li>
              <li>Orders are processed and shipped after payment is verified</li>
            </ul>
          </div>

          {/* Help / Support */}
          <div>
            <p className="font-bold text-[15px] text-[#242424]">Help / Support</p>
            <p className="mt-1 text-[#555]">
              If you have any payment issues, contact us:
            </p>
            <p className="mt-0.5 flex items-center gap-1.5">
              <span className="text-[16px]">&#9993;&#65039;</span>
              <a href="mailto:support@peptidesfarma.com" className="text-[#4F8AF7] underline">support@peptidesfarma.com</a>
            </p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-[16px] p-4 text-[14px]">{error}</div>}

      <DisclaimerSection agreed={agreed} setAgreed={setAgreed} />

      <button
        type="submit"
        disabled={submitting || !agreed[0] || !agreed[1]}
        className="w-full h-[52px] flex items-center justify-center gap-2 rounded-[110px] text-[16px] font-bold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
      >
        {submitting ? (
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
          </svg>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Complete Order
          </>
        )}
      </button>
    </form>
  )
}

// ── Disclaimer Checkbox ──
function DisclaimerSection({ agreed, setAgreed }: { agreed: [boolean, boolean]; setAgreed: (v: [boolean, boolean]) => void }) {
  const checked = agreed[0]

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[20px] font-semibold text-[#0F0502]">Review & Place Order</h2>

      {/* <div className="p-3.5 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE]">
        <p className="text-[13px] leading-[20px] text-[#1E40AF]">
          Your credit card statement will show as <strong>VULA</strong> for this order. Secure checkout.
        </p>
      </div> */}

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed[0]}
          onChange={(e) => setAgreed([e.target.checked, true])}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-[#4F8AF7] focus:ring-[#4F8AF7] shrink-0"
        />
        <span className="text-[13px] leading-[20px] text-[#333]">
          I confirm that I am 21 years of age or older and that all compounds in this order will be used strictly for laboratory and scientific research purposes only.
        </span>
      </label>

      {!checked && (
        <p className="text-[12px] text-red-500 font-medium">Please check the box above to proceed.</p>
      )}
    </div>
  )
}

// ── Square Card Payment Section ──
function SquarePaymentSection({
  calculatedTotal,
  currencyCode,
  form,
  cart,
  items,
  shippingCost,
  tax,
  selectedShippoRate,
  customer,
  agreed,
  setAgreed,
}: any) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bothAgreed = agreed[0] && agreed[1]

  const [paymentCharged, setPaymentCharged] = useState(false)
  const lastPayData = useRef<any>(null)

  const handleSquarePayment = async (sourceId: string) => {
    if (!cart || !bothAgreed || submitting) return

    setSubmitting(true)
    setError(null)

    // Only charge Square if not already charged
    if (!paymentCharged) {
      const payRes = await fetch("/api/square/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId,
          amount: calculatedTotal,
          currency: currencyCode,
          cartId: cart.id,
        }),
      })

      const payData = await payRes.json()
      if (!payRes.ok || !payData.success) {
        setError(payData.error || "Payment failed. Please try again.")
        setSubmitting(false)
        return
      }

      // Mark that payment succeeded — prevent double-charging on retry
      setPaymentCharged(true)
      lastPayData.current = payData
    }

    const payData = lastPayData.current || {}

    try {
      // 2. Update Medusa cart with address + Shippo shipping metadata
      const [first_name, ...rest] = form.full_name.trim().split(" ")
      const last_name = rest.join(" ") || first_name
      const countryCode = (form.country_code || "us").toLowerCase()

      await sdk.store.cart.update(cart.id, {
        email: form.email,
        shipping_address: { first_name, last_name, address_1: form.address_1, address_2: form.address_2 || undefined, city: form.city, province: form.province, postal_code: form.postal_code, country_code: countryCode, phone: form.phone },
        billing_address: { first_name, last_name, address_1: form.address_1, address_2: form.address_2 || undefined, city: form.city, province: form.province, postal_code: form.postal_code, country_code: countryCode, phone: form.phone },
        metadata: {
          square_payment_id: payData.paymentId || "",
          square_receipt_url: payData.receiptUrl || "",
          ...(selectedShippoRate ? {
            shippo_shipping_cost: selectedShippoRate.amount,
            shippo_shipping_provider: selectedShippoRate.provider,
            shippo_shipping_service: selectedShippoRate.service,
            shippo_shipping_estimated_days: selectedShippoRate.estimatedDays,
            shippo_shipping_free: selectedShippoRate.freeShipping,
            shippo_rate_id: selectedShippoRate.id,
          } : {}),
        },
      })

      // 3. Add shipping method
      let sqShippingAdded = false
      try {
        const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id })
        if (shipping_options?.length) {
          const sorted = [...shipping_options].sort((a: any, b: any) => {
            const aCalc = a.price_type === "calculated" ? 0 : 1
            const bCalc = b.price_type === "calculated" ? 0 : 1
            return aCalc - bCalc
          })
          for (const opt of sorted) {
            try {
              await sdk.store.cart.addShippingMethod(cart.id, { option_id: opt.id })
              sqShippingAdded = true
              break
            } catch { /* Try next */ }
          }
        }
      } catch (shippingErr: any) {
        console.warn("Shipping method error:", shippingErr?.message)
      }

      if (!sqShippingAdded) {
        throw new Error("Unable to set up shipping for your address. Please check your address and try again, or contact support.")
      }

      // 4. Initiate payment session + complete cart
      await sdk.store.payment.initiatePaymentSession(cart as any, { provider_id: "pp_system_default" })
      const completedCart = await sdk.store.cart.complete(cart.id)

      // 4b. Auto-capture payment (Square already charged — mark as paid in Medusa)
      const completedOrderId = (completedCart as any)?.order?.id
      if (completedOrderId) {
        try {
          const captureRes = await fetch("/api/orders/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: completedOrderId }),
          })
          if (!captureRes.ok) {
            console.error("Payment capture failed for order:", completedOrderId)
          }
        } catch (captureErr) {
          console.error("Payment capture error:", captureErr)
        }
      }

      // 5. Save customer address if first time
      if (customer?.id) {
        try {
          const { addresses } = await sdk.store.customer.listAddress({ limit: 10 }) as any
          const alreadyHas = (addresses || []).some((a: any) =>
            a.address_1 === form.address_1 && a.postal_code === form.postal_code
          )
          if (!alreadyHas) {
            await sdk.store.customer.createAddress({
              first_name,
              last_name,
              address_1: form.address_1,
              address_2: form.address_2 || undefined,
              city: form.city,
              province: form.province,
              postal_code: form.postal_code,
              country_code: countryCode,
              phone: form.phone || undefined,
              is_default_shipping: (addresses || []).length === 0,
            })
          }
        } catch {
          // Don't block order if address save fails
        }
      }

      // 6. Track purchase + redirect
      trackPurchase({
        transactionId: (completedCart as any)?.order?.id || cart.id,
        value: calculatedTotal,
        currency: currencyCode.toUpperCase(),
        shipping: shippingCost,
        tax: tax,
        items: items.map((item: any) => ({
          id: item.product_id || item.id,
          name: item.product_title || "",
          price: item.unit_price ?? 0,
          quantity: item.quantity,
        })),
      })

      localStorage.removeItem("medusa_cart_id")
      try { localStorage.removeItem("checkout_form") } catch {}
      router.push("/checkout/success")
    } catch (err: any) {
      if (paymentCharged) {
        setError("Your payment was processed but we had trouble completing the order. Please contact support@peptidesfarma.com. Do NOT retry payment. Reference: " + (cart?.id || ""))
      } else {
        setError(extractError(err, "Order failed. Please try again."))
      }
      setSubmitting(false)
    }
  }

  const handleSquareError = (errorMsg: string) => {
    setError(errorMsg)
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-[16px] p-4 text-[14px]">{error}</div>}

      <DisclaimerSection agreed={agreed} setAgreed={setAgreed} />

      <SquareCardForm
        amount={Math.round(calculatedTotal * 100)}
        onPaymentComplete={handleSquarePayment}
        onError={handleSquareError}
        disabled={!bothAgreed || submitting}
      />

      {submitting && (
        <div className="flex items-center justify-center gap-2 text-[14px] text-[#383637]/72 py-2">
          <svg className="animate-spin h-5 w-5 text-[#2A4A8C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Completing your order...</span>
        </div>
      )}
    </div>
  )
}

// ── Stripe Hosted Checkout (redirect to Stripe page) ──
function StripeCheckoutButton({
  calculatedTotal,
  currencyCode,
  form,
  cart,
  selectedShippoRate,
  customer,
  agreed,
}: any) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bothAgreed = agreed[0] && agreed[1]

  const handleStripeCheckout = async () => {
    if (!cart || !bothAgreed || submitting) return
    if (!form.postal_code?.trim()) { setError("Please enter a postal/ZIP code."); return }
    if (!form.address_1?.trim() || !form.city?.trim()) { setError("Please fill in your full shipping address."); return }

    setSubmitting(true)
    setError(null)

    try {
      // Single server-side call — all Medusa + Stripe calls happen on Vercel
      const res = await fetch("/api/checkout/prepare-stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          form,
          selectedShippoRate,
          calculatedTotal,
          currencyCode,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error || "Failed to start checkout. Please try again.")
        setSubmitting(false)
        return
      }

      // Save backup to sessionStorage
      sessionStorage.setItem("stripe_checkout_data", JSON.stringify({
        form, selectedShippoRate, customerId: customer?.id || null,
      }))

      // Redirect to Stripe hosted checkout page
      window.location.href = data.url
    } catch (err: any) {
      setError(extractError(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-[16px] p-4 text-[14px]">{error}</div>}

      <button
        type="button"
        onClick={handleStripeCheckout}
        disabled={!bothAgreed || submitting}
        className="w-full h-[52px] flex items-center justify-center gap-2 rounded-[110px] text-[16px] font-bold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
      >
        {submitting ? (
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
          </svg>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Complete Order
          </>
        )}
      </button>
    </div>
  )
}

// ── Summary Item with per-item loading ──
function SummaryItem({ item, currencyCode, updateItem, removeItem }: { item: any; currencyCode: string; updateItem: (id: string, qty: number) => Promise<void>; removeItem: (id: string) => Promise<void> }) {
  const [busy, setBusy] = useState(false)

  const handleUpdate = async (qty: number) => {
    setBusy(true)
    try { await updateItem(item.id, qty) } finally { setBusy(false) }
  }
  const handleRemove = async () => {
    setBusy(true)
    try { await removeItem(item.id) } finally { setBusy(false) }
  }

  return (
    <div key={item.id} className={`flex gap-3 py-2 border-b border-[#E5E5E5]/60 transition-opacity ${busy ? "opacity-50" : ""}`}>
      <div className="w-14 h-14 rounded-[8px] bg-[#F2F7FD] overflow-hidden shrink-0 relative">
        {item.thumbnail && <Image src={item.thumbnail} alt="" fill className="object-cover" sizes="56px" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[14px] font-medium text-[#242424] line-clamp-1">{item.product_title}</p>
            {item.variant_title && <p className="text-[12px] text-[#888]">{item.variant_title}</p>}
            <p className="text-[12px] text-[#999]">{formatPrice(item.unit_price ?? 0, currencyCode)} each</p>
          </div>
          <p className="text-[15px] font-semibold text-[#242424] shrink-0">{formatPrice((item.unit_price ?? 0) * item.quantity, currencyCode)}</p>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="inline-flex items-center border border-[#E5E5E5] rounded-lg overflow-hidden">
            <button
              type="button"
              disabled={busy}
              onClick={() => item.quantity > 1 ? handleUpdate(item.quantity - 1) : handleRemove()}
              className="w-7 h-7 flex items-center justify-center text-[#555] hover:bg-[#F5F5F5] transition-colors text-[14px] font-medium disabled:opacity-40"
            >
              {item.quantity === 1 ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /></svg>
              ) : "−"}
            </button>
            <span className="w-7 h-7 flex items-center justify-center text-[13px] font-medium text-[#242424] border-x border-[#E5E5E5]">
              {busy ? (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#D1D5DB" strokeWidth="2.5" /><path d="M12 2a10 10 0 019.8 7.8" stroke="#4F8AF7" strokeWidth="2.5" strokeLinecap="round" /></svg>
              ) : item.quantity}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleUpdate(item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-[#555] hover:bg-[#F5F5F5] transition-colors text-[14px] font-medium disabled:opacity-40"
            >
              +
            </button>
          </div>
          {!!(item as any).metadata?.subscription && (
            <span className="text-[10px] font-medium text-[#4F8AF7] bg-[#4F8AF7]/10 px-1.5 py-0.5 rounded-full">Monthly</span>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={handleRemove}
            className="ml-auto text-[12px] text-[#999] hover:text-red-500 transition-colors disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

function CheckoutPageInner() {
  const router = useRouter()
  const { cart, isLoading, refreshCart, updateItem, removeItem } = useCart()
  const { customer } = useAuth()
  // If returning from vulaskin (cancel), skip to payment step and restore shipping state
  const isResume = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("resume") === "1"
  // Quiklie S2S card payments — LIVE for all customers
  const useQuiklie = true
  const [step, setStep] = useState<1 | 2 | 3>(isResume ? 3 : 1)
  const [shippingRates, setShippingRates] = useState<any[]>(() => {
    if (!isResume || typeof window === "undefined") return []
    try { return JSON.parse(sessionStorage.getItem("checkout_shipping_rates") || "[]") } catch { return [] }
  })
  const [selectedRate, setSelectedRate] = useState<string | null>(() => {
    if (!isResume || typeof window === "undefined") return null
    return sessionStorage.getItem("checkout_selected_rate") || null
  })
  const [loadingRates, setLoadingRates] = useState(false)
  const [ratesPending, setRatesPending] = useState(false)
  // Stripe hidden — account suspended. Venmo only for now.
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "venmo">("stripe")
  const [agreed, setAgreed] = useState<[boolean, boolean]>([false, false])
  const [stepError, setStepError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const step2Ref = useRef<HTMLDivElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)

  // If cart is already completed, clear it and redirect to success
  useEffect(() => {
    if (cart && (cart as any).completed_at) {
      localStorage.removeItem("medusa_cart_id")
      router.replace("/checkout/success")
    }
  }, [cart, router])

  // Pre-fill from sessionStorage (persists across step navigation / page reload)
  type CheckoutForm = { email: string; full_name: string; address_1: string; address_2: string; city: string; province: string; postal_code: string; phone: string; country_code: string }
  const [form, setForm] = useState<CheckoutForm>(() => {
    const defaults: CheckoutForm = { email: "", full_name: "", address_1: "", address_2: "", city: "", province: "", postal_code: "", phone: "", country_code: "us" }
    if (typeof window === "undefined") return defaults
    try {
      const saved = localStorage.getItem("checkout_form")
      if (saved) return { ...defaults, ...JSON.parse(saved) }
    } catch {}
    return defaults
  })
  // Autofill from logged-in customer's last order
  const [showLoginPrompt, setShowLoginPrompt] = useState(!customer && !form.email)
  useEffect(() => {
    if (!customer) return
    // If form is already filled, don't overwrite
    if (form.address_1) return

    // Pre-fill email and name from customer profile
    const prefill: Partial<CheckoutForm> = {}
    if (customer.email && !form.email) prefill.email = customer.email
    if (customer.first_name && !form.full_name) {
      prefill.full_name = [customer.first_name, customer.last_name].filter(Boolean).join(" ")
    }
    if (customer.phone && !form.phone) prefill.phone = customer.phone

    // Fetch last order's shipping address for address autofill
    sdk.store.order.list({ limit: 1, order: "-created_at", fields: "+shipping_address.*" })
      .then(({ orders }) => {
        const addr = (orders?.[0] as any)?.shipping_address
        if (addr?.address_1) {
          prefill.address_1 = addr.address_1
          prefill.address_2 = addr.address_2 || ""
          prefill.city = addr.city || ""
          prefill.province = addr.province || ""
          prefill.postal_code = addr.postal_code || ""
          prefill.country_code = (addr.country_code || "us").toLowerCase()
          if (!prefill.phone && addr.phone) prefill.phone = addr.phone
          if (!prefill.full_name && addr.first_name) {
            prefill.full_name = [addr.first_name, addr.last_name].filter(Boolean).join(" ")
          }
        }
        if (Object.keys(prefill).length > 0) {
          setForm(prev => ({ ...prev, ...prefill }))
        }
      })
      .catch(() => {
        // No orders yet — just use profile data
        if (Object.keys(prefill).length > 0) {
          setForm(prev => ({ ...prev, ...prefill }))
        }
      })

    setShowLoginPrompt(false)
  }, [customer])

  // Persist form to sessionStorage on every change
  useEffect(() => {
    try { localStorage.setItem("checkout_form", JSON.stringify(form)) } catch {}
  }, [form])

  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [addressLoaded, setAddressLoaded] = useState(false)

  // Fetch saved addresses and auto-fill
  useEffect(() => {
    if (!customer || addressLoaded) return
    setAddressLoaded(true)

    // Fill email + name immediately
    setForm((prev) => ({
      ...prev,
      email: prev.email || customer.email || "",
      full_name: prev.full_name || [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "",
      phone: prev.phone || (customer as any).phone || "",
    }))

    // Fetch saved addresses from Medusa
    sdk.store.customer.listAddress({ limit: 10 })
      .then(({ addresses }: any) => {
        if (!addresses?.length) return
        setSavedAddresses(addresses)

        // Auto-fill from default or first address
        const defaultAddr = addresses.find((a: any) => a.is_default_shipping) || addresses[0]
        if (defaultAddr) {
          setForm((prev) => ({
            ...prev,
            full_name: prev.full_name || [defaultAddr.first_name, defaultAddr.last_name].filter(Boolean).join(" ") || prev.full_name,
            address_1: prev.address_1 || defaultAddr.address_1 || "",
            address_2: prev.address_2 || defaultAddr.address_2 || "",
            city: prev.city || defaultAddr.city || "",
            province: prev.province || defaultAddr.province || "",
            postal_code: prev.postal_code || defaultAddr.postal_code || "",
            phone: prev.phone || defaultAddr.phone || "",
            country_code: prev.country_code || defaultAddr.country_code || "us",
          }))
        }
      })
      .catch(() => {})
  }, [customer, addressLoaded])


  const selectAddress = useCallback((addr: any) => {
    setForm((prev) => ({
      ...prev,
      full_name: [addr.first_name, addr.last_name].filter(Boolean).join(" ") || prev.full_name,
      address_1: addr.address_1 || "",
      address_2: addr.address_2 || "",
      city: addr.city || "",
      province: addr.province || "",
      postal_code: addr.postal_code || "",
      phone: addr.phone || prev.phone,
      country_code: addr.country_code || prev.country_code || "us",
    }))
    ratesFetchedForZip.current = ""
  }, [])

  const items = cart?.items ?? []
  const subtotal = cart?.subtotal ?? 0
  const discount = cart?.discount_total ?? 0
  const currencyCode = cart?.currency_code ?? "usd"

  // Tax calculation via Zip-Tax API
  const [taxRate, setTaxRate] = useState(0)
  const [taxJurisdiction, setTaxJurisdiction] = useState("")
  const taxFetchedForZip = useRef("")
  useEffect(() => {
    const zip = form.postal_code?.trim()
    if (!zip || zip.length < 5 || zip === taxFetchedForZip.current) return
    taxFetchedForZip.current = zip

    const address = [form.address_1, form.city, form.province, zip].filter(Boolean).join(" ")
    fetch(`/api/tax?address=${encodeURIComponent(address)}`)
      .then(r => r.json())
      .then(data => {
        if (data.rate > 0) {
          setTaxRate(data.rate)
          const jur = data.jurisdiction
          setTaxJurisdiction(jur?.city && jur.city !== jur.state ? `${jur.city}, ${jur.state}` : jur?.state || "")
        } else {
          setTaxRate(0)
          setTaxJurisdiction("")
        }
      })
      .catch(() => {
        setTaxRate(0)
        setTaxJurisdiction("")
      })
  }, [form.postal_code, form.address_1, form.city, form.province])

  const tax = Math.round(subtotal * taxRate * 100) / 100

  // Get applied promo code from cart (so coupon persists across pages)
  const appliedPromoCode = (() => {
    const promos = (cart as any)?.promotions || []
    if (promos.length > 0) return promos[0].code || null
    // Also check adjustments for promo codes
    for (const item of items) {
      const adjs = (item as any).adjustments || []
      for (const adj of adjs) {
        if (adj.code) return adj.code
      }
    }
    return null
  })()

  // Detect subscription items
  const subscriptionItems = items.filter((item) => !!(item as any).metadata?.subscription)
  const hasSubscription = subscriptionItems.length > 0

  // Re-apply free-shipping client-side from current cart subtotal.
  // Prevents stale "paid" rates when the API was called before cart hydrated
  // (e.g., after browser-back from Vula). Monotonic: only flips false → true,
  // never the other way; matches lib/constants thresholds the API uses.
  const isDomestic = (form.country_code || "us").toLowerCase() === "us"
  const displayedRates = useMemo(() => shippingRates.map((r: any) => {
    if (r.freeShipping) return r
    if (!isDomestic) return r
    const token = (r.token || "").toLowerCase()
    const service = String(r.service || "")
    const isStd  = token === "ups_ground"           || service.includes("Ground")
    const is2Day = token === "usps_priority"        || token === "ups_second_day_air"
                || service.includes("Priority")     || service.includes("2nd Day")
    const shouldBeFree =
      (isStd  && subtotal >= FREE_STANDARD_THRESHOLD) ||
      (is2Day && subtotal >= FREE_2DAY_THRESHOLD)
    return shouldBeFree ? { ...r, amount: 0, freeShipping: true } : r
  }), [shippingRates, subtotal, isDomestic])

  const selectedShippoRate = displayedRates.find((r: any) => r.id === selectedRate)
  // Promo codes that also grant free shipping (handled in UI since Shippo rates bypass Medusa shipping discounts)
  const FREE_SHIPPING_PROMO_CODES = ["testorder100"]
  const hasFreeShippingPromo = ((cart as any)?.promotions || []).some(
    (p: any) => FREE_SHIPPING_PROMO_CODES.includes(p.code?.toLowerCase())
  )
  // Free shipping for internal test product (test-order-qa)
  const hasTestProduct = items.some((i: any) => i.product_handle === "test-order-qa" || i.product_title === "Test Order QA")
  const shippingCost = (hasFreeShippingPromo || hasTestProduct) ? 0 : (selectedShippoRate ? selectedShippoRate.amount : (cart?.shipping_total ?? 0))
  // Venmo 5% discount + @valtosi deep link — LIVE for all customers
  const useNewVenmo = true
  const venmoDiscountRate = (useNewVenmo && paymentMethod === "venmo") ? 0.05 : 0
  const venmoDiscountAmount = Math.round((subtotal - discount) * venmoDiscountRate * 100) / 100
  const calculatedTotal = subtotal + shippingCost + tax - discount - venmoDiscountAmount

  // Detect when optimistic item totals don't match cart subtotal (API still in-flight)
  const optimisticSubtotal = items.reduce((sum, i) => sum + (i.unit_price ?? 0) * i.quantity, 0)
  const totalsStale = optimisticSubtotal !== subtotal

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (stepError) setStepError(null)
  }

  // Fetch shipping rates from Shippo
  const ratesFetchedForZip = useRef("")
  const resumeRatesUsed = useRef(false)
  useEffect(() => {
    if (!form.postal_code || form.postal_code.length < 3) { setRatesPending(false); return }
    const cacheKey = `${form.country_code}:${form.postal_code}`
    if (ratesFetchedForZip.current === cacheKey) { setRatesPending(false); return }
    // On resume with restored rates, mark as fetched and skip the first re-fetch
    if (isResume && shippingRates.length > 0 && !resumeRatesUsed.current) {
      resumeRatesUsed.current = true
      ratesFetchedForZip.current = cacheKey
      setRatesPending(false)
      return
    }
    // Country or zip changed — clear stale rates immediately
    setShippingRates([])
    setSelectedRate(null)
    setRatesPending(true)
    const timer = setTimeout(async () => {
      ratesFetchedForZip.current = cacheKey
      setRatesPending(false)
      setLoadingRates(true)
      try {
        const res = await fetch("/api/shipping-rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: { name: form.full_name, address_1: form.address_1, address_2: form.address_2 || undefined, city: form.city, province: form.province, postal_code: form.postal_code, country_code: form.country_code || "us" },
            items: items.map((item) => ({ quantity: item.quantity })),
            subtotal,
          }),
        })
        const data = await res.json()
        if (data.rates?.length) {
          setShippingRates(data.rates)
          setSelectedRate(data.rates[0].id)
        }
      } catch {
        // Network or parsing error — ignore
      } finally {
        setLoadingRates(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.postal_code, form.country_code])

  // GA tracking
  const hasTracked = useRef(false)
  useEffect(() => {
    if (items.length > 0 && !hasTracked.current) {
      hasTracked.current = true
      trackBeginCheckout(items.map((item) => ({ id: item.product_id || item.id, name: item.product_title || "", price: item.unit_price ?? 0, quantity: item.quantity })), currencyCode.toUpperCase(), calculatedTotal)
    }
  }, [items, currencyCode, calculatedTotal])

  // Validate step 1 (address) and go to step 2 (delivery)
  const handleContinueToDelivery = () => {
    setStepError(null)

    if (!form.email?.trim()) {
      setStepError("Please enter your email address.")
      return
    }
    if (!form.full_name?.trim()) {
      setStepError("Please enter your full name.")
      return
    }
    const errors: Record<string, string> = {}
    if (!form.address_1?.trim()) errors.address_1 = "Street address is required."
    if (!form.city?.trim()) errors.city = "City is required."
    if (form.country_code === "us" && !form.province?.trim()) errors.province = "State is required."
    if (!form.postal_code?.trim()) errors.postal_code = "ZIP / postal code is required."
    if (!form.phone?.trim()) {
      errors.phone = "Phone number is required."
    } else {
      const digitsOnly = form.phone.replace(/\D/g, "")
      const isUS = (form.country_code || "us").toLowerCase() === "us"
      if (isUS && digitsOnly.length !== 10 && digitsOnly.length !== 11) {
        errors.phone = "Enter a valid 10-digit US phone number."
      } else if (!isUS && digitsOnly.length < 7) {
        errors.phone = "Enter a valid phone number."
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setStepError(null)
      const firstErrorField = document.querySelector(`[name="${Object.keys(errors)[0]}"]`)
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setFieldErrors({})

    // Block step 1 until shipping rates are resolved
    if (loadingRates || ratesPending) {
      setStepError("Please wait — we're calculating shipping rates for your address.")
      return
    }
    if (shippingRates.length === 0) {
      setStepError("No shipping options available for this address. Please check your address and ZIP code and try again.")
      return
    }

    setStep(2)
    setTimeout(() => step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
  }

  // Validate step 2 (delivery) and go to step 3 (payment)
  const handleContinueToPayment = () => {
    setStepError(null)

    if (!selectedRate && shippingRates.length > 0) {
      setStepError("Please select a shipping method.")
      return
    }
    if (shippingRates.length === 0 && !loadingRates && !ratesPending) {
      setStepError("No shipping options available. Please go back and check your address.")
      return
    }

    setStep(3)
    setTimeout(() => step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F8AF7]" /></div>
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 lg:px-20 py-20 text-center">
        <p className="text-[18px] text-[#333] mb-6">Your cart is empty</p>
        <Link href="/products" className="inline-flex items-center justify-center h-[48px] px-8 rounded-[110px] text-[16px] font-bold text-white" style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}>Continue Shopping</Link>
      </div>
    )
  }

  // Block checkout if cart ONLY contains BAC Water (no peptides)
  const onlyBacWater = items.every((item) =>
    (item as any).product_handle === "bac-water" || item.product_title?.toLowerCase().includes("bac water")
  )
  if (onlyBacWater) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 lg:px-20 py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="text-[22px] font-bold text-[#242424] mb-3">BAC Water requires a peptide order</h2>
          <p className="text-[15px] text-[#555] mb-6 leading-relaxed">BAC Water is an add-on product and cannot be purchased on its own. Please add a peptide to your cart first.</p>
          <Link href="/products" className="inline-flex items-center justify-center h-[48px] px-8 rounded-[110px] text-[16px] font-bold text-white" style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}>Browse Peptides</Link>
        </div>
      </div>
    )
  }

  // ── Order Summary Sidebar (shared by both steps) ──
  const OrderSummary = (
    <div className="w-full lg:w-[420px] shrink-0">
      <div className="flex flex-col gap-3 p-5 rounded-[16px] border-2 sticky top-8" style={{ background: "linear-gradient(95deg, rgba(17,92,111,0.08) 16%, rgba(54,132,142,0.08) 69%), #fff", borderColor: "rgba(144,183,188,0.08)" }}>
        <h2 className="text-[22px] font-semibold text-[#242424]">Summary</h2>
        {items.map((item) => (
          <SummaryItem key={item.id} item={item} currencyCode={currencyCode} updateItem={updateItem} removeItem={removeItem} />
        ))}
        <BacWaterUpsell />
        <div className="flex justify-between text-[14px] text-[#555] pt-2">
          <span>Subtotal</span>
          <span className={`font-semibold text-[#242424] transition-opacity ${totalsStale ? "animate-pulse" : ""}`}>
            {formatPrice(totalsStale ? optimisticSubtotal : subtotal, currencyCode)}
          </span>
        </div>
        <div className="flex justify-between text-[14px] text-[#555]">
          <span>Shipping{selectedShippoRate && <span className="text-[11px] text-[#999] ml-1">({selectedShippoRate.service})</span>}</span>
          <span className={`font-semibold ${hasFreeShippingPromo ? "text-green-600" : "text-[#242424]"} ${totalsStale ? "animate-pulse" : ""}`}>{hasFreeShippingPromo ? "Free" : shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : "\u2014"}</span>
        </div>
        <div className="flex justify-between text-[14px] text-[#555]">
          <span>Tax</span>
          <span className={`font-semibold text-[#242424] ${totalsStale ? "animate-pulse" : ""}`}>{tax > 0 ? `$${tax.toFixed(2)}` : form.postal_code?.length >= 5 ? "$0.00" : "\u2014"}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[14px] text-[#16a34a]">
            <span>Discount{appliedPromoCode ? ` (${appliedPromoCode})` : ""}</span>
            <span className={`font-semibold ${totalsStale ? "animate-pulse" : ""}`}>-{formatPrice(discount, currencyCode)}</span>
          </div>
        )}
        {venmoDiscountAmount > 0 && (
          <div className="flex justify-between text-[14px] text-[#16a34a]">
            <span>Venmo Discount (5%)</span>
            <span className="font-semibold">-${venmoDiscountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="h-px bg-[#DAD0CD]/60" />
        <div className="flex justify-between">
          <span className="text-[20px] font-semibold text-[#242424]">Total</span>
          <span className={`text-[20px] font-semibold text-[#4F8AF7] ${totalsStale ? "animate-pulse" : ""}`}>
            {formatPrice(totalsStale ? (optimisticSubtotal + shippingCost + tax - discount) : calculatedTotal, currencyCode)}
          </span>
        </div>
        {hasSubscription && (
          <p className="text-[12px] text-[#4F8AF7] font-medium">Includes monthly subscription — renews automatically.</p>
        )}

        {/* Coupon input in summary */}
        {step < 3 && cart?.id && (
          <div className="pt-2 border-t border-[#DAD0CD]/60">
            <CouponInput cartId={cart.id} onApplied={() => { if (cart?.id) refreshCart(cart.id) }} initialCode={appliedPromoCode} />
          </div>
        )}

        {/* Premium Protections */}
        <div className="mt-4 pt-4 border-t border-[#DAD0CD]/60">
          <h3 className="text-[16px] font-bold text-[#242424] mb-0.5">Premium Protections</h3>
          <p className="text-[12px] text-[#777] mb-3">We offer an upgraded service for loyal customers.</p>
          <div className="flex items-start gap-0">
            {[
              { label: "Enhanced delivery coverage", icon: <CiDeliveryTruck size={24} color="#4F8AF7" /> },
              { label: "Express support", icon: <CiHeadphones size={24} color="#4F8AF7" /> },
              { label: "Money-back guarantee", icon: <PiCurrencyDollarLight size={24} color="#4F8AF7" /> },
              { label: "Secure payments", icon: <IoIosCheckboxOutline size={24} color="#4F8AF7" /> },
            ].map((item, i) => (
              <Fragment key={i}>
                {i > 0 && <div className="w-px self-stretch bg-[#E5E5E5] shrink-0 mx-1" />}
                <div className="flex flex-col items-center text-center min-w-[70px] flex-1 px-1">
                  <div className="mb-1.5">{item.icon}</div>
                  <span className="text-[10px] leading-[13px] font-medium text-[#555]">{item.label}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-20 py-8 lg:py-20">
      <h1 className="text-[32px] lg:text-[48px] font-bold tracking-[-0.03em] text-[#141414] mb-2">Checkout</h1>
      <p className="text-[16px] lg:text-[18px] text-[#333] mb-4">Complete your purchase securely</p>

      <ProgressBar step={step} />

      <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-10">
        <div className="flex-1 max-w-[633px] flex flex-col rounded-[20px] border border-[#242424]/8 overflow-hidden">

          {/* ═══════════════════════════════════════════════ */}
          {/* STEP 1: SHIPPING ADDRESS                       */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="p-6">
            <SectionHeader number={1} title="Shipping Address" completed={step > 1} onEdit={step > 1 ? () => { setStep(1); setStepError(null) } : undefined} />

            {/* Login prompt for guest users */}
            {step === 1 && showLoginPrompt && !customer && (
              <div className="flex items-center justify-between p-4 mt-4 rounded-[12px] border border-[#4F8AF7]/20 bg-[#4F8AF7]/5">
                <div>
                  <p className="text-[14px] font-semibold text-[#242424]">Have an account?</p>
                  <p className="text-[12px] text-[#666]">Log in to autofill your address</p>
                </div>
                <Link
                  href="/auth/login?redirect=/checkout"
                  className="flex items-center justify-center px-5 py-2 rounded-[110px] bg-[#4F8AF7] text-white text-[13px] font-bold hover:opacity-90 transition-opacity"
                >
                  Log in
                </Link>
              </div>
            )}

            {/* Active: Address Form */}
            {step === 1 && (
              <div className="flex flex-col gap-4 mt-5">
                {savedAddresses.length > 1 && (
                  <div className="flex flex-col gap-2">
                    <label className={LABEL_CLASS}>Saved addresses</label>
                    <div className="flex flex-col gap-2">
                      {savedAddresses.map((addr: any) => {
                        const addrLine = [addr.address_1, addr.city, addr.province, addr.postal_code].filter(Boolean).join(", ")
                        const name = [addr.first_name, addr.last_name].filter(Boolean).join(" ")
                        const isSelected = form.address_1 === addr.address_1 && form.postal_code === addr.postal_code
                        return (
                          <div key={addr.id} className={`flex items-center gap-2 p-3 rounded-[12px] border-2 transition-colors ${isSelected ? "border-[#4F8AF7] bg-[#4F8AF7]/5" : "border-[#242424]/8 hover:border-[#4F8AF7]/40"}`}>
                            <button
                              type="button"
                              onClick={() => selectAddress(addr)}
                              className="flex flex-col items-start text-left flex-1 min-w-0"
                            >
                              <span className="text-[14px] font-semibold text-[#242424]">{name}</span>
                              <span className="text-[13px] text-[#666] truncate w-full">{addrLine}</span>
                            </button>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation()
                                try {
                                  await sdk.store.customer.deleteAddress(addr.id)
                                  setSavedAddresses((prev) => prev.filter((a: any) => a.id !== addr.id))
                                } catch {}
                              }}
                              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-[#999] hover:text-red-500 transition-colors"
                              title="Delete address"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /></svg>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className={LABEL_CLASS}>Email</label>
                    <input type="email" name="email" autoComplete="shipping email" required value={form.email} onChange={handleChange} placeholder="Email address" className={INPUT_CLASS} />
                  </div>
                  {/* Hidden dummy field to prevent password managers from autofilling the name field */}
                  <input type="text" name="username" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden="true" />
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className={LABEL_CLASS}>Full name</label>
                    <input type="text" name="full_name" autoComplete="shipping name" required value={form.full_name} onChange={handleChange} placeholder="Full name" className={INPUT_CLASS} />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className={LABEL_CLASS}>Street address</label>
                    <AddressAutocomplete
                      value={form.address_1}
                      onChange={(val) => { setForm((prev) => ({ ...prev, address_1: val })); setFieldErrors((p) => ({ ...p, address_1: "" })) }}
                      onSelect={(addr) => {
                        const stateMap: Record<string, string> = {"Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT","Delaware":"DE","Florida":"FL","Georgia":"GA","Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY","District of Columbia":"DC"}
                        const rawState = addr.province || ""
                        const mappedState = stateMap[rawState] || (rawState.length === 2 ? rawState.toUpperCase() : "")
                        setForm((prev) => ({ ...prev, address_1: addr.address_1, city: addr.city || prev.city, province: mappedState || prev.province, postal_code: addr.postal_code || prev.postal_code }))
                        setFieldErrors({})
                      }}
                      placeholder="Start typing your address..."
                      className={`${INPUT_CLASS} ${fieldErrors.address_1 ? "!border-red-400" : ""}`}
                      countryCode={form.country_code}
                    />
                    {fieldErrors.address_1 && <p className="text-red-500 text-[12px] mt-0.5">{fieldErrors.address_1}</p>}
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className={LABEL_CLASS}>Apartment, suite, etc. (optional)</label>
                    <input type="text" name="address_2" autoComplete="address-line2" value={form.address_2} onChange={handleChange} placeholder="Apt, suite, unit, building, floor, etc." className={INPUT_CLASS} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={LABEL_CLASS}>City</label>
                    <input type="text" name="city" autoComplete="address-level2" required value={form.city} onChange={(e) => { handleChange(e); setFieldErrors((p) => ({ ...p, city: "" })) }} placeholder="City" className={`${INPUT_CLASS} ${fieldErrors.city ? "!border-red-400" : ""}`} />
                    {fieldErrors.city && <p className="text-red-500 text-[12px] mt-0.5">{fieldErrors.city}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={LABEL_CLASS}>State / Province</label>
                    {form.country_code === "us" ? (
                      <select name="province" autoComplete="address-level1" required value={form.province} onChange={(e) => { setForm((prev) => ({ ...prev, province: e.target.value })); setFieldErrors((p) => ({ ...p, province: "" })) }} className={`${INPUT_CLASS} ${fieldErrors.province ? "!border-red-400" : ""}`}>
                        <option value="">Select state</option>
                        {["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <input type="text" name="province" autoComplete="address-level1" value={form.province} onChange={handleChange} placeholder="State / Province" className={INPUT_CLASS} />
                    )}
                    {fieldErrors.province && <p className="text-red-500 text-[12px] mt-0.5">{fieldErrors.province}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={LABEL_CLASS}>ZIP / Postal Code</label>
                    <input type="text" name="postal_code" autoComplete="postal-code" required maxLength={12} value={form.postal_code} onChange={(e) => { handleChange(e); setFieldErrors((p) => ({ ...p, postal_code: "" })) }} placeholder="ZIP / Postal code" className={`${INPUT_CLASS} ${fieldErrors.postal_code ? "!border-red-400" : ""}`} />
                    {fieldErrors.postal_code && <p className="text-red-500 text-[12px] mt-0.5">{fieldErrors.postal_code}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={LABEL_CLASS}>Country</label>
                    <select name="country_code" autoComplete="country" required value={form.country_code} onChange={(e) => { setForm((prev) => ({ ...prev, country_code: e.target.value, province: "" })); ratesFetchedForZip.current = "" }} className={INPUT_CLASS}>
                      <option value="us">United States</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={LABEL_CLASS}>Phone</label>
                    <input type="tel" name="phone" autoComplete="tel" required value={form.phone} onChange={(e) => {
                      // Auto-format US phone: 123-456-7890
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                      let formatted = digits
                      if (digits.length > 6) formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
                      else if (digits.length > 3) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
                      setForm((prev) => ({ ...prev, phone: formatted }))
                      setFieldErrors((p) => ({ ...p, phone: "" }))
                    }} placeholder="123-456-7890" maxLength={12} className={`${INPUT_CLASS} ${fieldErrors.phone ? "!border-red-400" : ""}`} />
                    {fieldErrors.phone && <p className="text-red-500 text-[12px] mt-0.5">{fieldErrors.phone}</p>}
                  </div>
                </div>

                {stepError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-[16px] p-4 text-[14px]">{stepError}</div>
                )}

                <button
                  type="button"
                  onClick={handleContinueToDelivery}
                  className="w-full h-[52px] flex items-center justify-center gap-2 rounded-[110px] text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
                  disabled={loadingRates || ratesPending}
                >
                  {(loadingRates || ratesPending) ? (
                    <>
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" /><path d="M12 2a10 10 0 019.8 7.8" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
                      Calculating shipping...
                    </>
                  ) : (
                    <>
                      Continue to Delivery
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                        <path d="M6 3l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Completed: Summary */}
            {step > 1 && (
              <div className="flex flex-col gap-3 mt-4">
                <div className="rounded-[12px] bg-[#F9FAFB] p-4 flex flex-col gap-1">
                  <p className="text-[14px] font-semibold text-[#242424] mb-1">Shipping Address</p>
                  <p className="text-[14px] text-[#555]">{form.full_name}</p>
                  <p className="text-[14px] text-[#555]">{form.address_1}{form.address_2 ? `, ${form.address_2}` : ""}</p>
                  <p className="text-[14px] text-[#555]">{form.city}{form.province ? `, ${form.province}` : ""} {form.postal_code}</p>
                  <p className="text-[14px] text-[#555]">{form.country_code.toUpperCase()}</p>
                </div>
                <div className="rounded-[12px] bg-[#F9FAFB] p-4 flex flex-col gap-1">
                  <p className="text-[14px] font-semibold text-[#242424] mb-1">Contact</p>
                  <p className="text-[14px] text-[#555]">{form.phone}</p>
                  <p className="text-[14px] text-[#555]">{form.email}</p>
                  <p className="text-[12px] text-[#999] mt-1">Order confirmation, tracking & updates sent here.</p>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E5E5E5] mx-6" />

          {/* ═══════════════════════════════════════════════ */}
          {/* STEP 2: DELIVERY METHOD                        */}
          {/* ═══════════════════════════════════════════════ */}
          <div ref={step2Ref} className={`p-6 ${step < 2 ? "pointer-events-none" : ""}`}>
            <SectionHeader number={2} title="Delivery Method" completed={step > 2} onEdit={step > 2 ? () => { setStep(2); setStepError(null) } : undefined} dimmed={step < 2} />

            {/* Active: Shipping Rate Selection */}
            {step === 2 && (
              <div className="flex flex-col gap-4 mt-5">
                {loadingRates && (
                  <div className="flex items-center gap-2 text-[14px] text-[#383637]/60">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4F8AF7]" />
                    Calculating shipping rates...
                  </div>
                )}
                {ratesPending && !loadingRates && (
                  <div className="flex items-center gap-2 text-[14px] text-[#383637]/60">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4F8AF7]" />
                    Loading shipping options...
                  </div>
                )}
                {displayedRates.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {displayedRates.map((rate: any) => (
                      <label key={rate.id} className={`flex items-center justify-between p-3 rounded-[12px] border-2 cursor-pointer transition-colors ${selectedRate === rate.id ? "border-[#4F8AF7] bg-[#4F8AF7]/5" : "border-[#242424]/8 hover:border-[#4F8AF7]/40"}`} onClick={() => setSelectedRate(rate.id)}>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: selectedRate === rate.id ? "#4F8AF7" : "#ccc" }}>
                            {selectedRate === rate.id && <div className="w-2 h-2 rounded-full bg-[#4F8AF7]" />}
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#383637]">{rate.provider} {rate.service}</p>
                            <p className="text-[12px] text-[#383637]/60">{
                              rate.provider === "UPS" && rate.service?.includes("Ground") ? "3-5 business days"
                              : rate.provider === "USPS" && rate.service?.includes("Priority") ? "2-3 business days"
                              : rate.provider === "UPS" && rate.service?.includes("2nd Day") ? "2 business days"
                              : rate.estimatedDays ? `${rate.estimatedDays} business days` : ""
                            }</p>
                          </div>
                        </div>
                        {rate.freeShipping ? (
                          <span className="text-[14px] font-bold text-[#16a34a]">FREE</span>
                        ) : (
                          <span className="text-[15px] font-bold">${rate.amount.toFixed(2)}</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
                {!loadingRates && !ratesPending && displayedRates.length === 0 && (
                  <p className="text-[14px] text-[#555]">No shipping options available. Please go back and check your address.</p>
                )}

                {stepError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-[16px] p-4 text-[14px]">{stepError}</div>
                )}

                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  disabled={loadingRates || ratesPending || !selectedRate}
                  className="w-full h-[52px] flex items-center justify-center gap-2 rounded-[110px] text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
                >
                  {(loadingRates || ratesPending) ? "Calculating shipping..." : (!selectedRate && displayedRates.length === 0 && !loadingRates && !ratesPending) ? "No shipping available" : "Continue to Payment"}
                  {!(!selectedRate && displayedRates.length === 0 && !loadingRates && !ratesPending) && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <path d="M6 3l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {/* Completed: Delivery Summary */}
            {step > 2 && selectedShippoRate && (
              <div className="rounded-[12px] bg-[#F9FAFB] p-4 flex flex-col gap-1 mt-4">
                <p className="text-[14px] font-semibold text-[#242424] mb-1">Delivery Method</p>
                <p className="text-[14px] text-[#555]">
                  {selectedShippoRate.provider} {selectedShippoRate.service}
                  {selectedShippoRate.freeShipping ? " - Free" : ` - $${selectedShippoRate.amount.toFixed(2)}`}
                </p>
                {selectedShippoRate.estimatedDays && (
                  <p className="text-[14px] text-[#555]">{selectedShippoRate.estimatedDays} business days</p>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E5E5E5] mx-6" />

          {/* ═══════════════════════════════════════════════ */}
          {/* STEP 3: PAYMENT                                */}
          {/* ═══════════════════════════════════════════════ */}
          <div ref={step3Ref} className={`p-6 ${step < 3 ? "pointer-events-none" : ""}`}>
            <SectionHeader number={3} title="Payment" completed={false} dimmed={step < 3} />

            {step === 3 && (
              <div className="flex flex-col gap-4 mt-5">
                {/* Security badge */}
                <div className="flex items-center gap-2 text-[13px] text-[#555]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="#555" strokeWidth="1.5"/>
                    <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Secure checkout · 256-bit SSL
                </div>

                {/* Payment method selector */}
                <div className="flex flex-col gap-2">
                  {/* Credit / Debit Card */}
                  <label
                    aria-disabled={!useQuiklie}
                    onClick={useQuiklie ? () => setPaymentMethod("stripe") : (e) => e.preventDefault()}
                    className={`flex items-center gap-3 p-3.5 rounded-[12px] border-2 transition-colors ${
                      useQuiklie
                        ? paymentMethod === "stripe"
                          ? "border-[#4F8AF7] bg-[#4F8AF7]/5 cursor-pointer"
                          : "border-[#242424]/8 hover:border-[#4F8AF7]/40 cursor-pointer"
                        : "border-[#242424]/8 cursor-not-allowed opacity-60 select-none pointer-events-none"
                    }`}
                  >
                    <input type="radio" name="payment_method" checked={useQuiklie ? paymentMethod === "stripe" : false} readOnly disabled={!useQuiklie} className={`w-4 h-4 shrink-0 accent-[#4F8AF7] ${useQuiklie ? "cursor-pointer" : "cursor-not-allowed"}`} />
                    <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.5"/><path d="M2 10h20" stroke="white" strokeWidth="1.5"/><path d="M6 14h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[14px] font-semibold ${paymentMethod === "stripe" ? "text-[#0F0502]" : "text-[#383637]"}`}>Credit / Debit Card</span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Image src="/icons/Visa_Inc.-Logo.wine.svg" alt="Visa" width={40} height={26} />
                        <Image src="/icons/mastercard.svg" alt="Mastercard" width={32} height={22} />
                        <Image src="/icons/American_Express-Logo.wine.svg" alt="Amex" width={40} height={26} />
                        {!useQuiklie && <Image src="/icons/applepay.svg" alt="Apple Pay" width={36} height={22} />}
                        {!useQuiklie && <Image src="/icons/gpay.svg" alt="Google Pay" width={36} height={22} />}
                      </div>
                      {paymentMethod === "stripe" && (
                        <p className="text-[12px] text-[#383637]/60 mt-1">{useQuiklie ? "Secure card payment" : "Secure checkout via PayPal"}</p>
                      )}
                    </div>
                  </label>

                  {/* Venmo */}
                  <label
                    onClick={() => setPaymentMethod("venmo")}
                    className={`flex items-center gap-3 p-3.5 rounded-[12px] border-2 cursor-pointer transition-colors ${paymentMethod === "venmo" ? "border-[#4F8AF7] bg-[#4F8AF7]/5" : "border-[#242424]/8 hover:border-[#4F8AF7]/40"}`}
                  >
                    <input type="radio" name="payment_method" checked={paymentMethod === "venmo"} readOnly className="w-4 h-4 shrink-0 accent-[#4F8AF7] cursor-pointer" />
                    <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "#008CFF" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.5 3.6c.6 1 .9 2.1.9 3.4 0 4.2-3.6 9.6-6.5 13.4H7.8L5.4 3.3l5.2-.5 1.4 11.1c1.3-2.1 2.8-5.4 2.8-7.7 0-1.2-.2-2-.5-2.7l5.2-0.9z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[14px] font-semibold ${paymentMethod === "venmo" ? "text-[#0F0502]" : "text-[#383637]"}`}>
                        Venmo{useNewVenmo && <span className="ml-1.5 text-[12px] font-bold text-[#16a34a]">5% OFF</span>}
                      </span>
                      {paymentMethod === "venmo" && (
                        <p className="text-[12px] text-[#383637]/60 mt-0.5">{useNewVenmo ? "5% discount applied. Pay instantly with Venmo deep link." : "Place your order then follow instructions to pay."}</p>
                      )}
                    </div>
                  </label>
                </div>

                {/* Selected payment method content */}
                {paymentMethod === "stripe" ? (
                  useQuiklie ? (
                    <QuikliePaymentForm
                      calculatedTotal={calculatedTotal}
                      currencyCode={currencyCode}
                      form={form}
                      cart={cart}
                      items={items}
                      shippingCost={shippingCost}
                      tax={tax}
                      taxRate={taxRate}
                      taxJurisdiction={taxJurisdiction}
                      selectedShippoRate={selectedShippoRate}
                      customer={customer}
                      agreed={agreed}
                      setAgreed={setAgreed}
                      DisclaimerSection={DisclaimerSection}
                    />
                  ) : (
                    <CardPaymentForm
                      calculatedTotal={calculatedTotal}
                      currencyCode={currencyCode}
                      form={form}
                      cart={cart}
                      items={items}
                      shippingCost={shippingCost}
                      tax={tax}
                      taxRate={taxRate}
                      taxJurisdiction={taxJurisdiction}
                      selectedShippoRate={selectedShippoRate}
                      shippingRates={shippingRates}
                      selectedRate={selectedRate}
                      customer={customer}
                      agreed={agreed}
                      setAgreed={setAgreed}
                    />
                  )
                ) : (
                  <VenmoPaymentForm
                    calculatedTotal={calculatedTotal}
                    currencyCode={currencyCode}
                    form={form}
                    cart={cart}
                    items={items}
                    shippingCost={shippingCost}
                    tax={tax}
                    taxRate={taxRate}
                    taxJurisdiction={taxJurisdiction}
                    selectedShippoRate={selectedShippoRate}
                    customer={customer}
                    agreed={agreed}
                    setAgreed={setAgreed}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        {OrderSummary}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F8AF7]" /></div>}>
      <CheckoutPageInner />
    </Suspense>
  )
}
