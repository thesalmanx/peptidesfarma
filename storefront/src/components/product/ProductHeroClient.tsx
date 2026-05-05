"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import QuantitySelector from "./QuantitySelector"
import { useCart } from "@/lib/cart-context"

interface ProductOption {
  id: string
  title: string
  values: { id: string; value: string }[]
}

interface ProductVariantImage {
  id: string
  url: string
}

interface ProductVariant {
  id: string
  title: string
  options: Record<string, string>
  images?: ProductVariantImage[]
  metadata_image?: string | null
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  }
  inventory_quantity?: number
}

interface HeroContent {
  title: string
  subtitle: string | null
  subscriptionText: string | null
  heroImage?: string | null
}

// Products that should show "Out of Stock" on product page even if technically in stock.
// Customers can still add these via cart upsell (e.g. BAC Water alongside a peptide).
const HIDE_FROM_PRODUCT_PAGE = ["bac-water"]

interface ProductHeroClientProps {
  product: {
    title: string
    subtitle: string | null
  }
  handle?: string
  options: ProductOption[]
  variants: ProductVariant[]
  layout: "mobile" | "desktop"
  mobileImageUrl?: string
  mobileImageAlt?: string
  heroContent?: HeroContent | null
  selectedOptions: Record<string, string>
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

export default function ProductHeroClient({
  product,
  handle,
  options,
  variants,
  layout,
  mobileImageUrl,
  mobileImageAlt,
  heroContent,
  selectedOptions,
  setSelectedOptions,
}: ProductHeroClientProps) {
  const displayTitle = heroContent?.title || product.title
  const displaySubtitle = heroContent?.subtitle || product.subtitle || `${product.title} | Research Peptide`
  const subscriptionText = heroContent?.subscriptionText || "$85/month when you upgrade to a monthly subscription."
  // Helper: is a variant out of stock based on its inventory_quantity?
  // (null/undefined = treat as in stock — backend would return null for unmanaged inventory)
  const isVariantOutOfStockByObj = (v: ProductVariant | undefined): boolean => {
    if (!v) return false
    return v.inventory_quantity != null && v.inventory_quantity <= 0
  }

  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState("")
  const [notifySubmitting, setNotifySubmitting] = useState(false)
  const [notifySubmitted, setNotifySubmitted] = useState(false)
  const { addItem } = useCart()
  const mobileRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (layout === "mobile" && mobileRef.current) {
      let lastWidth = window.innerWidth
      const update = () => {
        if (mobileRef.current) {
          mobileRef.current.style.height = `${window.innerHeight - 104}px`
        }
      }
      update()

      const handleOrientation = () => {
        setTimeout(update, 150)
        setTimeout(update, 350)
      }

      const handleResize = () => {
        const newWidth = window.innerWidth
        if (Math.abs(newWidth - lastWidth) > 50) {
          lastWidth = newWidth
          update()
        }
      }

      window.addEventListener("orientationchange", handleOrientation)
      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("orientationchange", handleOrientation)
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [layout])

  const selectedVariant = variants.find((variant) =>
    Object.entries(selectedOptions).every(
      ([key, value]) => variant.options[key] === value
    )
  )

  // Given an option title + value, find the variant that would be selected if the
  // customer clicked it (keeping any other selected options fixed), and return
  // whether it is out of stock. Used to strikethrough sold-out size pills.
  const variantForOption = (optionTitle: string, value: string): ProductVariant | undefined => {
    const hypothetical = { ...selectedOptions, [optionTitle]: value }
    return variants.find((variant) =>
      Object.entries(hypothetical).every(([k, v]) => variant.options[k] === v)
    )
  }
  const isOptionValueOutOfStock = (optionTitle: string, value: string): boolean =>
    isVariantOutOfStockByObj(variantForOption(optionTitle, value))

  const price = selectedVariant?.calculated_price
  const formattedPrice = price
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: price.currency_code,
      }).format(price.calculated_amount * quantity)
    : null

  const selectedFirstValue = options[0] ? selectedOptions[options[0].title] || "" : ""
  const hasMultipleVariants = options.some((o) => o.values.length > 1)
  const isDefaultVariant = (val: string) => val.toLowerCase() === "default"

  const formatUnit = (val: string) => val.replace(/\s+(mg|ml|mcg|iu|mb)\s*$/i, "$1")

  const [addError, setAddError] = useState(false)
  // Variant IDs we learned are out of stock from a failed add (covers the
  // stocked-vs-available gap: storefront sees stocked_quantity, backend rejects
  // when reservations eat available to 0).
  const [learnedOutOfStock, setLearnedOutOfStock] = useState<Set<string>>(new Set())

  const isStockError = (err: unknown): boolean => {
    const msg = (err instanceof Error ? err.message : String(err || "")).toLowerCase()
    const code = typeof (err as any)?.code === "string" ? ((err as any).code as string).toLowerCase() : ""
    if (code.includes("insufficient_inventory") || code.includes("out_of_stock")) return true
    return (
      msg.includes("not enough stock") ||
      msg.includes("insufficient inventory") ||
      msg.includes("insufficient_inventory") ||
      msg.includes("required inventory") ||
      msg.includes("out of stock") ||
      msg.includes("no inventory") ||
      msg.includes("stock available") ||
      msg.includes("does not have sufficient") ||
      msg.includes("does not have the required")
    )
  }

  const handleAddToCart = async () => {
    if (!selectedVariant || adding || added) return
    setAdding(true)
    setAddError(false)
    try {
      await addItem(selectedVariant.id, quantity)
      setAdding(false)
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    } catch (err) {
      setAdding(false)
      if (isStockError(err) && selectedVariant) {
        setLearnedOutOfStock((prev) => {
          const next = new Set(prev)
          next.add(selectedVariant.id)
          return next
        })
      } else {
        setAddError(true)
        setTimeout(() => setAddError(false), 2500)
      }
    }
  }

  const isOutOfStock = (handle && HIDE_FROM_PRODUCT_PAGE.includes(handle))
    || (selectedVariant
      ? learnedOutOfStock.has(selectedVariant.id)
        || (selectedVariant.inventory_quantity != null && selectedVariant.inventory_quantity <= 0)
      : false)

  const handleNotify = async () => {
    if (!notifyEmail || notifySubmitting || notifySubmitted) return
    setNotifySubmitting(true)
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: notifyEmail,
          productName: product.title,
          variantTitle: selectedVariant?.title || "",
          variantId: selectedVariant?.id || "",
        }),
      })
      setNotifySubmitting(false)
      setNotifySubmitted(true)
    } catch {
      setNotifySubmitting(false)
    }
  }

  const handleSubscribe = async () => {
    if (!selectedVariant || subscribing || subscribed) return
    setSubscribing(true)
    try {
      await addItem(selectedVariant.id, 1, { subscription: true, subscription_interval: "monthly" })
      setSubscribing(false)
      setSubscribed(true)
      setTimeout(() => setSubscribed(false), 1800)
    } catch (err) {
      setSubscribing(false)
      if (isStockError(err) && selectedVariant) {
        setLearnedOutOfStock((prev) => {
          const next = new Set(prev)
          next.add(selectedVariant.id)
          return next
        })
      }
    }
  }

  if (layout === "mobile") {
    return (
      <>
      <div ref={mobileRef} className="flex flex-col items-center w-full">
        <div className="flex flex-col items-center gap-2 w-full pt-4 shrink-0">
          <h1
            style={{
              fontWeight: 700,
              fontSize: "32px",
              lineHeight: "40px",
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              textAlign: "center",
            }}
          >
            {displayTitle}
          </h1>

          <div className="flex flex-col items-center gap-3 w-full">
            {selectedFirstValue && !isDefaultVariant(selectedFirstValue) && (
              <p
                style={{
                  fontWeight: 400,
                  fontSize: "20px",
                  lineHeight: "30px",
                  letterSpacing: "-0.01em",
                  color: "#FFFFFF",
                }}
              >
                Size: {selectedFirstValue}
              </p>
            )}
            <p
              style={{
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "24px",
                letterSpacing: "-0.01em",
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              {displaySubtitle}
            </p>
          </div>
        </div>

        {/* Image fills whatever space is left between the title block (above)
            and the price/variants/Add-to-cart group (below). flex-1 + min-h-0
            + overflow-hidden lets it shrink to the available vertical space.
            No fixed vw / svh / px caps — the layout is dynamic, so on a tall
            iPhone the bottle grows and on a shorter phone it shrinks, but
            every element of the hero stays inside one viewport. */}
        {mobileImageUrl && (
          <div className="flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden py-2">
            <Image
              key={mobileImageUrl}
              src={mobileImageUrl}
              alt={mobileImageAlt || product.title}
              width={1024}
              height={2336}
              className="object-contain h-full w-auto animate-variant-swap"
              style={{ maxWidth: "70vw" }}
              quality={100}
              unoptimized
              priority
            />
          </div>
        )}

        {formattedPrice && (
          <p className="font-semibold text-[32px] leading-[40px] tracking-[-0.03em] text-white text-center mt-2 shrink-0">
            {formattedPrice}
          </p>
        )}

        {hasMultipleVariants && (
          <div className="flex items-center justify-center gap-2.5 w-full py-3 px-4 shrink-0">
            {options.map((option) =>
              option.values.length > 1 && option.values.map((value) => {
                const isSelected = selectedOptions[option.title] === value.value
                const oos = isOptionValueOutOfStock(option.title, value.value)
                const label = formatUnit(value.value)
                // Auto-size: use circle for short labels, wider pill for long ones
                const isShort = label.length <= 4
                return (
                  <button
                    key={value.id}
                    onClick={() =>
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [option.title]: value.value,
                      }))
                    }
                    aria-label={oos ? `${label} — sold out` : label}
                    className="flex items-center justify-center transition-all"
                    style={{
                      width: isShort ? "46px" : "auto",
                      minWidth: isShort ? "46px" : "52px",
                      height: "46px",
                      padding: isShort ? "0" : "0 14px",
                      borderRadius: "50%",
                      background: isSelected ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)",
                      border: isSelected
                        ? "1px solid rgba(3, 80, 132, 0.2)"
                        : "1px solid rgba(255, 255, 255, 0.15)",
                      fontSize: "12px",
                      fontWeight: 700,
                      lineHeight: "14px",
                      color: isSelected ? "#14213D" : "rgba(255, 255, 255, 0.45)",
                      opacity: isSelected ? 1 : oos ? 0.35 : 0.6,
                      textDecoration: oos ? "line-through" : "none",
                    }}
                  >
                    {label}
                  </button>
                )
              })
            )}
          </div>
        )}

        {isOutOfStock ? (
          <div className="flex flex-col items-center gap-3 shrink-0 mb-2 w-full px-4">
            <div
              className="flex items-center justify-center w-full max-w-[280px] border border-white/30 opacity-60"
              style={{ height: "48px", borderRadius: "110px", padding: "10px 24px" }}
            >
              <span className="font-bold text-[18px] leading-[28px] tracking-[-0.01em] text-white/70">
                Sold out
              </span>
            </div>
            {notifySubmitted ? (
              <p className="text-[14px] text-white/80 text-center">
                We&apos;ll notify you when it&apos;s back in stock.
              </p>
            ) : (
              <div className="flex items-center gap-2 w-full max-w-[300px]">
                <input
                  type="email"
                  placeholder="Email address"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="no-focus-ring flex-1 min-w-0 h-10 px-4 rounded-full bg-white/10 border border-white/20 text-white text-[14px] placeholder:text-white/40"
                />
                <button
                  onClick={handleNotify}
                  disabled={!notifyEmail || notifySubmitting}
                  className="shrink-0 h-10 px-5 rounded-full bg-[#4F8AF7] text-white text-[13px] font-bold disabled:opacity-50 transition-opacity hover:opacity-90"
                >
                  {notifySubmitting ? "..." : "Notify me"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center shrink-0 mt-3 w-full px-4">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || adding}
              className={`flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-300 cursor-pointer w-full max-w-[280px] ${
                addError ? "bg-red-500 border-red-500" : added ? "bg-[#4F8AF7] border-[#4F8AF7]" : "bg-white border border-black/[0.24] hover:shadow-[0_0_20px_4px_rgba(17,92,111,0.25),0_0_40px_8px_rgba(17,92,111,0.10)] hover:border-[#4F8AF7]/40"
              }`}
              style={{
                height: "48px",
                borderRadius: "110px",
                padding: "10px 24px",
              }}
            >
              {adding ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#242424" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
                </svg>
              ) : addError ? (
                <span style={{ fontWeight: 700, fontSize: "16px", color: "#fff" }}>
                  Failed — try again
                </span>
              ) : added ? (
                <svg className="w-6 h-6 animate-check-pop" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    lineHeight: "28px",
                    letterSpacing: "-0.01em",
                    color: "#242424",
                  }}
                >
                  Add to cart
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Subscription temporarily hidden — re-enable when subscription flow is fixed */}
      </>
    )
  }

  return (
    <>
      <div className="relative z-[1] flex flex-col justify-between items-start w-full lg:w-auto lg:max-w-[420px] gap-8 lg:gap-[34px]">
        <div className="flex flex-col items-start gap-[14px] w-full">
          <h1 className="font-semibold text-4xl lg:text-[48px] lg:leading-[56px] tracking-[-0.03em] text-white">
            {displayTitle}
          </h1>

          <div className="flex flex-col items-start gap-3 w-full">
            {selectedFirstValue && !isDefaultVariant(selectedFirstValue) && (
              <p className="text-lg lg:text-[20px] lg:leading-[30px] tracking-[-0.01em] text-white">
                Size: {selectedFirstValue}
              </p>
            )}
            <p className="text-lg lg:text-[20px] lg:leading-[30px] tracking-[-0.01em] text-white">
              {displaySubtitle}
            </p>
          </div>

        </div>

        {isOutOfStock ? (
          <div className="flex flex-col items-center px-6 py-4 gap-3 w-full lg:max-w-[380px] bg-white/[0.12] border border-white/20 rounded-[20px]">
            <p className="font-semibold text-[16px] leading-[24px] text-white/60">Currently unavailable</p>
            {notifySubmitted ? (
              <p className="text-[14px] text-white/80 text-center">
                We&apos;ll notify you when it&apos;s back in stock.
              </p>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="email"
                  placeholder="Email address"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="no-focus-ring flex-1 min-w-0 h-10 px-4 rounded-full bg-white/10 border border-white/20 text-white text-[14px] placeholder:text-white/40"
                />
                <button
                  onClick={handleNotify}
                  disabled={!notifyEmail || notifySubmitting}
                  className="shrink-0 h-10 px-5 rounded-full bg-[#4F8AF7] text-white text-[13px] font-bold disabled:opacity-50 transition-opacity hover:opacity-90"
                >
                  {notifySubmitting ? "..." : "Notify me"}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="relative z-[2] flex flex-col justify-end items-end w-full lg:w-auto lg:max-w-[420px] lg:self-stretch gap-8 lg:gap-[34px]">
        {hasMultipleVariants && (
          <div className="flex flex-col items-end gap-4 mt-0 mb-auto">
            {options.map((option) =>
              option.values.length > 1 ? (
                <div key={option.id} className="flex items-center gap-2">
                  {option.values.map((value) => {
                    const isSelected = selectedOptions[option.title] === value.value
                    const oos = isOptionValueOutOfStock(option.title, value.value)
                    return (
                      <button
                        key={value.id}
                        onClick={() =>
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [option.title]: value.value,
                          }))
                        }
                        aria-label={oos ? `${formatUnit(value.value)} — sold out` : formatUnit(value.value)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          isSelected
                            ? "bg-white border border-[rgba(3,80,132,0.2)] text-[#14213D]"
                            : oos
                              ? "bg-white/[0.04] border border-white/[0.1] text-white/[0.35] line-through"
                              : "bg-white/[0.08] border border-white/[0.15] text-white/[0.45] opacity-60"
                        }`}
                      >
                        {formatUnit(value.value)}
                      </button>
                    )
                  })}
                </div>
              ) : null
            )}
          </div>
        )}

        <div className="flex flex-col items-end gap-6 w-full">
          {isOutOfStock ? (
            <div className="flex flex-col items-end gap-3 w-full">
              <div
                className="flex items-center justify-center rounded-[110px] w-[180px] h-10 border border-white/30 opacity-60"
              >
                <span className="font-bold text-sm leading-[30px] tracking-[-0.01em] text-white/70">
                  Sold out
                </span>
              </div>
              {notifySubmitted ? (
                <p className="text-[14px] text-white/80 text-right">
                  We&apos;ll notify you when it&apos;s back.
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="no-focus-ring h-10 w-[200px] px-4 rounded-full bg-white/10 border border-white/20 text-white text-[14px] placeholder:text-white/40"
                  />
                  <button
                    onClick={handleNotify}
                    disabled={!notifyEmail || notifySubmitting}
                    className="shrink-0 h-10 px-5 rounded-full bg-[#4F8AF7] text-white text-[13px] font-bold disabled:opacity-50 transition-opacity hover:opacity-90"
                  >
                    {notifySubmitting ? "..." : "Notify me"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-end justify-end gap-12 w-full">
              <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />

              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || adding}
                className={`flex items-center justify-center gap-2 rounded-[110px] w-[180px] h-10 disabled:opacity-50 transition-all duration-300 ${
                  addError ? "bg-red-500 border-red-500" : added ? "bg-[#4F8AF7] border-[#4F8AF7]" : "bg-white border border-black/[0.24]"
                }`}
                style={{ padding: "12px 24px" }}
              >
                {adding ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#242424" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
                  </svg>
                ) : addError ? (
                  <span className="font-bold text-sm text-white">Failed — try again</span>
                ) : added ? (
                  <svg className="w-6 h-6 animate-check-pop" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                      <path d="M6.6665 13.3333L13.9333 12.7277C16.207 12.5383 16.7174 12.0417 16.9694 9.77408L17.4998 5" stroke="#242424" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M5 5H18.3333" stroke="#242424" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M5.00016 18.3333C5.92064 18.3333 6.66683 17.5871 6.66683 16.6667C6.66683 15.7462 5.92064 15 5.00016 15C4.07969 15 3.3335 15.7462 3.3335 16.6667C3.3335 17.5871 4.07969 18.3333 5.00016 18.3333Z" stroke="#242424" strokeWidth="1.5"/>
                      <path d="M14.1667 18.3333C15.0871 18.3333 15.8333 17.5871 15.8333 16.6667C15.8333 15.7462 15.0871 15 14.1667 15C13.2462 15 12.5 15.7462 12.5 16.6667C12.5 17.5871 13.2462 18.3333 14.1667 18.3333Z" stroke="#242424" strokeWidth="1.5"/>
                      <path d="M6.6665 16.6667H12.4998" stroke="#242424" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M1.6665 1.66666H2.4715C3.25874 1.66666 3.94495 2.18715 4.13589 2.9291L6.61527 12.5637C6.74056 13.0507 6.63334 13.5664 6.32337 13.968L5.52661 15" stroke="#242424" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span className="font-bold text-sm leading-[30px] tracking-[-0.01em] text-[#242424]">
                      Add to cart
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {formattedPrice && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <p className="font-semibold text-[48px] leading-[56px] tracking-[-0.03em] text-white">
            {formattedPrice}
          </p>
        </div>
      )}
    </>
  )
}
