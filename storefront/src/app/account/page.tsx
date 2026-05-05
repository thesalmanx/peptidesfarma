"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState, useCallback } from "react"
import { sdk } from "@/lib/medusa"
import Link from "next/link"
import Image from "next/image"
import { ORDER_NUMBER_OFFSET } from "@/lib/constants"

interface OrderItem {
  id: string
  title: string
  thumbnail: string | null
  quantity: number
  unit_price: number
}

interface Order {
  id: string
  display_id: number
  created_at: string
  total: number
  currency_code: string
  fulfillment_status: string
  payment_status: string
  items: OrderItem[]
}

interface Subscription {
  id: number
  email: string
  status: string
  amount_cents: number
  currency: string
  interval_type: string
  items: any[]
  next_billing_date: string
  created_at: string
  last_payment_date: string | null
}

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

export default function AccountOverviewPage() {
  const { customer } = useAuth()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loadingSubs, setLoadingSubs] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    sdk.store.order
      .list({ limit: 4, order: "-created_at" })
      .then(({ orders }) => setRecentOrders(orders as unknown as Order[]))
      .catch(() => {})
      .finally(() => setLoadingOrders(false))
  }, [])

  const fetchSubscriptions = useCallback(async () => {
    if (!customer?.email || !MEDUSA_URL) {
      setLoadingSubs(false)
      return
    }
    try {
      const res = await fetch(`${MEDUSA_URL}/store/subscriptions?email=${encodeURIComponent(customer.email)}`)
      const data = await res.json()
      setSubscriptions(data.subscriptions || [])
    } catch {
      // Ignore
    } finally {
      setLoadingSubs(false)
    }
  }, [customer?.email])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const handleSubAction = async (subId: number, action: "pause" | "resume" | "cancel") => {
    setActionLoading(subId)
    try {
      const sub = subscriptions.find((s) => s.id === subId)
      await fetch("/api/stripe/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subId,
          action,
          email: sub?.email,
          amountCents: sub?.amount_cents,
        }),
      })

      await fetchSubscriptions()
    } catch {
      // Ignore
    } finally {
      setActionLoading(null)
    }
  }

  const firstName = customer?.first_name || "there"
  const activeSub = subscriptions.find((s) => s.status === "active" || s.status === "paused")

  return (
    <div className="w-full max-w-[1280px] flex flex-col gap-4 lg:gap-6">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[14px] font-medium leading-[22px] tracking-[0.02em] text-[#242424]">
            <Link href="/" className="hover:underline">Home</Link>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.67} stroke="currentColor" className="w-3.5 h-3.5 -rotate-90">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
            <span>Account</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.67} stroke="currentColor" className="w-3.5 h-3.5 -rotate-90">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
            <span>Overview</span>
          </div>

          <h1 className="text-[20px] lg:text-[24px] font-semibold leading-[30px] lg:leading-[36px] tracking-[-0.03em] text-[#242424]">
            Welcome back, {firstName}.
          </h1>

          <p className="text-[12px] lg:text-[14px] font-medium leading-[18px] lg:leading-[22px] tracking-[-0.02em] text-[#595959]">
            You can manage your account and orders here.
          </p>
        </div>

      </section>

      <section className="flex flex-col gap-4 lg:gap-6">
        <h2 className="text-[20px] lg:text-[24px] font-semibold leading-[30px] lg:leading-[36px] tracking-[-0.03em] text-[#242424]">
          Orders
        </h2>

        {loadingOrders ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#4F8AF7] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-8 border border-black/12 rounded-[24px] text-center" style={{ boxShadow: "inset 0px 4px 74px rgba(34, 138, 227, 0.05)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#D4D4D8] mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <p className="text-[16px] font-semibold text-[#242424] mb-1">No orders yet</p>
              <p className="text-[14px] text-[#595959]">When you make a purchase, your orders will appear here.</p>
              <Link
                href="/products"
                className="btn-primary mt-4 inline-flex items-center justify-center px-5 py-3 h-[48px] rounded-[110px] text-[16px] font-bold text-white"
              >
                Start shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
              {recentOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            <Link
              href="/account/orders"
              className="btn-primary inline-flex items-center justify-center self-stretch lg:self-start px-5 py-3 h-[48px] rounded-[110px] text-[16px] font-bold leading-[24px] tracking-[-0.01em] text-white"
            >
              View all orders
            </Link>
          </>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  const statusColors: Record<string, { bg: string; dot: string }> = {
    active: { bg: "bg-[#DEF8E9]", dot: "bg-[#25A75D]" },
    paused: { bg: "bg-[#FEF3C7]", dot: "bg-[#F59E0B]" },
    canceled: { bg: "bg-[#FEE2E2]", dot: "bg-[#EF4444]" },
    payment_failed: { bg: "bg-[#FEE2E2]", dot: "bg-[#EF4444]" },
  }

  return (
    <div className="flex flex-col gap-1 lg:gap-2 p-2 px-3 lg:px-5 lg:py-4 bg-white border border-[#E0E0E0] rounded-[12px] lg:rounded-[20px]">
      <span className="text-[11px] lg:text-[16px] font-normal leading-[18px] lg:leading-[24px] tracking-[-0.01em] text-[#242424]/70">
        {label}
      </span>
      {badge ? (
        <span className={`inline-flex items-center gap-1 w-fit px-2 lg:px-3 py-1 ${statusColors[value]?.bg || "bg-gray-100"} rounded-[20px]`}>
          <span className={`w-1 h-1 rounded-full ${statusColors[value]?.dot || "bg-gray-400"}`} />
          <span className="text-[10px] lg:text-[12px] font-medium leading-[12px] lg:leading-[16px] tracking-[-0.01em] text-[#242424] capitalize">
            {value}
          </span>
        </span>
      ) : (
        <span className="text-[14px] lg:text-[16px] font-semibold leading-[22px] lg:leading-[28px] tracking-[-0.01em] text-[#242424]">
          {value}
        </span>
      )}
    </div>
  )
}

function BenefitCard({ title, description, hasIcon }: { title: string; description: string; hasIcon?: boolean }) {
  return (
    <div
      className="flex flex-col items-start p-3 px-4 lg:p-5 lg:px-6 gap-3 lg:gap-4 bg-white border border-black/12 rounded-[12px] lg:rounded-[24px]"
      style={{ boxShadow: "inset 0px 4px 74px rgba(34, 138, 227, 0.05)" }}
    >
      {hasIcon && <Image src="/icons/laurel-wreath.svg" alt="" width={24} height={24} className="lg:w-10 lg:h-10" />}
      <div className="flex flex-col gap-3">
        <h3 className="text-[16px] lg:text-[20px] font-semibold leading-[24px] tracking-[-0.03em] text-[#242424]">{title}</h3>
        <p className="text-[14px] lg:text-[16px] font-normal leading-[20px] lg:leading-[24px] tracking-[-0.01em] text-[#242424]">{description}</p>
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
  const firstItem = order.items?.[0]
  const orderDate = new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

  return (
    <div
      className="flex flex-col items-start p-3 lg:p-6 lg:py-8 gap-3 lg:gap-4 bg-white border border-black/12 rounded-[24px]"
      style={{ boxShadow: "inset 0px 4px 74px rgba(34, 138, 227, 0.05)" }}
    >
      <h3 className="text-[16px] lg:text-[24px] font-semibold leading-[24px] lg:leading-[36px] tracking-[-0.03em] text-[#242424]">
        Order of {itemCount} item{itemCount !== 1 ? "s" : ""} is being processed
      </h3>

      <div className="w-full lg:w-[160px] aspect-square lg:h-[160px] rounded-[12px] bg-[#F2F7FD] overflow-hidden relative">
        {firstItem?.thumbnail ? (
          <Image src={firstItem.thumbnail} alt={firstItem.title || "Product"} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 160px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#A1A1AA]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M18 7.5h.008M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V4.5a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 3.75 21Z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 w-full">
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-[12px] lg:text-[16px] font-normal leading-[18px] lg:leading-[24px] tracking-[-0.01em] text-[#242424]/70">Order date</span>
          <span className="text-[14px] lg:text-[16px] font-semibold leading-[22px] lg:leading-[24px] tracking-[-0.01em] text-[#242424]">{orderDate}</span>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-[12px] lg:text-[16px] font-normal leading-[18px] lg:leading-[24px] tracking-[-0.01em] text-[#242424]/70">Order number</span>
          <span className="text-[14px] lg:text-[16px] font-semibold leading-[22px] lg:leading-[24px] tracking-[-0.01em] text-[#242424]">{order.display_id + ORDER_NUMBER_OFFSET}</span>
        </div>
      </div>

      <Link
        href={`/account/orders/${order.id}`}
        className="group inline-flex items-center justify-center self-stretch lg:self-start h-[48px] rounded-[110px] text-[16px] font-medium lg:font-bold leading-[24px] tracking-[-0.01em] text-[#242424] bg-[#4F8AF7]/20 hover:bg-[#4F8AF7]/25 transition-colors"
        style={{ padding: "12px 28px 12px 24px" }}
      >
        View order details
        <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </Link>
    </div>
  )
}
