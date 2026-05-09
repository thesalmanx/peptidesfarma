"use client"

import { useEffect } from "react"
import { trackViewItem } from "@/lib/gtag"

export default function TrackViewItem({
  id,
  name,
  price,
  currency,
}: {
  id: string
  name: string
  price?: number
  currency?: string
}) {
  useEffect(() => {
    trackViewItem({ id, name, price, currency })
  }, [id, name, price, currency])

  return null
}
