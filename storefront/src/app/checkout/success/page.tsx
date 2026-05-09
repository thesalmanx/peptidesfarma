"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { getOrderReceipt, type OrderReceipt } from "@/lib/order-receipt"
import OrderStatusStepper, { ORDER_PLACED_STEPS } from "@/components/checkout/OrderStatusStepper"
import { trackPurchase } from "@/lib/gtag"

function formatMoney(value: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

function formatShippingAddress(addr?: OrderReceipt["shipping_address"]): string[] {
  if (!addr) return []
  const lines: string[] = []
  if (addr.name) lines.push(addr.name)
  if (addr.address_1) lines.push(addr.address_1 + (addr.address_2 ? `, ${addr.address_2}` : ""))
  const cityLine = [addr.city, addr.province, addr.postal_code].filter(Boolean).join(", ")
  if (cityLine) lines.push(cityLine)
  if (addr.country_code) lines.push(addr.country_code.toUpperCase())
  if (addr.phone) lines.push(addr.phone)
  return lines
}

function ReceiptBlock({ receipt }: { receipt: OrderReceipt }) {
  const addressLines = formatShippingAddress(receipt.shipping_address)
  return (
    <div className="w-full max-w-[880px] mt-8 mb-8 bg-white border border-[#E5E7EB] rounded-[20px] overflow-hidden shadow-[0_2px_24px_rgba(20,20,20,0.04)]">
      <div className="px-6 md:px-10 pt-6 pb-5 border-b border-[#F1F2F4] flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] md:text-[12px] font-bold tracking-[0.15em] uppercase text-[#4F8AF7]">Order Summary</div>
        {receipt.orderNumber && (
          <div className="text-[14px] md:text-[15px] font-semibold text-[#242424]">
            Order <span className="text-[#4F8AF7]">#{receipt.orderNumber}</span>
          </div>
        )}
      </div>

      {addressLines.length > 0 && (
        <div className="px-6 md:px-10 pt-5 pb-3">
          <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#9CA3AF] mb-2">Shipping To</div>
          <div className="text-[14px] md:text-[15px] leading-[22px] text-[#242424]">
            {addressLines.map((line, i) => (
              <div key={i} className={i === 0 ? "font-semibold" : "text-[#6B7280]"}>{line}</div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 md:px-10 py-6 flex flex-col gap-6">
        {receipt.items.map((item, i) => (
          <div key={i} className="flex items-center gap-5 md:gap-6">
            <div className="w-[88px] h-[88px] md:w-[104px] md:h-[104px] rounded-[14px] bg-white border border-[#E5E7EB] overflow-hidden shrink-0 flex items-center justify-center p-2">
              {item.thumbnail ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-[8px] bg-[#F5F5F5]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] md:text-[18px] font-semibold leading-[22px] md:leading-[26px] text-[#242424] truncate">{item.title}</div>
              {item.variant_title && item.variant_title.toLowerCase() !== "default" && (
                <div className="text-[13px] md:text-[14px] font-medium leading-[18px] md:leading-[20px] text-[#6B7280] mt-1">{item.variant_title}</div>
              )}
              <div className="text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] text-[#9CA3AF] mt-1.5">Qty: {item.quantity}</div>
            </div>
            <div className="text-[16px] md:text-[18px] font-bold leading-[22px] md:leading-[26px] text-[#242424] shrink-0">
              {formatMoney(item.line_total, receipt.currency)}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 md:px-10 py-6 border-t border-[#F1F2F4] flex flex-col gap-2.5">
        <div className="flex justify-between text-[14px] md:text-[15px] text-[#6B7280]">
          <span>Subtotal</span>
          <span className="text-[#242424] font-medium">{formatMoney(receipt.subtotal, receipt.currency)}</span>
        </div>
        <div className="flex justify-between text-[14px] md:text-[15px] text-[#6B7280]">
          <span>
            Shipping{receipt.shippingMethod ? ` (${receipt.shippingMethod})` : ""}
          </span>
          <span className="text-[#242424] font-medium">
            {receipt.shipping === 0 ? "Free" : formatMoney(receipt.shipping, receipt.currency)}
          </span>
        </div>
        {receipt.tax > 0 && (
          <div className="flex justify-between text-[14px] md:text-[15px] text-[#6B7280]">
            <span>Tax{receipt.taxJurisdiction ? ` (${receipt.taxJurisdiction})` : ""}</span>
            <span className="text-[#242424] font-medium">{formatMoney(receipt.tax, receipt.currency)}</span>
          </div>
        )}
        {receipt.discount > 0 && (
          <div className="flex justify-between text-[14px] md:text-[15px] text-[#15803D]">
            <span>Discount{receipt.promoCode ? ` (${receipt.promoCode})` : ""}</span>
            <span className="font-medium">-{formatMoney(receipt.discount, receipt.currency)}</span>
          </div>
        )}
      </div>

      <div className="px-6 md:px-10 py-5 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-between items-center">
        <span className="text-[16px] md:text-[18px] font-semibold text-[#242424]">Total Paid</span>
        <span className="text-[22px] md:text-[26px] font-bold text-[#4F8AF7]">{formatMoney(receipt.total, receipt.currency)}</span>
      </div>

      <div className="px-6 md:px-10 py-4 border-t border-[#F1F2F4] flex justify-between items-center text-[13px] md:text-[14px] text-[#6B7280]">
        <span>Payment</span>
        <span className="text-[#242424] font-medium">
          {receipt.paymentMethod}
          {receipt.paymentLast4 ? ` ending ${receipt.paymentLast4}` : ""}
        </span>
      </div>
    </div>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber") || ""
  const [stage, setStage] = useState(0)
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null)

  // Frame-bust: the Quiklie 3DS bank verification renders inside an iframe.
  // If the bank's redirect happens to land us here while still nested, lift
  // ourselves to the top window so the customer sees the real thank-you page
  // instead of a thank-you page squeezed inside the bank's iframe.
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
    // Preview mode lets internal team review the success-page layout without
    // placing a real order. Triggered by ?preview=1, populates a sample
    // receipt and skips cart cleanup.
    const isPreview = searchParams.get("preview") === "1"
    if (isPreview) {
      setReceipt({
        orderNumber: orderNumber || "PREVIEW",
        currency: "USD",
        shipping_address: {
          name: "Marla Bolinder",
          address_1: "451 S. State St",
          city: "Salt Lake City",
          province: "UT",
          postal_code: "84111",
          country_code: "US",
          phone: "+1 949 234 7217",
        },
        items: [
          {
            title: "GLP-3 RT",
            variant_title: "10 mg",
            quantity: 2,
            unit_price: 150,
            line_total: 300,
            thumbnail: "",
          },
          {
            title: "BPC-157",
            variant_title: "10 mg",
            quantity: 1,
            unit_price: 110,
            line_total: 110,
            thumbnail: "",
          },
          {
            title: "BAC Water",
            variant_title: "3 ml",
            quantity: 2,
            unit_price: 15,
            line_total: 30,
            thumbnail: "",
          },
        ],
        subtotal: 440,
        shipping: 9.99,
        shippingMethod: "UPS Ground",
        tax: 34.10,
        taxJurisdiction: "SALT LAKE CITY, UT",
        discount: 66,
        promoCode: "META15",
        total: 418.09,
        paymentMethod: "Card",
        paymentLast4: "4242",
      })
      return
    }
    localStorage.removeItem("medusa_cart_id")
    localStorage.removeItem("checkout_form")
    const r = getOrderReceipt(orderNumber || undefined)
    setReceipt(r)

    // Fire GA4 purchase event so Google Analytics sees credit card revenue.
    // Uses a sessionStorage flag to prevent duplicate fires on page refresh.
    if (r && r.items.length > 0) {
      const firedKey = `ga4_purchase_fired_${r.orderNumber || "unknown"}`
      if (!sessionStorage.getItem(firedKey)) {
        trackPurchase({
          transactionId: r.orderNumber || orderNumber || "unknown",
          value: r.total,
          currency: r.currency || "USD",
          shipping: r.shipping || 0,
          tax: r.tax || 0,
          items: r.items.map((item) => ({
            id: item.title.toLowerCase().replace(/\s+/g, "-"),
            name: item.title,
            variant: item.variant_title,
            price: item.unit_price,
            quantity: item.quantity,
          })),
        })
        sessionStorage.setItem(firedKey, "1")
      }
    }
  }, [orderNumber, searchParams])

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100)
    const t2 = setTimeout(() => setStage(2), 600)
    const t3 = setTimeout(() => setStage(3), 1100)
    const t4 = setTimeout(() => setStage(4), 1500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 py-16">
      <div
        className="relative w-[64px] h-[64px] rounded-full flex items-center justify-center mb-6 transition-all duration-500 ease-out"
        style={{
          background: stage >= 1 ? "linear-gradient(135deg, #4F8AF7 0%, #4F8AF7 100%)" : "transparent",
          transform: stage >= 1 ? "scale(1)" : "scale(0.3)",
          opacity: stage >= 1 ? 1 : 0,
          boxShadow: stage >= 2 ? "0 8px 40px rgba(79, 138, 247, 0.3), 0 4px 16px rgba(79, 138, 247, 0.2)" : "none",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="transition-all duration-500 ease-out"
          style={{
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 2 ? "scale(1)" : "scale(0.5)",
          }}
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={stage >= 2 ? "animate-draw-check" : ""}
            style={{
              strokeDasharray: 30,
              strokeDashoffset: stage >= 2 ? 0 : 30,
              transition: "stroke-dashoffset 0.6s ease-out 0.1s",
            }}
          />
        </svg>

        {stage >= 2 && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping-slow" style={{ background: "rgba(79, 138, 247, 0.15)" }} />
            <span className="absolute -inset-3 rounded-full animate-ping-slower" style={{ background: "rgba(79, 138, 247, 0.08)" }} />
          </>
        )}
      </div>

      <h1
        className="text-[28px] lg:text-[40px] leading-[36px] lg:leading-[48px] font-bold tracking-[-0.03em] text-[#141414] mb-3 text-center transition-all duration-500 ease-out"
        style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? "translateY(0)" : "translateY(16px)",
        }}
      >
        Thank You For Your Order
      </h1>

      <p
        className="text-[16px] lg:text-[18px] leading-[24px] lg:leading-[28px] tracking-[-0.01em] text-[#333] mb-4 text-center max-w-[520px] transition-all duration-500 ease-out"
        style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? "translateY(0)" : "translateY(16px)",
          transitionDelay: "100ms",
        }}
      >
        Your order has been received and is now being processed.
      </p>

      <div
        className="w-full max-w-[880px] mt-6 mb-2 transition-all duration-500 ease-out"
        style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? "translateY(0)" : "translateY(16px)",
          transitionDelay: "150ms",
        }}
      >
        <OrderStatusStepper steps={ORDER_PLACED_STEPS} currentStep={2} />
      </div>

      {receipt && (
        <div
          className="w-full flex justify-center transition-all duration-500 ease-out"
          style={{
            opacity: stage >= 4 ? 1 : 0,
            transform: stage >= 4 ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "300ms",
          }}
        >
          <ReceiptBlock receipt={receipt} />
        </div>
      )}

      <div
        className="flex flex-col sm:flex-row items-center gap-3 transition-all duration-500 ease-out mt-2"
        style={{
          opacity: stage >= 4 ? 1 : 0,
          transform: stage >= 4 ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <Link
          href="/account/orders"
          className="group inline-flex items-center justify-center h-[48px] rounded-[110px] text-[16px] font-bold leading-[24px] tracking-[-0.01em] text-white hover:opacity-90 transition-opacity"
          style={{
            padding: "12px 28px 12px 24px",
            background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)",
          }}
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
          className="group inline-flex items-center justify-center h-[48px] rounded-[110px] text-[16px] font-bold leading-[24px] tracking-[-0.01em] text-[#242424] bg-[#4F8AF7]/15 hover:bg-[#4F8AF7]/20 transition-colors"
          style={{ padding: "12px 28px 12px 24px" }}
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F8AF7]" /></div>}>
      <SuccessContent />
    </Suspense>
  )
}
