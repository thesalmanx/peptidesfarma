"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/format-price"
import { useAuth } from "@/lib/auth-context"
import { ORDER_NUMBER_OFFSET } from "@/lib/constants"

interface Order {
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
  items: {
    id: string
    title: string
    thumbnail: string | null
    quantity: number
    unit_price: number
  }[]
  fulfillments?: {
    id: string
    labels?: { tracking_number: string }[]
    tracking_links?: { tracking_number: string }[]
  }[]
}

function getTrackingLabel(fulfillmentStatus: string, paymentStatus: string): string {
  if (fulfillmentStatus === "delivered") return "Delivered"
  if (fulfillmentStatus === "shipped") return "Shipped"
  if (fulfillmentStatus === "fulfilled" || fulfillmentStatus === "partially_fulfilled") return "Packing"
  if (paymentStatus === "captured") return "Packing"
  return "Order placed"
}

function getTrackingId(order: Order): string | null {
  const labels = order.fulfillments?.flatMap((f) => f.labels || []) || []
  if (labels[0]?.tracking_number) return labels[0].tracking_number
  const links = order.fulfillments?.flatMap((f) => f.tracking_links || []) || []
  return links[0]?.tracking_number || null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { customer } = useAuth()

  useEffect(() => {
    if (!customer?.email) {
      setLoading(false)
      return
    }
    // Fetch orders by email (handles guest → registered mismatch)
    fetch(`/api/account/orders?email=${encodeURIComponent(customer.email)}`)
      .then((r) => r.json())
      .then(({ orders }) => setOrders(orders as Order[]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [customer?.email])

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
        <span>My orders</span>
      </div>
      <div className="mb-6">
        <h1 className="text-[24px] leading-[36px] font-semibold text-[var(--pf-ink)] mb-1">My orders</h1>
        <p className="text-[14px] leading-[22px] text-[var(--pf-ink)]/72">
          View and track all your orders in one place.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--pf-blue)]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-[var(--pf-ink)]/20 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <h3 className="text-[18px] font-semibold text-[var(--pf-ink)] mb-1">No orders yet</h3>
          <p className="text-[14px] text-[var(--pf-ink)]/72 mb-4">
            When you make a purchase, your orders will appear here.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center h-[48px] px-8 rounded-[110px] bg-[var(--pf-blue)] text-white font-semibold text-[14px] hover:opacity-90 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block border border-[var(--pf-line)] rounded-[24px] p-5 hover:border-[var(--pf-blue-soft)] transition group"
            >
              <div className="flex flex-wrap items-start gap-y-3 gap-x-6 lg:gap-x-10 mb-3">
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
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)] font-semibold">{getTrackingLabel(order.fulfillment_status, order.payment_status)}</p>
                    {getTrackingId(order) && (
                      <span
                        onClick={(e) => {
                          e.preventDefault()
                          window.location.href = `/track/${getTrackingId(order)}`
                        }}
                        className="text-[12px] leading-[18px] text-[var(--pf-blue)] font-medium hover:underline cursor-pointer"
                      >
                        {getTrackingId(order)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-[80px]">
                  <p className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-ink)]/72 font-normal">Total</p>
                  <p className="text-[14px] lg:text-[16px] leading-[24px] text-[var(--pf-blue)] font-semibold">
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
                  </p>
                </div>
              </div>

              {order.items.length > 0 && (
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--pf-line)]/60">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="w-[40px] h-[40px] rounded-[8px] bg-[var(--pf-blue)]/8 overflow-hidden border-2 border-white shrink-0">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--pf-blue)]/40 text-[10px]">?</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-[13px] text-[var(--pf-ink)]/60">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </span>
                  <span className="ml-auto text-[13px] text-[var(--pf-blue)] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    View details
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
