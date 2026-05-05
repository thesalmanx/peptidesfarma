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
          boxSizing: "border-box",
          padding: "20px",
          gap: "20px",
          background:
            "linear-gradient(95.01deg, rgba(17, 92, 111, 0.08) 16.35%, rgba(54, 132, 142, 0.08) 68.78%), #FFFFFF",
          border: "2px solid rgba(144, 183, 188, 0.08)",
          borderRadius: "20px",
        }}
      >
        <style>{`
          @keyframes qty-pop {
            0% { transform: scale(1); }
            40% { transform: scale(1.35); }
            100% { transform: scale(1); }
          }
          .qty-num { display: inline-block; }
          .qty-btn { transition: transform 0.1s ease; }
          .qty-btn:active { transform: scale(0.85); }
        `}</style>

        <div
          className="shrink-0 relative overflow-hidden hidden sm:block"
          style={{
            width: "141px",
            height: "141px",
            background: "#F2F7FD",
            borderRadius: "8px",
          }}
        >
          {thumbnail ? (
            <Image src={thumbnail} alt={title} fill className="object-cover" sizes="141px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No img
            </div>
          )}
        </div>

        <div
          className="shrink-0 relative overflow-hidden sm:hidden"
          style={{
            width: "80px",
            height: "80px",
            background: "#F2F7FD",
            borderRadius: "8px",
          }}
        >
          {thumbnail ? (
            <Image src={thumbnail} alt={title} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No img
            </div>
          )}
        </div>

        <div
          className="flex flex-col justify-between flex-1 min-w-0"
          style={{ minHeight: "100px" }}
        >
          <div>
            <h3
              className="truncate"
              style={{
                fontWeight: 600,
                fontSize: "20px",
                lineHeight: "30px",
                letterSpacing: "-0.02em",
                color: "#242424",
              }}
            >
              {title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {variantLabel && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
                  style={{ background: "rgba(17,92,111,0.08)", color: "#4F8AF7" }}>
                  {variantLabel}
                </span>
              )}
              {isSubscription && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase"
                  style={{ background: "linear-gradient(90deg, #4F8AF7 0%, #4F8AF7 100%)", color: "#fff" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                  </svg>
                  Monthly
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <span
              style={{
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "24px",
                color: "rgba(56, 54, 55, 0.72)",
              }}
            >
              Quantity
            </span>

            <div className="flex items-center" style={{ gap: "0px" }}>
              <button
                onClick={() => handleQuantity(item.quantity - 1)}
                aria-label="Decrease quantity"
                className="qty-btn flex items-center justify-center shrink-0 cursor-pointer hover:opacity-70"
                style={{
                  boxSizing: "border-box",
                  width: "28px",
                  height: "28px",
                  padding: "6px",
                  background: "#FFFFFF",
                  border: "1px solid #242424",
                  borderRadius: "8px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <line
                    x1="3.33"
                    y1="8"
                    x2="12.67"
                    y2="8"
                    stroke="#242424"
                    strokeWidth="1.67"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <span
                key={item.quantity}
                className="qty-num"
                style={{
                  width: "33px",
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "28px",
                  textAlign: "center",
                  color: "#242424",
                  animation: "qty-pop 0.25s ease-out",
                }}
              >
                {item.quantity}
              </span>

              <button
                onClick={() => handleQuantity(item.quantity + 1)}
                aria-label="Increase quantity"
                className="qty-btn flex items-center justify-center shrink-0 cursor-pointer hover:opacity-70"
                style={{
                  boxSizing: "border-box",
                  width: "28px",
                  height: "28px",
                  padding: "6px",
                  background: "#FFFFFF",
                  border: "1px solid #242424",
                  borderRadius: "8px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <line
                    x1="3.33"
                    y1="8"
                    x2="12.67"
                    y2="8"
                    stroke="#242424"
                    strokeWidth="1.67"
                    strokeLinecap="round"
                  />
                  <line
                    x1="8"
                    y1="3.33"
                    x2="8"
                    y2="12.67"
                    stroke="#242424"
                    strokeWidth="1.67"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col items-end justify-between shrink-0"
          style={{ minHeight: "100px" }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "20px",
              lineHeight: "30px",
              letterSpacing: "-0.02em",
              color: "#4F8AF7",
            }}
          >
            {formatPrice(total, currencyCode)}
          </span>

          <button
            onClick={handleRemove}
            className="cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="Remove item"
          >
            <Image src="/icons/trash-03.svg" alt="" width={24} height={24} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative flex items-start"
      style={{
        boxSizing: "border-box",
        padding: "12px",
        gap: "12px",
        minHeight: "108px",
        background:
          "linear-gradient(95.01deg, rgba(17, 92, 111, 0.08) 16.35%, rgba(54, 132, 142, 0.08) 68.78%), #FFFFFF",
        border: "2px solid rgba(144, 183, 188, 0.08)",
        borderRadius: "16px",
      }}
    >
      <style>{`
        @keyframes qty-pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        .qty-num { display: inline-block; }
        .qty-btn { transition: transform 0.1s ease; }
        .qty-btn:active { transform: scale(0.85); }
      `}</style>

      <div
        className="shrink-0 relative overflow-hidden"
        style={{
          width: "80px",
          height: "80px",
          background: "#F2F7FD",
          borderRadius: "12px",
        }}
      >
        {thumbnail ? (
          <Image src={thumbnail} alt={title} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            No img
          </div>
        )}
      </div>

      <div
        className="flex flex-col justify-between items-start min-w-0"
        style={{ flex: "1 1 0%", minHeight: "80px" }}
      >
        <div className="flex items-start justify-between w-full" style={{ gap: "8px" }}>
          <div className="min-w-0 flex-1">
            <h4
              className="truncate"
              style={{
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "30px",
                letterSpacing: "-0.02em",
                color: "#141414",
              }}
            >
              {title}
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              {variantLabel && (
                <span className="inline-flex items-center px-1.5 py-px rounded text-[10px] font-medium"
                  style={{ background: "rgba(17,92,111,0.08)", color: "#4F8AF7" }}>
                  {variantLabel}
                </span>
              )}
              {isSubscription && (
                <span className="inline-flex items-center gap-1 px-2 py-px rounded-full text-[10px] font-semibold tracking-wide uppercase"
                  style={{ background: "linear-gradient(90deg, #4F8AF7 0%, #4F8AF7 100%)", color: "#fff" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                  </svg>
                  Monthly
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="shrink-0 hover:opacity-70 transition-opacity"
            style={{ width: "20px", height: "20px" }}
            aria-label="Remove item"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M14 6L6 14M6 6L14 14"
                stroke="#141B34"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-end justify-between w-full">
          <div className="flex items-center">
            <button
              onClick={() => handleQuantity(item.quantity - 1)}
              aria-label="Decrease quantity"
              className="qty-btn flex items-center justify-center shrink-0"
              style={{
                boxSizing: "border-box",
                width: "28px",
                height: "28px",
                padding: "6px",
                background: "#FFFFFF",
                border: "1px solid #242424",
                borderRadius: "8px",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <line
                  x1="3.33"
                  y1="8"
                  x2="12.67"
                  y2="8"
                  stroke="#242424"
                  strokeWidth="1.67"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <span
              key={item.quantity}
              className="qty-num"
              style={{
                width: "33px",
                fontWeight: 600,
                fontSize: "18px",
                lineHeight: "28px",
                textAlign: "center",
                color: "#242424",
                animation: "qty-pop 0.25s ease-out",
              }}
            >
              {item.quantity}
            </span>

            <button
              onClick={() => handleQuantity(item.quantity + 1)}
              aria-label="Increase quantity"
              className="qty-btn flex items-center justify-center shrink-0"
              style={{
                boxSizing: "border-box",
                width: "28px",
                height: "28px",
                padding: "6px",
                background: "#FFFFFF",
                border: "1px solid #242424",
                borderRadius: "8px",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <line
                  x1="3.33"
                  y1="8"
                  x2="12.67"
                  y2="8"
                  stroke="#242424"
                  strokeWidth="1.67"
                  strokeLinecap="round"
                />
                <line
                  x1="8"
                  y1="3.33"
                  x2="8"
                  y2="12.67"
                  stroke="#242424"
                  strokeWidth="1.67"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div
            className="flex flex-col justify-center items-start"
            style={{ gap: "2px" }}
          >
            <span
              style={{
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "18px",
                color: "#333333",
              }}
            >
              Price
            </span>
            <span
              style={{
                fontWeight: 600,
                fontSize: "20px",
                lineHeight: "24px",
                letterSpacing: "-0.02em",
                color: "#141414",
              }}
            >
              {formatPrice(total, currencyCode)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
