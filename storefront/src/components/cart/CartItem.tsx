"use client"

import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"
import type { HttpTypes } from "@medusajs/types"

interface CartItemProps {
  item: HttpTypes.StoreCartLineItem
  variant?: "drawer" | "page"
}

export default function CartItem({ item, variant = "drawer" }: CartItemProps) {
  const { updateItem, removeItem } = useCart()

  const thumbnail = item.thumbnail
  const variantLabel = item.variant_title && item.variant_title.toLowerCase() !== "default" ? item.variant_title : null
  const title = item.product_title || item.title
  const price = item.unit_price ?? 0
  const currencyCode = item.metadata?.currency_code as string || "usd"
  const total = item.total ?? price * item.quantity
  const isSubscription = !!item.metadata?.subscription

  const handleQuantity = (newQty: number) => {
    if (newQty < 1) return
    updateItem(item.id, newQty)
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  if (variant === "page") {
    return (
      <div
        className="flex"
        style={{
          padding: 20, gap: 20,
          background: "var(--pf-paper)",
          border: "1px solid var(--pf-line)",
          borderRadius: 20,
        }}
      >
        <div
          className="shrink-0 relative overflow-hidden hidden sm:block"
          style={{ width: 120, height: 120, background: "#fff", borderRadius: 14 }}
        >
          {thumbnail ? (
            <Image src={thumbnail} alt={title} fill className="object-cover" sizes="120px" style={{ objectPosition: "80% center" }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
          )}
        </div>

        <div className="shrink-0 relative overflow-hidden sm:hidden" style={{ width: 80, height: 80, background: "#fff", borderRadius: 12 }}>
          {thumbnail ? (
            <Image src={thumbnail} alt={title} fill className="object-cover" sizes="80px" style={{ objectPosition: "80% center" }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
          )}
        </div>

        <div className="flex flex-col justify-between flex-1 min-w-0" style={{ minHeight: 100 }}>
          <div>
            <h3 className="truncate" style={{ fontWeight: 600, fontSize: 18, lineHeight: "28px", letterSpacing: "-0.02em", color: "var(--pf-ink)" }}>
              {title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {variantLabel && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: "rgba(0,28,134,0.08)", color: "var(--pf-blue)" }}>
                  {variantLabel}
                </span>
              )}
              {isSubscription && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase" style={{ background: "var(--pf-blue)", color: "#fff" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" /></svg>
                  Monthly
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0 mt-3">
            <button onClick={() => handleQuantity(item.quantity - 1)} aria-label="Decrease" className="flex items-center justify-center shrink-0 cursor-pointer hover:opacity-70 active:scale-90 transition-transform" style={{ width: 32, height: 32, background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pf-ink)"><path d="M19 13H5v-2h14v2z" /></svg>
            </button>
            <span style={{ width: 36, fontWeight: 600, fontSize: 16, textAlign: "center", color: "var(--pf-ink)" }}>{item.quantity}</span>
            <button onClick={() => handleQuantity(item.quantity + 1)} aria-label="Increase" className="flex items-center justify-center shrink-0 cursor-pointer hover:opacity-70 active:scale-90 transition-transform" style={{ width: 32, height: 32, background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pf-ink)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between shrink-0" style={{ minHeight: 100 }}>
          <span style={{ fontWeight: 700, fontSize: 18, lineHeight: "28px", letterSpacing: "-0.02em", color: "var(--pf-ink)" }}>
            {formatPrice(total, currencyCode)}
          </span>
          <button onClick={handleRemove} className="cursor-pointer hover:opacity-70 transition-opacity" aria-label="Remove item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--pf-text-3)"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
          </button>
        </div>
      </div>
    )
  }

  // Drawer variant — NH-style layout with exact NH SVG icons
  return (
    <div className="flex items-start" style={{ paddingBottom: 16, borderBottom: "1px solid var(--pf-line)" }}>
      {/* Image — NH: square, bordered, object-contain, linked */}
      <div className="shrink-0 mr-3">
        <Link href={`/product/${(item as any).product_handle || ""}`}>
          <div className="relative rounded-md overflow-hidden flex items-center justify-center aspect-square" style={{ width: 72, minWidth: 72, border: "1px solid var(--pf-line)", background: "#fff" }}>
            {thumbnail ? (
              <Image src={thumbnail} alt={title} fill className="object-contain p-1" sizes="72px" quality={50} loading="eager" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><span className="text-xs" style={{ color: "var(--pf-text-3)" }}>No img</span></div>
            )}
          </div>
        </Link>
      </div>

      {/* Content column */}
      <div className="flex flex-col w-full">
        {/* Top row: title/variant + trash */}
        <div className="flex justify-between items-start mb-0.5">
          <div>
            <Link href={`/product/${(item as any).product_handle || ""}`} style={{ textDecoration: "none" }}>
              <h5 className="cursor-pointer mb-0.5" style={{ fontWeight: 600, fontSize: 14, lineHeight: "140%", color: "var(--pf-ink)", margin: 0 }}>
                {title}
              </h5>
            </Link>
            {variantLabel && (
              <span style={{ fontSize: 12, color: "var(--pf-text-3)" }}>{variantLabel}</span>
            )}
            {isSubscription && (
              <span className="inline-flex items-center gap-1 px-2 py-px rounded-full text-[10px] font-semibold uppercase mt-0.5" style={{ background: "var(--pf-blue)", color: "#fff" }}>Monthly</span>
            )}
          </div>
          {/* NH trash icon (exact SVG) */}
          <div
            onClick={handleRemove}
            className="ml-3.5 shrink-0 flex items-center justify-center cursor-pointer hover:opacity-60 transition-opacity"
            style={{ width: 30, height: 30 }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path stroke="var(--pf-text-3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15.834 5.833-.723 10.12A1.667 1.667 0 0 1 13.45 17.5H6.553c-.875 0-1.6-.676-1.663-1.548L4.167 5.833m4.167 3.334v5m3.333-5v5m.834-8.334v-2.5a.833.833 0 0 0-.834-.833H8.334a.833.833 0 0 0-.833.833v2.5m-4.167 0h13.333" />
            </svg>
          </div>
        </div>

        {/* Bottom row: price + qty stepper */}
        <div className="flex justify-between items-center" style={{ marginTop: 8 }}>
          <span style={{ fontWeight: 500, fontSize: 14, color: "var(--pf-ink)" }}>
            {formatPrice(total, currencyCode)}
          </span>

          {/* NH qty stepper: bordered box, exact minus/plus SVGs */}
          <div className="flex items-center border-2 border-solid rounded-md" style={{ borderColor: "var(--pf-ink)" }}>
            <button
              type="button"
              onClick={() => handleQuantity(item.quantity - 1)}
              aria-label="Decrease"
              disabled={item.quantity <= 1}
              className="flex items-center justify-center bg-transparent border-none cursor-pointer hover:opacity-60 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{ width: 28, height: 28 }}
            >
              {/* NH minus SVG */}
              <svg width="16" height="16" viewBox="0 0 20 21" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M3 10.574C3 10.0217 3.44772 9.57397 4 9.57397L16 9.57398C16.5523 9.57398 17 10.0217 17 10.574C17 11.1263 16.5523 11.574 16 11.574L4 11.574C3.44772 11.574 3 11.1263 3 10.574Z" fill="currentColor" />
              </svg>
            </button>
            <span className="font-medium" style={{ width: 20, textAlign: "center", fontSize: 14, color: "var(--pf-ink)" }}>
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantity(item.quantity + 1)}
              aria-label="Increase"
              className="flex items-center justify-center bg-transparent border-none cursor-pointer hover:opacity-60 transition-opacity"
              style={{ width: 28, height: 28 }}
            >
              {/* NH plus SVG */}
              <svg width="16" height="16" viewBox="0 0 20 21" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 3.57397C10.5523 3.57397 11 4.02169 11 4.57397V9.57397H16C16.5523 9.57397 17 10.0217 17 10.574C17 11.1263 16.5523 11.574 16 11.574H11V16.574C11 17.1263 10.5523 17.574 10 17.574C9.44772 17.574 9 17.1263 9 16.574V11.574H4C3.44772 11.574 3 11.1263 3 10.574C3 10.0217 3.44772 9.57397 4 9.57397L9 9.57397V4.57397C9 4.02169 9.44772 3.57397 10 3.57397Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
