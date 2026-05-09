"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { sdk } from "@/lib/medusa"
import Link from "next/link"
import { formatPrice } from "@/lib/format-price"
import { ORDER_NUMBER_OFFSET } from "@/lib/constants"

interface OrderItem {
  id: string
  title: string
  thumbnail: string | null
  quantity: number
  unit_price: number
  total: number
}

interface OrderDetail {
  id: string
  display_id: number
  created_at: string
  total: number
  subtotal: number
  tax_total: number
  shipping_total: number
  metadata?: Record<string, any>
  currency_code: string
  fulfillment_status: string
  payment_status: string
  email: string
  items: OrderItem[]
  shipping_address?: {
    first_name: string
    last_name: string
    address_1: string
    address_2: string | null
    city: string
    province: string | null
    postal_code: string
    country_code: string
    phone: string | null
  }
  fulfillments?: {
    id: string
    labels?: { tracking_number: string; tracking_url?: string }[]
    tracking_links?: { tracking_number: string }[]
  }[]
}

const trackingSteps = [
  { label: "Order placed", key: "placed" },
  { label: "Packing", key: "packing" },
  { label: "Shipped", key: "shipped" },
  { label: "Delivered", key: "delivered" },
]

function getTrackingLabel(fulfillmentStatus: string, paymentStatus: string): string {
  if (fulfillmentStatus === "delivered") return "Delivered"
  if (fulfillmentStatus === "shipped") return "Shipped"
  if (fulfillmentStatus === "fulfilled" || fulfillmentStatus === "partially_fulfilled") return "Packing"
  if (paymentStatus === "captured") return "Packing"
  return "Order placed"
}

function getTrackingStep(
  fulfillmentStatus: string,
  paymentStatus: string
): number {
  if (fulfillmentStatus === "delivered") return 3
  if (fulfillmentStatus === "shipped") return 2
  if (
    fulfillmentStatus === "fulfilled" ||
    fulfillmentStatus === "partially_fulfilled"
  )
    return 1
  if (paymentStatus === "captured") return 1
  return 0
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    sdk.store.order
      .retrieve(orderId, { fields: "+metadata,+discount_total,*fulfillments.labels" } as any)
      .then(({ order }) => setOrder(order as unknown as OrderDetail))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="flex justify-center py-16 w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--pf-blue)]" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="w-full max-w-[960px]">
        <div className="text-center py-16">
          <p className="text-[var(--pf-ink)]/72 text-[16px] mb-3">Order not found.</p>
          <Link
            href="/account/orders"
            className="text-[var(--pf-blue)] hover:opacity-80 text-[14px] font-medium"
          >
            Back to orders
          </Link>
        </div>
      </div>
    )
  }

  const currentStep = getTrackingStep(
    order.fulfillment_status,
    order.payment_status
  )

  const handleDownloadInvoice = async () => {
    let logoDataUrl: string | null = null
    let logoAspect = 1
    try {
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const scale = 4
          canvas.width = img.naturalWidth * scale
          canvas.height = img.naturalHeight * scale
          const ctx = canvas.getContext("2d")!
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          logoDataUrl = canvas.toDataURL("image/png")
          logoAspect = img.naturalWidth / img.naturalHeight
          resolve()
        }
        img.onerror = () => resolve()
        img.src = "/icons/peptidesfarma-invoice-logo.svg"
      })
    } catch {
    }

    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()
    const pw = doc.internal.pageSize.getWidth()
    let y = 20

    if (logoDataUrl) {
      const logoH = 14
      const logoW = logoAspect * logoH
      doc.addImage(logoDataUrl, "PNG", 20, y - 10, logoW, logoH)
    }
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0)
    doc.text("INVOICE", pw - 20, y, { align: "right" })
    y += 12

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100)
    doc.text(`Order #${order.display_id + ORDER_NUMBER_OFFSET}`, 20, y)
    doc.text(
      new Date(order.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      pw - 20,
      y,
      { align: "right" }
    )
    y += 6
    doc.text(`Payment: ${order.payment_status}`, 20, y)
    y += 12

    if (order.shipping_address) {
      doc.setTextColor(0)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("Bill To:", 20, y)
      y += 6
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(
        `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
        20,
        y
      )
      y += 5
      doc.text(order.shipping_address.address_1, 20, y)
      y += 5
      doc.text(
        `${order.shipping_address.city}${order.shipping_address.province ? `, ${order.shipping_address.province}` : ""} ${order.shipping_address.postal_code}`,
        20,
        y
      )
      y += 5
      doc.text(order.shipping_address.country_code.toUpperCase(), 20, y)
      if (order.shipping_address.phone) {
        y += 5
        doc.text(order.shipping_address.phone, 20, y)
      }
      y += 12
    }

    doc.setFillColor(17, 92, 111)
    doc.rect(20, y, pw - 40, 8, "F")
    doc.setTextColor(255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("Item", 24, y + 5.5)
    doc.text("Qty", pw - 70, y + 5.5, { align: "right" })
    doc.text("Price", pw - 44, y + 5.5, { align: "right" })
    doc.text("Total", pw - 24, y + 5.5, { align: "right" })
    y += 12

    doc.setTextColor(0)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    order.items.forEach((item) => {
      if (y > 260) {
        doc.addPage()
        y = 20
      }
      doc.text(item.title.substring(0, 40), 24, y)
      doc.text(String(item.quantity), pw - 70, y, { align: "right" })
      doc.text(formatPrice(item.unit_price, order.currency_code), pw - 44, y, {
        align: "right",
      })
      doc.text(formatPrice(item.total, order.currency_code), pw - 24, y, {
        align: "right",
      })
      y += 7
    })

    y += 4
    doc.setDrawColor(200)
    doc.line(pw - 90, y, pw - 20, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100)
    doc.text("Subtotal", pw - 90, y)
    doc.setTextColor(0)
    doc.text(formatPrice(order.subtotal, order.currency_code), pw - 24, y, {
      align: "right",
    })
    y += 6
    doc.setTextColor(100)
    doc.text("Shipping", pw - 90, y)
    doc.setTextColor(0)
    const shippoShipping = order.metadata?.shippo_shipping_cost
    const displayShipping = shippoShipping != null ? Number(shippoShipping) : order.shipping_total
    doc.text(
      formatPrice(displayShipping, order.currency_code),
      pw - 24,
      y,
      { align: "right" }
    )
    y += 6
    doc.setTextColor(100)
    doc.text("Tax", pw - 90, y)
    doc.setTextColor(0)
    const invoiceTax = order.metadata?.tax_amount != null ? Number(order.metadata.tax_amount) : order.tax_total
    doc.text(formatPrice(invoiceTax, order.currency_code), pw - 24, y, {
      align: "right",
    })
    const invoiceDiscount = (order as any).discount_total || 0
    if (invoiceDiscount > 0) {
      y += 6
      doc.setTextColor(22, 163, 74)
      doc.text("Discount", pw - 90, y)
      doc.text(`-${formatPrice(invoiceDiscount, order.currency_code)}`, pw - 24, y, { align: "right" })
      doc.setTextColor(0)
    }
    y += 8
    doc.setDrawColor(200)
    doc.line(pw - 90, y, pw - 20, y)
    y += 7
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("Total", pw - 90, y)
    const invoiceCustomerPaid = order.metadata?.customer_paid_total
    let invoiceTotal: number
    if (invoiceCustomerPaid != null && Number(invoiceCustomerPaid) > 0) {
      invoiceTotal = Number(invoiceCustomerPaid)
    } else {
      const invoiceShippo = order.metadata?.shippo_shipping_cost
      const invoiceShipping = invoiceShippo != null ? Number(invoiceShippo) : order.shipping_total
      invoiceTotal = order.subtotal + invoiceShipping + invoiceTax - invoiceDiscount
    }
    doc.text(formatPrice(invoiceTotal, order.currency_code), pw - 24, y, {
      align: "right",
    })

    y = doc.internal.pageSize.getHeight() - 15
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text("Thank you for your purchase!", pw / 2, y, { align: "center" })

    doc.save(`Peptidesfarma-Invoice-${order.display_id + ORDER_NUMBER_OFFSET}.pdf`)
  }

  return (
    <div className="w-full max-w-[960px]">
      <div className="flex items-center gap-1 text-[14px] font-medium leading-[22px] tracking-[0.02em] text-[var(--pf-ink)] mb-4">
        <Link href="/" className="hover:underline">Home</Link>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.67} stroke="currentColor" className="w-3.5 h-3.5 -rotate-90">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
        <Link href="/account" className="hover:underline">Account</Link>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.67} stroke="currentColor" className="w-3.5 h-3.5 -rotate-90">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
        <Link href="/account/orders" className="hover:underline">My orders</Link>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.67} stroke="currentColor" className="w-3.5 h-3.5 -rotate-90">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
        <span>#{order.display_id + ORDER_NUMBER_OFFSET}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-[24px] leading-[36px] font-semibold text-[var(--pf-ink)] mb-1">My orders</h1>
        <p className="text-[14px] leading-[22px] text-[var(--pf-ink)]/72">
          View and track all your orders in one place.
        </p>
      </div>

      <div className="border border-[var(--pf-line)] rounded-[24px] p-5 mb-6">
        <div className="flex flex-wrap gap-y-3 gap-x-6 lg:gap-x-10">
          <div className="min-w-[120px]">
            <p className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)]/72 font-normal">Order ID</p>
            <p className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)] font-semibold">#{order.display_id + ORDER_NUMBER_OFFSET}</p>
          </div>
          <div className="min-w-[120px]">
            <p className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)]/72 font-normal">Order Date</p>
            <p className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)] font-semibold">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="min-w-[140px]">
            <p className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)]/72 font-normal">Order Status</p>
            <p className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)] font-semibold">{getTrackingLabel(order.fulfillment_status, order.payment_status)}</p>
            {(() => {
              const trackingId = order.fulfillments?.flatMap((f) => f.labels || [])?.[0]?.tracking_number
                || order.fulfillments?.flatMap((f) => f.tracking_links || [])?.[0]?.tracking_number
              return trackingId ? (
                <Link href={`/track/${trackingId}`} className="text-[12px] leading-[18px] text-[var(--pf-blue)] font-medium mt-0.5 hover:underline block">
                  Tracking ID: {trackingId}
                </Link>
              ) : null
            })()}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-[18px] lg:text-[20px] leading-[28px] font-semibold text-[var(--pf-ink)] mb-6">Track your order</h2>

        <div className="flex items-center w-full h-[64px]">
          {trackingSteps.map((step, i) => {
            const isCompleted = i < currentStep
            const isCurrent = i === currentStep
            const isFuture = i > currentStep
            const isLast = i === trackingSteps.length - 1
            const lineCompleted = i < currentStep

            return (
              <div key={step.key} className="contents">
                <div
                  className="flex items-center gap-4 py-2 px-3 rounded-[14px] shrink-0"
                  style={{ minHeight: 64 }}
                >
                  {isCompleted ? (
                    <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[40px] h-[40px] shrink-0">
                      <g filter="url(#filter_completed)">
                        <circle cx="32" cy="22" r="20" fill="url(#grad_completed)"/>
                      </g>
                      <path d="M40.3008 16L29.3008 27L24.3008 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <defs>
                        <filter id="filter_completed" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                          <feMorphology radius="2" operator="erode" in="SourceAlpha" result="effect1"/>
                          <feOffset dy="4"/>
                          <feGaussianBlur stdDeviation="3"/>
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
                          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1"/>
                          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                          <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect2"/>
                          <feOffset dy="10"/>
                          <feGaussianBlur stdDeviation="7.5"/>
                          <feColorMatrix type="matrix" values="0 0 0 0 0.0647744 0 0 0 0 0.360647 0 0 0 0 0.434615 0 0 0 0.2 0"/>
                          <feBlend mode="normal" in2="effect1" result="effect2"/>
                          <feBlend mode="normal" in="SourceGraphic" in2="effect2" result="shape"/>
                        </filter>
                        <linearGradient id="grad_completed" x1="14.3" y1="22" x2="46.7" y2="22" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#14213D"/>
                          <stop offset="0.5" stopColor="#2A4A8C"/>
                          <stop offset="1" stopColor="#4F8AF7"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  ) : (
                    <div
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0"
                      style={{
                        border: `2px solid ${isCurrent ? "var(--pf-blue)" : "var(--pf-text-3)"}`,
                        opacity: isFuture ? 0.5 : 1,
                      }}
                    >
                      <span
                        className="text-[18px] leading-[28px] font-semibold"
                        style={{ color: isCurrent ? "var(--pf-blue)" : "var(--pf-text-3)" }}
                      >
                        {i + 1}
                      </span>
                    </div>
                  )}

                  <span
                    className="text-[18px] leading-[28px] font-medium whitespace-nowrap"
                    style={{
                      color: isFuture ? "var(--pf-text-3)" : "var(--pf-ink)",
                      opacity: isFuture ? 0.5 : 1,
                    }}
                  >
                    {step.label}
                  </span>
                </div>

                {!isLast && (
                  <div
                    className="flex-1 h-0"
                    style={{
                      borderTop: `2px solid ${lineCompleted ? "var(--pf-blue)" : "var(--pf-line)"}`,
                      minWidth: 20,
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {(() => {
          const trackingNumber = order.fulfillments?.flatMap((f) => f.labels || [])?.[0]?.tracking_number
            || order.fulfillments?.flatMap((f) => f.tracking_links || [])?.[0]?.tracking_number
          return trackingNumber ? (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Link
                href={`/track/${trackingNumber}`}
                className="inline-flex items-center justify-center h-[44px] px-6 rounded-[110px] text-[14px] font-bold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(90deg, #14213D 0%, #2A4A8C 50%, #4F8AF7 100%)" }}
              >
                Track Shipment
              </Link>
              <a
                href={
                  order.fulfillments?.flatMap((f) => f.labels || [])?.[0]?.tracking_url
                  || (trackingNumber.startsWith("1Z")
                    ? `https://www.ups.com/track?tracknum=${trackingNumber}`
                    : /^9[234]\d{18,}$/.test(trackingNumber) || /^\d{20,}$/.test(trackingNumber)
                      ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
                      : `https://www.ups.com/track?tracknum=${trackingNumber}`)
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--pf-blue)] hover:underline"
              >
                View on carrier website
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          ) : null
        })()}
      </div>

      <div className="mb-6">
        <h2 className="text-[18px] lg:text-[20px] leading-[28px] font-semibold text-[var(--pf-ink)] mb-4">Ordered items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 lg:p-5 rounded-[20px]"
              style={{ background: "var(--pf-paper)" }}
            >
              <div className="w-[80px] h-[80px] lg:w-[141px] lg:h-[141px] rounded-[8px] bg-white overflow-hidden shrink-0">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--pf-ink)]/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75Z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[16px] lg:text-[20px] leading-[24px] lg:leading-[30px] font-semibold text-[var(--pf-ink)] mb-2 truncate">
                  {item.title}
                </p>
                <p className="text-[13px] lg:text-[14px] text-[var(--pf-ink)]/72 mb-2">
                  Qty: <span className="text-[14px] font-semibold text-[var(--pf-ink)]">{item.quantity}</span>
                </p>
                <p className="text-[16px] lg:text-[20px] leading-[26px] lg:leading-[32px] font-semibold text-[var(--pf-blue)]">
                  {formatPrice(item.unit_price * item.quantity, order.currency_code)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[16px] lg:text-[18px] leading-[26px] text-[var(--pf-ink)]/72 font-normal">Subtotal</span>
          <span className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)] font-semibold">
            {formatPrice(order.subtotal, order.currency_code)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[16px] lg:text-[18px] leading-[26px] text-[var(--pf-ink)]/72 font-normal">Shipping</span>
            {(order.metadata?.shippo_shipping_provider || order.metadata?.shippo_shipping_service) && (
              <span className="text-[12px] text-[var(--pf-blue)] font-medium">
                {[order.metadata.shippo_shipping_provider, order.metadata.shippo_shipping_service].filter(Boolean).join(" ")}
                {order.metadata.shippo_shipping_estimated_days && ` — ${order.metadata.shippo_shipping_estimated_days} business days`}
              </span>
            )}
          </div>
          <span className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)] font-semibold">
            {(() => {
              const shippo = order.metadata?.shippo_shipping_cost
              const cost = shippo != null ? Number(shippo) : (order.shipping_total || 0)
              return cost === 0 && order.metadata?.shippo_shipping_free ? "FREE" : formatPrice(cost, order.currency_code)
            })()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[16px] lg:text-[18px] leading-[26px] text-[var(--pf-ink)]/72 font-normal">Tax</span>
          <span className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)] font-semibold">
            {formatPrice(order.metadata?.tax_amount != null ? Number(order.metadata.tax_amount) : order.tax_total, order.currency_code)}
          </span>
        </div>
        {((order as any).discount_total || 0) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[16px] lg:text-[18px] leading-[26px] text-[var(--pf-ok)] font-normal">Discount</span>
            <span className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ok)] font-semibold">
              -{formatPrice((order as any).discount_total, order.currency_code)}
            </span>
          </div>
        )}
        <div className="border-t border-[var(--pf-line)] pt-3 flex items-center justify-between">
          <span className="text-[16px] lg:text-[18px] leading-[26px] text-[var(--pf-ink)] font-semibold">Net total</span>
          <span className="text-[16px] lg:text-[18px] leading-[26px] text-[var(--pf-ink)] font-bold">
            {(() => {
              const customerPaid = order.metadata?.customer_paid_total
              if (customerPaid != null && Number(customerPaid) > 0) {
                return formatPrice(Number(customerPaid), order.currency_code)
              }
              const shippo = order.metadata?.shippo_shipping_cost
              const medusaShipping = order.shipping_total || 0
              const shippoShipping = shippo != null ? Number(shippo) : 0
              const taxAmt = order.metadata?.tax_amount != null ? Number(order.metadata.tax_amount) : (order.tax_total || 0)
              const total = order.total + taxAmt + (shippoShipping > medusaShipping ? shippoShipping - medusaShipping : 0)
              return formatPrice(total, order.currency_code)
            })()}
          </span>
        </div>
      </div>

      {order.shipping_address && (
        <div className="border border-[var(--pf-line)] rounded-[24px] p-5 mb-6">
          <h2 className="text-[18px] lg:text-[20px] leading-[28px] font-semibold text-[var(--pf-ink)] mb-3">Delivery address</h2>
          <div className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)] space-y-0.5">
            <p className="font-semibold">
              {order.shipping_address.first_name} {order.shipping_address.last_name}
            </p>
            <p className="text-[var(--pf-ink)]/72">{order.shipping_address.address_1}</p>
            {order.shipping_address.address_2 && (
              <p className="text-[var(--pf-ink)]/72">{order.shipping_address.address_2}</p>
            )}
            <p className="text-[var(--pf-ink)]/72">
              {order.shipping_address.city}
              {order.shipping_address.province ? `, ${order.shipping_address.province}` : ""}{" "}
              {order.shipping_address.postal_code}
            </p>
            <p className="text-[var(--pf-ink)]/72 uppercase">{order.shipping_address.country_code}</p>
            {order.shipping_address.phone && (
              <p className="text-[var(--pf-ink)]/72">{order.shipping_address.phone}</p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleDownloadInvoice}
        className="inline-flex items-center justify-center h-[48px] px-8 rounded-[110px] text-[16px] leading-[24px] font-bold transition"
        style={{ color: "var(--pf-blue)", background: "var(--pf-blue-tint)" }}
      >
        Download invoice
      </button>
    </div>
  )
}
