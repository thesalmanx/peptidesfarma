"use client"

import { useEffect } from "react"
import { trackViewItemList } from "@/lib/gtag"

export default function TrackViewItemList({
  listName,
  items,
}: {
  listName: string
  items: { id: string; name: string; price?: number }[]
}) {
  useEffect(() => {
    trackViewItemList(listName, items)
  }, [listName, items])

  return null
}
