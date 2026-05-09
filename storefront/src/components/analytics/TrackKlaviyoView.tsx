"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"

interface Props {
  productId: string
  productName: string
  variantId?: string
  variantName?: string
  sku?: string
  price?: number
  currency?: string
  url: string
  imageUrl?: string
}

// Fires the Klaviyo "Viewed Product" event once per page mount for
// identified (logged-in) customers. Triggers the Browse Abandonment flow.
// Anonymous visitors are skipped -- Klaviyo cannot fire the flow without
// a known email to attach the event to.
export default function TrackKlaviyoView(props: Props) {
  const { customer } = useAuth()
  const firedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!customer?.email) return
    // Dedupe: don't re-fire for same product on re-render
    const fingerprint = `${customer.email}::${props.productId}`
    if (firedRef.current === fingerprint) return
    firedRef.current = fingerprint

    fetch("/api/klaviyo/viewed-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customer.email,
        first_name: customer.first_name || undefined,
        last_name: customer.last_name || undefined,
        product_id: props.productId,
        product_name: props.productName,
        variant_id: props.variantId,
        variant_name: props.variantName,
        sku: props.sku,
        price: props.price,
        currency: props.currency,
        url: props.url,
        image_url: props.imageUrl,
      }),
    }).catch(() => {
      // Fire-and-forget; never surface to user
    })
  }, [
    customer?.email,
    customer?.first_name,
    customer?.last_name,
    props.productId,
    props.productName,
    props.variantId,
    props.variantName,
    props.sku,
    props.price,
    props.currency,
    props.url,
    props.imageUrl,
  ])

  return null
}
