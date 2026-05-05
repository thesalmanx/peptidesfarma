"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format-price"
import CartItem from "@/components/cart/CartItem"
import BacWaterUpsell from "@/components/cart/BacWaterUpsell"
import { trackViewCart } from "@/lib/gtag"

export default function CartPage() {
  const { cart, isLoading, itemCount } = useCart()
  const hasTracked = useRef(false)

  const items = cart?.items ?? []
  const subtotal = cart?.subtotal ?? 0
  const shipping = cart?.shipping_total ?? 0
  const tax = cart?.tax_total ?? 0
  const total = cart?.total ?? 0
  const currencyCode = cart?.currency_code ?? "usd"

  // GA4: track view_cart once when items load
  useEffect(() => {
    if (items.length > 0 && !hasTracked.current) {
      hasTracked.current = true
      trackViewCart(
        items.map((item) => ({
          id: item.product_id || item.id,
          name: item.product_title || "",
          variant: item.variant_title || undefined,
          price: (item.unit_price ?? 0) / 100,
          quantity: item.quantity,
        })),
        currencyCode.toUpperCase(),
        total / 100
      )
    }
  }, [items, currencyCode, total])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: "80px 40px" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-dark" />
      </div>
    )
  }

  return (
    <main
      className="mx-auto w-full px-5 md:px-20"
      style={{ maxWidth: "1440px", paddingTop: "40px", paddingBottom: "80px" }}
    >
      <h1
        className="mb-8 md:mb-10"
        style={{
          fontWeight: 700,
          fontSize: "36px",
          lineHeight: "44px",
          letterSpacing: "-0.03em",
          color: "#242424",
        }}
      >
        Shopping{" "}
        <span style={{ color: "#4F8AF7" }}>cart</span>
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="w-20 h-20 text-gray-300 mx-auto mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
          <p style={{ fontSize: "18px", color: "#595959", marginBottom: "16px" }}>
            Your cart is empty
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center hover:opacity-90 transition-opacity"
            style={{
              padding: "12px 32px",
              height: "48px",
              background: "linear-gradient(90deg, #4F8AF7, #36848E)",
              borderRadius: "110px",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "24px",
              color: "#FFFFFF",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div
          className="flex flex-col lg:flex-row lg:justify-between"
          style={{ gap: "40px" }}
        >
          <div className="flex flex-col min-w-0" style={{ gap: "16px", maxWidth: "780px", width: "100%" }}>
            {items.map((item) => (
              <CartItem key={item.id} item={item} variant="page" />
            ))}
            <BacWaterUpsell />
          </div>

          <div
            className="flex flex-col"
            style={{ gap: "20px", width: "415px", flexShrink: 0 }}
          >
            <div
              className="flex flex-col"
              style={{
                padding: "32px",
                gap: "32px",
                background:
                  "linear-gradient(95.01deg, rgba(17, 92, 111, 0.08) 16.35%, rgba(54, 132, 142, 0.08) 68.78%)",
                borderRadius: "24px",
              }}
            >
              <div
                className="flex flex-col items-start self-stretch"
                style={{ gap: "20px" }}
              >
                <h2
                  className="self-stretch"
                  style={{
                    fontWeight: 600,
                    fontSize: "28px",
                    lineHeight: "40px",
                    letterSpacing: "-1px",
                    color: "#242424",
                  }}
                >
                  Order summary
                </h2>

                <div
                  className="flex items-center justify-between self-stretch"
                  style={{ height: "26px" }}
                >
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: "18px",
                      lineHeight: "26px",
                      color: "rgba(36, 36, 36, 0.72)",
                    }}
                  >
                    Subtotal
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "18px",
                      lineHeight: "26px",
                      color: "#242424",
                    }}
                  >
                    {formatPrice(subtotal, currencyCode)}
                  </span>
                </div>

                <div
                  className="self-stretch"
                  style={{ height: "0px", border: "0.5px solid #DAD0CD" }}
                />
                <div
                  className="flex items-center justify-between self-stretch"
                  style={{ height: "26px" }}
                >
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: "18px",
                        lineHeight: "26px",
                        color: "rgba(36, 36, 36, 0.72)",
                      }}
                    >
                      Shipping estimate
                    </span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8.33" stroke="#242424" strokeWidth="1.6" />
                      <path
                        d="M8 7.5C8 6.12 8.9 5.42 10 5.42C11.1 5.42 12 6.12 12 7.5C12 8.4 11.3 9.1 10.5 9.4C10.2 9.5 10 9.8 10 10.2V10.83"
                        stroke="#242424"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="10" cy="13.75" r="0.83" fill="#242424" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "18px",
                      lineHeight: "26px",
                      color: "#242424",
                    }}
                  >
                    {shipping > 0 ? formatPrice(shipping, currencyCode) : "Free"}
                  </span>
                </div>

                <div
                  className="self-stretch"
                  style={{ height: "0px", border: "0.5px solid #DAD0CD" }}
                />
                <div
                  className="flex items-center justify-between self-stretch"
                  style={{ height: "26px" }}
                >
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: "18px",
                        lineHeight: "26px",
                        color: "rgba(36, 36, 36, 0.72)",
                      }}
                    >
                      Tax estimate
                    </span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8.33" stroke="#242424" strokeWidth="1.6" />
                      <path
                        d="M8 7.5C8 6.12 8.9 5.42 10 5.42C11.1 5.42 12 6.12 12 7.5C12 8.4 11.3 9.1 10.5 9.4C10.2 9.5 10 9.8 10 10.2V10.83"
                        stroke="#242424"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="10" cy="13.75" r="0.83" fill="#242424" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "18px",
                      lineHeight: "26px",
                      color: "#242424",
                    }}
                  >
                    {tax > 0 ? formatPrice(tax, currencyCode) : "$0.00"}
                  </span>
                </div>

                <div
                  className="self-stretch"
                  style={{ height: "0px", border: "0.5px solid #DAD0CD" }}
                />
                <div
                  className="flex items-center justify-between self-stretch"
                  style={{ height: "30px" }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "24px",
                      lineHeight: "125%",
                      letterSpacing: "-1px",
                      color: "#242424",
                    }}
                  >
                    Order total
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "24px",
                      lineHeight: "125%",
                      color: "#14213D",
                    }}
                  >
                    {formatPrice(total, currencyCode)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="btn-primary w-full flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{
                  padding: "12px 16px",
                  height: "48px",
                  borderRadius: "110px",
                  fontWeight: 700,
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "-0.01em",
                  color: "#FFFFFF",
                }}
              >
                Check out
              </Link>
            </div>

            <div
              className="flex flex-col"
              style={{
                padding: "32px",
                gap: "32px",
                background:
                  "linear-gradient(95.01deg, rgba(17, 92, 111, 0.08) 16.35%, rgba(54, 132, 142, 0.08) 68.78%)",
                borderRadius: "24px",
              }}
            >
              <div className="flex flex-col" style={{ gap: "20px" }}>
                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: "28px",
                    lineHeight: "40px",
                    letterSpacing: "-1px",
                    color: "#242424",
                  }}
                >
                  Payment methods
                </h3>

                <div className="flex items-center" style={{ gap: "20px" }}>
                  <Image src="/icons/gpay.svg" alt="Google Pay" width={32} height={32} />
                  <Image src="/icons/stripe.svg" alt="Stripe" width={32} height={32} />
                  <Image src="/icons/applepay.svg" alt="Apple Pay" width={32} height={32} />
                  <Image src="/icons/mastercard.svg" alt="Mastercard" width={38} height={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
