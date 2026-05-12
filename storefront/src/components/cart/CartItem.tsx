"use client"

import Image from "next/image"
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

  // Drawer variant
  return (
    <div style={{ borderBottom: "1px solid var(--pf-line)", paddingBottom: 16 }}>
      <div className="flex" style={{ gap: 14 }}>
        {/* Thumbnail */}
        <div className="shrink-0 relative overflow-hidden" style={{ width: 80, height: 80, background: "var(--pf-paper)", borderRadius: 16 }}>
          {thumbnail ? (
            <Image src={thumbnail} alt={title} fill className="object-cover" sizes="80px" style={{ objectPosition: "80% center" }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between min-w-0" style={{ flex: "1 1 0%", minHeight: 80 }}>
          {/* Top row: title + price */}
          <div>
            <div className="flex items-start justify-between" style={{ gap: 8 }}>
              <h4 className="truncate" style={{ fontWeight: 600, fontSize: 15, lineHeight: "22px", letterSpacing: "-0.01em", color: "var(--pf-ink)", margin: 0 }}>
                {title}
              </h4>
              <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: "var(--pf-ink)", flexShrink: 0 }}>
                {formatPrice(total, currencyCode)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {variantLabel && (
                <span style={{ fontSize: 12, color: "var(--pf-text-3)", fontWeight: 400 }}>
                  {variantLabel}
                </span>
              )}
              {isSubscription && (
                <span className="inline-flex items-center gap-1 px-2 py-px rounded-full text-[10px] font-semibold uppercase" style={{ background: "var(--pf-blue)", color: "#fff" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" /></svg>
                  Monthly
                </span>
              )}
            </div>
          </div>

          {/* Bottom row: qty + remove */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center" style={{ background: "var(--pf-paper)", borderRadius: 10, height: 32, padding: "0 4px" }}>
              <button onClick={() => handleQuantity(item.quantity - 1)} aria-label="Decrease" className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-white active:scale-90 transition-all" style={{ width: 28, height: 28, background: "transparent", border: "none", borderRadius: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pf-text-3)"><path d="M19 13H5v-2h14v2z" /></svg>
              </button>
              <span style={{ width: 28, fontWeight: 600, fontSize: 14, textAlign: "center", color: "var(--pf-ink)" }}>{item.quantity}</span>
              <button onClick={() => handleQuantity(item.quantity + 1)} aria-label="Increase" className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-white active:scale-90 transition-all" style={{ width: 28, height: 28, background: "transparent", border: "none", borderRadius: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pf-text-3)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
              </button>
            </div>
            <button onClick={handleRemove} className="flex items-center gap-1 hover:opacity-60 transition-opacity" aria-label="Remove item" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: 12, color: "var(--pf-text-3)", fontFamily: "inherit" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
