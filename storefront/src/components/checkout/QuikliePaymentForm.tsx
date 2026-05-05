"use client"

import { useState, useRef } from "react"
import { sdk } from "@/lib/medusa"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://admin.peptidesfarma.com"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

interface QuikliePaymentFormProps {
  calculatedTotal: number
  currencyCode: string
  form: any
  cart: any
  items: any[]
  shippingCost: number
  tax: number
  taxRate: number
  taxJurisdiction: string
  selectedShippoRate: any
  customer: any
  agreed: [boolean, boolean]
  setAgreed: (v: [boolean, boolean]) => void
  DisclaimerSection: React.ComponentType<{ agreed: [boolean, boolean]; setAgreed: (v: [boolean, boolean]) => void }>
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(.{4})/g, "$1 ").trim()
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4)
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

function getCardBrand(number: string): string {
  const d = number.replace(/\D/g, "")
  if (d.startsWith("4")) return "visa"
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "mastercard"
  if (d.startsWith("34") || d.startsWith("37")) return "amex"
  if (d.startsWith("6011") || d.startsWith("65") || d.startsWith("644")) return "discover"
  return ""
}

const CARD_ICONS: Record<string, string> = {
  visa: "/icons/Visa_Inc.-Logo.wine.svg",
  mastercard: "/icons/mastercard.svg",
  amex: "/icons/American_Express-Logo.wine.svg",
}

const INPUT_CLS = "w-full h-[44px] px-3 text-[15px] text-[#242424] placeholder:text-[#242424]/40 rounded-[10px] border border-[#242424]/12 bg-[#242424]/3 outline-none focus:border-[#4F8AF7]/50 transition-colors"

// Clean Quiklie error messages — never show raw API errors to customer
function cleanError(msg: string): string {
  if (!msg) return "Your payment could not be processed. Please try again or use a different card."
  const lower = msg.toLowerCase()
  if (lower.includes("declined") || lower.includes("do not honor") || lower.includes("insufficient"))
    return "Your card was declined. Please check your details or try a different card."
  if (lower.includes("mids") || lower.includes("merchant"))
    return "Card payments are temporarily unavailable. Please try Venmo or contact support."
  if (lower.includes("address") || lower.includes("avs") || lower.includes("billing"))
    return "Billing address does not match your card. Please check your billing address and try again."
  if (lower.includes("cvv") || lower.includes("cvc") || lower.includes("security"))
    return "Invalid security code (CVV). Please check and try again."
  if (lower.includes("expired"))
    return "Your card appears to be expired. Please use a different card."
  if (lower.includes("3d") || lower.includes("authentication"))
    return "Card authentication failed. Please try again or use a different card."
  if (lower.includes("rubinpay") || lower.includes("rbp") || lower.includes("cdnsoftware") || lower.includes("paycentage"))
    return "Your payment could not be processed. Please try again or use a different card."
  if (msg.length > 100) return "Your payment could not be processed. Please try again or use a different card."
  return msg
}

export default function QuikliePaymentForm({
  calculatedTotal, currencyCode, form, cart, items, shippingCost,
  tax, taxRate, taxJurisdiction, selectedShippoRate, customer,
  agreed, setAgreed, DisclaimerSection,
}: QuikliePaymentFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardName, setCardName] = useState("")
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [billingAddress, setBillingAddress] = useState({ address_1: "", address_2: "", city: "", province: "", postal_code: "", country_code: "us" })
  const [threeDSUrl, setThreeDSUrl] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const submittedRef = useRef(false)
  const paymentIdRef = useRef("")
  const cartDataRef = useRef("")

  const cardBrand = getCardBrand(cardNumber)
  const cardDigits = cardNumber.replace(/\D/g, "")
  const expiryDigits = cardExpiry.replace(/\D/g, "")
  const isCardValid = cardDigits.length >= 15 && expiryDigits.length === 4 && cardCvv.length >= 3 && cardName.trim().length > 1

  // Use billing address or shipping address based on checkbox
  const billingAddr = sameAsShipping
    ? { address: form.address_1 || "", city: form.city || "", state: form.province || "", zipCode: form.postal_code || "", country: (form.country_code || "us").toUpperCase() }
    : { address: billingAddress.address_1 || "", city: billingAddress.city || "", state: billingAddress.province || "", zipCode: billingAddress.postal_code || "", country: (billingAddress.country_code || "us").toUpperCase() }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittedRef.current || !cart || !isCardValid) return
    if (!sameAsShipping && (!billingAddress.address_1 || !billingAddress.city || !billingAddress.postal_code)) {
      setError("Please fill in your billing address."); return
    }

    submittedRef.current = true
    setSubmitting(true)
    setError(null)

    try {
      const [first_name, ...rest] = form.full_name.trim().split(" ")
      const last_name = rest.join(" ") || first_name
      const countryCode = (form.country_code || "us").toLowerCase()

      await sdk.store.cart.update(cart.id, {
        email: form.email,
        shipping_address: {
          first_name, last_name,
          address_1: form.address_1, address_2: form.address_2 || undefined,
          city: form.city, province: form.province,
          postal_code: form.postal_code, country_code: countryCode, phone: form.phone,
        },
        billing_address: sameAsShipping ? {
          first_name, last_name,
          address_1: form.address_1, address_2: form.address_2 || undefined,
          city: form.city, province: form.province,
          postal_code: form.postal_code, country_code: countryCode, phone: form.phone,
        } : {
          first_name, last_name,
          address_1: billingAddress.address_1, address_2: billingAddress.address_2 || undefined,
          city: billingAddress.city, province: billingAddress.province,
          postal_code: billingAddress.postal_code, country_code: (billingAddress.country_code || "us").toLowerCase(),
          phone: form.phone,
        },
        metadata: {
          payment_method: "card", payment_provider: "quiklie",
          customer_paid_total: String(calculatedTotal),
          tax_amount: String(tax), tax_rate: String(taxRate),
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

      const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id })
      let shipped = false
      if (shipping_options?.length) {
        for (const opt of [...shipping_options].sort((a: any, b: any) => (a.price_type === "calculated" ? 0 : 1) - (b.price_type === "calculated" ? 0 : 1))) {
          try { await sdk.store.cart.addShippingMethod(cart.id, { option_id: opt.id }); shipped = true; break } catch {}
        }
      }
      if (!shipped) throw new Error("Unable to set up shipping. Please check your address.")

      await sdk.store.payment.initiatePaymentSession(cart as any, { provider_id: "pp_system_default" })

      const cartData = JSON.stringify({
        cartId: cart.id, form, selectedShippoRate, calculatedTotal,
        tax, taxRate, taxJurisdiction, preSetup: true,
      })
      const encodedCartData = btoa(encodeURIComponent(cartData))
      cartDataRef.current = encodedCartData
      if (typeof sessionStorage !== "undefined") sessionStorage.setItem("quiklie_cart_data", encodedCartData)

      const expMonth = expiryDigits.slice(0, 2)
      const expYear = "20" + expiryDigits.slice(2, 4)

      const callbackUrl = `${MEDUSA_BACKEND_URL}/hooks/quiklie-callback`
      const redirectUrl = `${SITE_URL}/checkout/quiklie-callback?cartId=${cart.id}`

      const payRes = await fetch(`${MEDUSA_BACKEND_URL}/hooks/quiklie-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          amount: calculatedTotal.toFixed(2),
          email: form.email,
          firstName: first_name,
          lastName: last_name,
          phone: (form.phone || "").replace(/\D/g, ""),
          address: billingAddr.address,
          city: billingAddr.city,
          state: billingAddr.state,
          zipCode: billingAddr.zipCode,
          country: billingAddr.country,
          callbackUrl, redirectUrl,
          cardNumber: cardDigits,
          cardHolderName: cardName.toUpperCase(),
          cardExpiryMonth: expMonth,
          cardExpiryYear: expYear,
          cardCvv,
        }),
      })

      const payData = await payRes.json()

      if (!payRes.ok || payData.status === "DECLINED") {
        throw new Error(payData.message || payData.error || "Your card was declined.")
      }

      paymentIdRef.current = payData.paymentId || ""
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("quiklie_payment_id", payData.paymentId || "")
        sessionStorage.setItem("quiklie_tx_ref", payData.transactionReferenceId || "")
      }

      if (payData.status === "3DS_REQUIRED" && payData.quikleeRedirectUrl) {
        setThreeDSUrl(payData.quikleeRedirectUrl)
        setSubmitting(false)
        startPolling(payData.paymentId, encodedCartData)
        return
      }

      if (payData.status === "OTP_REQUIRED") {
        setSubmitting(false)
        setError("Your bank requires additional verification. Please try again or use a different card.")
        submittedRef.current = false
        return
      }

      if (payData.status === "SUCCESS") {
        await completeOrder(payData.paymentId, encodedCartData)
        return
      }

      startPolling(payData.paymentId, encodedCartData)
      setSubmitting(false)
    } catch (err: any) {
      submittedRef.current = false
      setSubmitting(false)
      setError(cleanError(err?.message || ""))
    }
  }

  const completeOrder = async (paymentId: string, encodedCartData: string) => {
    try {
      const res = await fetch(`${MEDUSA_BACKEND_URL}/hooks/quiklie-callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartData: encodedCartData, paymentId, status: "SUCCESS", statusCode: "1" }),
      })
      const result = await res.json()
      if (result?.success && result?.orderNumber) {
        setPaymentSuccess(true)
        setSubmitting(false)
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem("quiklie_cart_data")
          sessionStorage.removeItem("quiklie_payment_id")
          sessionStorage.removeItem("quiklie_tx_ref")
        }
        setTimeout(() => { window.location.href = `/checkout/success?orderNumber=${result.orderNumber}` }, 1200)
      } else {
        setSubmitting(false)
        setError(cleanError(result?.message || "Order could not be completed. Please contact support."))
        submittedRef.current = false
      }
    } catch {
      setSubmitting(false)
      setError("Network error completing your order. Please contact support.")
      submittedRef.current = false
    }
  }

  const startPolling = (paymentId: string, encodedCartData: string) => {
    let attempts = 0
    const poll = setInterval(async () => {
      attempts++
      if (attempts > 60) { clearInterval(poll); setError("Payment timed out."); return }
      try {
        const res = await fetch(`${MEDUSA_BACKEND_URL}/hooks/quiklie-callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartData: encodedCartData, paymentId, status: "SUCCESS", statusCode: "1" }),
        })
        const result = await res.json()
        if (result?.success && result?.orderNumber) {
          clearInterval(poll)
          setThreeDSUrl(null)
          setPaymentSuccess(true)
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.removeItem("quiklie_cart_data")
            sessionStorage.removeItem("quiklie_payment_id")
            sessionStorage.removeItem("quiklie_tx_ref")
          }
          setTimeout(() => { window.location.href = `/checkout/success?orderNumber=${result.orderNumber}` }, 1200)
        }
      } catch {}
    }, 4000)
  }

  if (threeDSUrl) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-[16px] border border-amber-300 bg-amber-50 p-4">
          <p className="text-[14px] font-semibold text-amber-900 mb-1">Bank Verification Required</p>
          <p className="text-[13px] text-amber-800">Please complete the verification in the window below. Do not close this page.</p>
        </div>
        <div className="rounded-[16px] border border-[#242424]/10 overflow-hidden">
          <iframe src={threeDSUrl} className="w-full border-0" style={{ height: "450px" }} allow="payment" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation" />
        </div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-[18px] font-bold text-[#242424]">Payment Successful!</p>
        <p className="text-[13px] text-[#888]">Redirecting to your order confirmation...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-4">
      {/* Card form box */}
      <div className="rounded-[16px] border border-[#242424]/10 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-b border-[#242424]/8">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="#4F8AF7" strokeWidth="1.5"/>
              <path d="M2 10h20" stroke="#4F8AF7" strokeWidth="1.5"/>
            </svg>
            <span className="text-[14px] font-semibold text-[#242424]">Card Details</span>
          </div>
          <div className="flex items-center gap-1.5">
            {["visa", "mastercard", "amex"].map((b) => (
              <img key={b} src={CARD_ICONS[b]} alt={b} className={`h-5 ${cardBrand && cardBrand !== b ? "opacity-30" : "opacity-100"} transition-opacity`} />
            ))}
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#555]">Card Number</label>
            <div className="relative">
              <input type="text" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456"
                value={formatCardNumber(cardNumber)} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                className={`${INPUT_CLS} pr-12`} />
              {cardBrand && CARD_ICONS[cardBrand] && (
                <img src={CARD_ICONS[cardBrand]} alt={cardBrand} className="absolute right-3 top-1/2 -translate-y-1/2 h-6" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-[#555]">Expiry</label>
              <input type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY"
                value={formatExpiry(cardExpiry)} onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={5} className={INPUT_CLS} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-[#555]">CVV</label>
              <input type="text" inputMode="numeric" autoComplete="cc-csc" placeholder="123"
                value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4} className={INPUT_CLS} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#555]">Name on Card</label>
            <input type="text" autoComplete="cc-name" placeholder="JOHN DOE"
              value={cardName} onChange={(e) => setCardName(e.target.value)}
              className={`${INPUT_CLS} uppercase`} />
          </div>
        </div>

        {/* Billing address */}
        <div className="px-4 pb-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)}
              className="w-4 h-4 rounded border-[#242424]/20 accent-[#4F8AF7] cursor-pointer" />
            <span className="text-[13px] text-[#555]">Billing address is the same as shipping</span>
          </label>

          {!sameAsShipping && (
            <div className="mt-3 flex flex-col gap-2.5 pt-3 border-t border-[#242424]/8">
              <p className="text-[12px] font-semibold text-[#242424] mb-0.5">Billing Address</p>
              <input type="text" placeholder="Street address" value={billingAddress.address_1}
                onChange={(e) => setBillingAddress((p) => ({ ...p, address_1: e.target.value }))}
                className={INPUT_CLS} />
              <input type="text" placeholder="Apt, suite, etc. (optional)" value={billingAddress.address_2}
                onChange={(e) => setBillingAddress((p) => ({ ...p, address_2: e.target.value }))}
                className={INPUT_CLS} />
              <div className="grid grid-cols-2 gap-2.5">
                <input type="text" placeholder="City" value={billingAddress.city}
                  onChange={(e) => setBillingAddress((p) => ({ ...p, city: e.target.value }))}
                  className={INPUT_CLS} />
                <input type="text" placeholder="State" value={billingAddress.province}
                  onChange={(e) => setBillingAddress((p) => ({ ...p, province: e.target.value }))}
                  className={INPUT_CLS} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <input type="text" placeholder="ZIP code" value={billingAddress.postal_code}
                  onChange={(e) => setBillingAddress((p) => ({ ...p, postal_code: e.target.value }))}
                  className={INPUT_CLS} />
                <select value={billingAddress.country_code}
                  onChange={(e) => setBillingAddress((p) => ({ ...p, country_code: e.target.value }))}
                  className={INPUT_CLS}>
                  <option value="us">United States</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FAFAFA] border-t border-[#242424]/8">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="#888" strokeWidth="1.5"/>
            <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-[11px] text-[#888]">Secured with 256-bit SSL encryption</span>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-[16px] p-4 text-[14px]">{error}</div>}

      <DisclaimerSection agreed={agreed} setAgreed={setAgreed} />

      <button type="submit" disabled={submitting || !agreed[0] || !agreed[1] || !isCardValid}
        className="w-full h-[52px] flex items-center justify-center gap-2 rounded-[110px] text-[16px] font-bold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}>
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
            Pay ${calculatedTotal.toFixed(2)}
          </>
        )}
      </button>
    </form>
  )
}
