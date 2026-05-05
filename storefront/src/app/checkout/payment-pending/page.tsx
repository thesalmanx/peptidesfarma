"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function getVenmoNote(orderNumber?: string) {
  return orderNumber ? `Order ${orderNumber}` : "Online Goods"
}
function getVenmoPayUrl(amount: string, orderNumber?: string) {
  return `https://venmo.com/valtosi?txn=pay&amount=${amount}&note=${encodeURIComponent(getVenmoNote(orderNumber))}`
}
function getVenmoQrUrl(amount: string, orderNumber?: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getVenmoPayUrl(amount, orderNumber))}`
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
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
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424]/5 hover:bg-[#242424]/10 text-[13px] font-medium text-[#333] transition-colors"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 15V5a2 2 0 012-2h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}

// Step tracker component
function OrderStatusTracker({ currentStep }: { currentStep: number }) {
  const steps = [
    { label: "Ordered", icon: "check" },
    { label: "Pending Payment", icon: "clock" },
    { label: "Processing", icon: "gear" },
    { label: "Shipped", icon: "truck" },
  ]

  return (
    <div className="flex items-center justify-between w-full max-w-[500px] mx-auto">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold transition-colors ${
                i <= currentStep ? "text-white" : "bg-[#242424]/8 text-[#242424]/40"
              }`}
              style={
                i <= currentStep
                  ? { background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }
                  : undefined
              }
            >
              {i < currentStep ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.333 4L6 11.333 2.667 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : i === 1 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : i === 2 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : i === 3 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 18h14M5 18l-1-6h16l-1 6M5 18v2M19 18v2M8 12V8a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className={`text-[11px] font-semibold text-center whitespace-nowrap ${i <= currentStep ? "text-[#4F8AF7]" : "text-[#242424]/40"}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-[2px] mx-2 mt-[-18px] rounded-full transition-colors ${i < currentStep ? "bg-[#4F8AF7]" : "bg-[#242424]/12"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function PaymentPendingInner() {
  const searchParams = useSearchParams()
  const total = searchParams.get("total") || "0.00"
  const cartId = searchParams.get("cartId") || ""
  const [orderNumber, setOrderNumber] = useState(searchParams.get("orderNumber") || "")
  const orderId = searchParams.get("orderId") || ""
  const venmoNote = getVenmoNote(orderNumber || undefined)
  const itemsParam = searchParams.get("items") || "[]"
  const addressParam = searchParams.get("address") || ""

  let items: { title: string; variant?: string; quantity: number; price: string; thumbnail?: string }[] = []
  try {
    items = JSON.parse(decodeURIComponent(itemsParam))
  } catch {
    items = []
  }

  let address: { name: string; line1: string; line2?: string; city: string; state: string; zip: string; country: string } | null = null
  try {
    if (addressParam) address = JSON.parse(decodeURIComponent(addressParam))
  } catch {
    address = null
  }

  // Order is now created on the checkout page before redirect.
  // This block only runs as a fallback for old/bookmarked URLs without orderNumber.
  const completedRef = useRef(false)
  useEffect(() => {
    if (completedRef.current) return
    completedRef.current = true

    // If orderNumber already present, order was created on checkout page — nothing to do
    if (orderNumber) return

    // Fallback: try to complete from sessionStorage (legacy flow)
    const pendingData = sessionStorage.getItem("venmo_order_data")
    if (!pendingData && !cartId) return

    const data = pendingData ? JSON.parse(pendingData) : null
    const cId = data?.cartId || cartId
    if (!cId) return

    const MAX_RETRIES = 3

    async function attemptComplete(attempt: number): Promise<boolean> {
      try {
        const res = await fetch("/api/checkout/complete-venmo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data || { cartId: cId }),
        })
        const result = await res.json()
        if (res.ok && result?.orderId) {
          sessionStorage.removeItem("venmo_order_data")
          if (result.orderDisplayId) {
            setOrderNumber(String(Number(result.orderDisplayId) + 11000))
          }
          return true
        }
        return false
      } catch {
        return false
      }
    }

    async function completeWithRetries() {
      for (let i = 1; i <= MAX_RETRIES; i++) {
        const success = await attemptComplete(i)
        if (success) return
        if (i < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 2000 * i))
        }
      }
      // All retries failed — notify admin
      try {
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "order_creation_failed",
            email: data?.form?.email || "unknown",
            name: data?.form?.full_name || "unknown",
            total: total,
            cartId: cId,
            address: data?.form ? `${data.form.address_1}, ${data.form.city}, ${data.form.province} ${data.form.postal_code}` : "",
            items: items.map((i: any) => `${i.quantity}x ${i.title}`).join(", "),
          }),
        })
      } catch {}
    }

    completeWithRetries()
  }, [cartId, total, items, orderNumber])

  const [stage, setStage] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100)
    const t2 = setTimeout(() => setStage(2), 400)
    const t3 = setTimeout(() => setStage(3), 700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div className="max-w-[720px] mx-auto px-5 py-10 lg:py-16">
      {/* Header */}
      <div
        className="text-center mb-8 transition-all duration-500 ease-out"
        style={{ opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? "translateY(0)" : "translateY(16px)" }}
      >
        <div
          className="relative w-[56px] h-[56px] rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
            <path d="M12 7v5l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-[28px] lg:text-[36px] font-bold tracking-[-0.03em] text-[#141414] mb-2">
          Complete Your Payment
        </h1>
        <p className="text-[16px] text-[#555] mb-1">
          Your order has been placed! Please send payment to complete it.
        </p>
        {(orderNumber || orderId) && (
          <p className="text-[14px] text-[#888]">Order #{orderNumber || orderId}</p>
        )}
      </div>

      {/* Status Tracker */}
      <div
        className="mb-8 transition-all duration-500 ease-out"
        style={{ opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? "translateY(0)" : "translateY(16px)", transitionDelay: "100ms" }}
      >
        <OrderStatusTracker currentStep={1} />
      </div>

      {/* Venmo Payment Card */}
      <div
        className="rounded-[16px] border-2 border-[#008CFF]/20 overflow-hidden mb-6 transition-all duration-500 ease-out"
        style={{ opacity: stage >= 2 ? 1 : 0, transform: stage >= 2 ? "translateY(0)" : "translateY(16px)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-[#008CFF]/5 border-b border-[#008CFF]/10">
          <div className="w-10 h-10 rounded-[10px] bg-[#008CFF] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M19.5 3.6c.6 1 .9 2.1.9 3.4 0 4.2-3.6 9.6-6.5 13.4H7.8L5.4 3.3l5.2-.5 1.4 11.1c1.3-2.1 2.8-5.4 2.8-7.7 0-1.2-.2-2-.5-2.7l5.2-0.9z" />
            </svg>
          </div>
          <div>
            <span className="text-[16px] font-semibold text-[#242424]">Pay with Venmo</span>
            <p className="text-[13px] text-[#666]">Send payment to complete your order</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-6 bg-white flex flex-col gap-5">
          {/* Amount Due */}
          <div className="text-center py-4 rounded-[12px] bg-[#008CFF]/5 border border-[#008CFF]/10">
            <p className="text-[13px] font-semibold text-[#666] uppercase tracking-wider mb-1">Amount Due</p>
            <p className="text-[36px] font-bold text-[#008CFF]">${total}</p>
          </div>

          {/* QR Code + Instructions side by side */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* QR Code */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="w-[180px] h-[180px] rounded-[12px] border border-[#242424]/8 overflow-hidden bg-white p-2">
                <Image
                  src={getVenmoQrUrl(total, orderNumber || undefined)}
                  alt="Venmo QR Code for @valtosi"
                  width={164}
                  height={164}
                  className="w-full h-full"
                  unoptimized
                />
              </div>
              <p className="text-[12px] text-[#888]">Scan with Venmo app</p>
            </div>

            {/* Instructions */}
            <div className="flex flex-col gap-4 flex-1">
              {/* Profile */}
              <div>
                <p className="text-[12px] font-semibold text-[#888] uppercase tracking-wider mb-1.5">Venmo Profile</p>
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-[#008CFF]">@valtosi</span>
                  <CopyButton text="@valtosi" label="Copy" />
                </div>
              </div>

              {/* Required Memo */}
              <div>
                <p className="text-[12px] font-semibold text-[#888] uppercase tracking-wider mb-1.5">Required Memo</p>
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-[#242424]">{venmoNote}</span>
                  <CopyButton text={venmoNote} label="Copy" />
                </div>
              </div>

              {orderNumber && (
                <div className="p-3 rounded-[10px] bg-amber-50/80 border border-amber-200">
                  <p className="text-[14px] text-amber-900 text-center leading-[22px]">
                    Include &ldquo;<strong>Order {orderNumber}</strong>&rdquo; in the <em>Memo</em> so we can match your payment.
                  </p>
                </div>
              )}

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 rounded-[10px] bg-amber-50 border border-amber-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-[13px] text-amber-800 leading-[20px]">
                  <strong>Do not</strong> mention product names or the word &ldquo;peptides&rdquo; in the note.
                </p>
              </div>

              {/* Pay Button */}
              <a
                href={getVenmoPayUrl(total, orderNumber || undefined)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-[48px] rounded-[110px] text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "#008CFF" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M19.5 3.6c.6 1 .9 2.1.9 3.4 0 4.2-3.6 9.6-6.5 13.4H7.8L5.4 3.3l5.2-.5 1.4 11.1c1.3-2.1 2.8-5.4 2.8-7.7 0-1.2-.2-2-.5-2.7l5.2-0.9z" />
                </svg>
                Pay with Venmo
              </a>
            </div>
          </div>

          {/* Time warning */}
          <div className="flex items-start gap-2 p-3 rounded-[10px] bg-red-50 border border-red-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="2" />
              <path d="M12 7v5l3 3" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-[13px] text-red-700 leading-[20px]">
              <strong>Please complete payment within 24 hours</strong> to avoid order cancellation.
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      {items.length > 0 && (
        <div
          className="rounded-[16px] border border-[#242424]/8 overflow-hidden mb-6 transition-all duration-500 ease-out"
          style={{ opacity: stage >= 3 ? 1 : 0, transform: stage >= 3 ? "translateY(0)" : "translateY(16px)" }}
        >
          <div className="px-5 py-3 bg-[#FAFBFC] border-b border-[#242424]/8">
            <h3 className="text-[15px] font-semibold text-[#242424]">Order Items</h3>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                {item.thumbnail && (
                  <div className="w-12 h-12 rounded-[8px] bg-[#F2F7FD] overflow-hidden shrink-0 relative">
                    <Image src={item.thumbnail} alt="" fill className="object-cover" sizes="48px" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#242424] line-clamp-1">{item.title}</p>
                  {item.variant && <p className="text-[12px] text-[#888]">{item.variant}</p>}
                  <p className="text-[12px] text-[#888]">Qty: {item.quantity}</p>
                </div>
                <p className="text-[14px] font-semibold text-[#242424] shrink-0">${item.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Address */}
      {address && (
        <div
          className="rounded-[16px] border border-[#242424]/8 overflow-hidden mb-8 transition-all duration-500 ease-out"
          style={{ opacity: stage >= 3 ? 1 : 0, transform: stage >= 3 ? "translateY(0)" : "translateY(16px)", transitionDelay: "100ms" }}
        >
          <div className="px-5 py-3 bg-[#FAFBFC] border-b border-[#242424]/8">
            <h3 className="text-[15px] font-semibold text-[#242424]">Shipping Address</h3>
          </div>
          <div className="px-5 py-4">
            <p className="text-[14px] font-semibold text-[#242424]">{address.name}</p>
            <p className="text-[14px] text-[#555]">{address.line1}</p>
            {address.line2 && <p className="text-[14px] text-[#555]">{address.line2}</p>}
            <p className="text-[14px] text-[#555]">{address.city}, {address.state} {address.zip}</p>
            <p className="text-[14px] text-[#555]">{address.country}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        className="flex flex-col sm:flex-row items-center gap-3 transition-all duration-500 ease-out"
        style={{ opacity: stage >= 3 ? 1 : 0, transform: stage >= 3 ? "translateY(0)" : "translateY(16px)", transitionDelay: "200ms" }}
      >
        <Link
          href="/account/orders"
          className="group inline-flex items-center justify-center h-[48px] rounded-[110px] text-[16px] font-bold text-white hover:opacity-90 transition-opacity px-7"
          style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
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
          className="group inline-flex items-center justify-center h-[48px] rounded-[110px] text-[16px] font-bold text-[#242424] bg-[#4F8AF7]/15 hover:bg-[#4F8AF7]/20 transition-colors px-7"
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

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F8AF7]" /></div>}>
      <PaymentPendingInner />
    </Suspense>
  )
}
