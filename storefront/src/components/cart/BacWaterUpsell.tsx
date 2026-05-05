"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"

const BAC_WATER_HANDLE = "bac-water"
const BAC_WATER_THUMBNAIL = "https://peptidesfarma-cdn.sfo3.digitaloceanspaces.com/BAC%20Water-01KJR0K3N93BGS2RS7ENCMYQ1D.jpg"

interface BacVariant {
  id: string
  title: string
  price: number
}

export default function BacWaterUpsell() {
  const { cart, addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [variants, setVariants] = useState<BacVariant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  const items = cart?.items ?? []

  const hasBacWater = items.some(
    (item) => (item as any).product_handle === BAC_WATER_HANDLE || item.product_title?.toLowerCase().includes("bac water")
  )

  // Fetch BAC Water variants once
  useEffect(() => {
    if (items.length === 0 || hasBacWater || dismissed) return
    const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (!medusaUrl || !pubKey) return

    fetch(
      `${medusaUrl}/store/products?handle=${BAC_WATER_HANDLE}&fields=variants.id,variants.title,variants.calculated_price`,
      { headers: { "x-publishable-api-key": pubKey } }
    )
      .then((r) => r.json())
      .then((data) => {
        const product = data.products?.[0]
        const vs = (product?.variants || []).map((v: any) => ({
          id: v.id,
          title: v.title || "Default",
          price: v.calculated_price?.calculated_amount ?? 0,
        }))
        setVariants(vs)
        if (vs.length > 0) setSelectedVariant(vs[0].id)
      })
      .catch(() => {})
  }, [items.length, hasBacWater, dismissed])

  if (items.length === 0 || hasBacWater || dismissed || variants.length === 0) return null

  const selected = variants.find((v) => v.id === selectedVariant) || variants[0]

  const handleAdd = async () => {
    if (adding || !selected) return
    setAdding(true)
    try {
      await addItem(selected.id, 1)
    } catch {
      // Not critical
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="rounded-[14px] border border-[#242424]/8 bg-[#fafafa]"
      style={{ padding: "10px 12px" }}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-[44px] h-[44px] rounded-[8px] overflow-hidden bg-[#F2F7FD]">
          <Image
            src={BAC_WATER_THUMBNAIL}
            alt="BAC Water"
            width={44}
            height={44}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#242424] leading-[18px]">
            Don&apos;t forget BAC Water
          </p>
          <p className="text-[12px] text-[#6B7280] leading-[16px]">
            Required &middot; ${selected.price.toFixed(2)}
          </p>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding}
          className="shrink-0 flex items-center justify-center h-[34px] px-4 rounded-[8px] bg-[#242424] text-white text-[13px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {adding ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 20" />
            </svg>
          ) : (
            "+ Add"
          )}
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 w-5 h-5 flex items-center justify-center text-[#999] hover:text-[#333] transition-colors"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M14 6L6 14M6 6L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Variant selector */}
      {variants.length > 1 && (
        <div className="flex items-center gap-2 mt-2 pl-[56px]">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariant(v.id)}
              className={`h-[28px] px-3 rounded-full text-[12px] font-semibold transition-all ${
                selectedVariant === v.id
                  ? "bg-[#242424] text-white"
                  : "bg-white border border-[#242424]/15 text-[#555] hover:border-[#242424]/30"
              }`}
            >
              {v.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
