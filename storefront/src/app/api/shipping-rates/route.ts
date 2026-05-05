import { NextRequest, NextResponse } from "next/server"
import { FREE_STANDARD_THRESHOLD, FREE_2DAY_THRESHOLD } from "@/lib/constants"

const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY

const FROM_ADDRESS = {
  name: "Peptidesfarma",
  street1: "1 Park Plaza",
  city: "Irvine",
  state: "CA",
  zip: "92612",
  country: "US",
  phone: "+19492347217",
  email: "support@peptidesfarma.com",
}

// Fallback rates when Shippo fails or returns nothing
const FALLBACK_RATES = [
  { id: "fallback_ground", token: "ups_ground", provider: "UPS", service: "Ground", amount: 9.99, originalAmount: 9.99, currency: "USD", estimatedDays: 5, duration: "3-5 business days", freeShipping: false },
  { id: "fallback_priority", token: "usps_priority", provider: "USPS", service: "Priority Mail", amount: 12.99, originalAmount: 12.99, currency: "USD", estimatedDays: 3, duration: "2-3 business days", freeShipping: false },
  { id: "fallback_2day", token: "ups_second_day_air", provider: "UPS", service: "2nd Day Air", amount: 19.99, originalAmount: 19.99, currency: "USD", estimatedDays: 2, duration: "2 business days", freeShipping: false },
]

export async function POST(request: NextRequest) {
  if (!SHIPPO_API_KEY) {
    return NextResponse.json({ rates: applyFreeShipping(FALLBACK_RATES, 0) })
  }

  try {
    const body = await request.json()
    const { address, items, subtotal } = body

    if (!address?.postal_code || !address?.country_code) {
      return NextResponse.json({ error: "Address with postal code required" }, { status: 400 })
    }

    // Package weight: 1 lb (box) + 0.1 lb per item
    const totalItems = (items || []).reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) || 1
    const weightLbs = 1 + totalItems * 0.1

    // Create shipment to get rates
    const shipmentRes = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address_from: FROM_ADDRESS,
        address_to: {
          name: address.name || "Customer",
          street1: address.address_1 || "",
          street2: address.address_2 || address.apt || "",
          city: address.city || "",
          state: address.province || "",
          zip: address.postal_code,
          country: (address.country_code || "US").toUpperCase(),
        },
        parcels: [
          {
            length: "8",
            width: "5",
            height: "2",
            distance_unit: "in",
            weight: String(weightLbs),
            mass_unit: "lb",
          },
        ],
        async: false,
      }),
    })

    if (!shipmentRes.ok) {
      console.error("Shippo shipment error:", await shipmentRes.text())
      return NextResponse.json({ rates: applyFreeShipping(FALLBACK_RATES, subtotal || 0) })
    }

    const shipment = await shipmentRes.json()
    const countryCode = (address.country_code || "US").toUpperCase()
    const isDomestic = countryCode === "US"

    // For US: show specific services. For international: show all available
    const allowedDomesticServices = new Set([
      "ups_ground",
      "usps_priority",
      "ups_second_day_air",
    ])

    // Filter, deduplicate by service token (keep cheapest), then sort
    const seenTokens = new Map<string, any>()
    for (const r of shipment.rates || []) {
      if (!r.amount || parseFloat(r.amount) <= 0) continue
      const token = r.servicelevel?.token || ""
      if (isDomestic && !allowedDomesticServices.has(token)) continue
      const existing = seenTokens.get(token)
      if (!existing || parseFloat(r.amount) < parseFloat(existing.amount)) {
        seenTokens.set(token, r)
      }
    }

    const orderSubtotal = typeof subtotal === "number" ? subtotal : 0

    const rates = Array.from(seenTokens.values())
      .sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount))
      .map((r: any) => {
        const token = r.servicelevel?.token || ""
        let amount = parseFloat(r.amount)

        if (isDomestic) {
          if (orderSubtotal >= FREE_STANDARD_THRESHOLD && token === "ups_ground") {
            amount = 0
          }
          if (orderSubtotal >= FREE_2DAY_THRESHOLD && (token === "usps_priority" || token === "ups_second_day_air")) {
            amount = 0
          }
        }

        return {
          id: r.object_id,
          token: r.servicelevel?.token || "",
          provider: r.provider,
          service: r.servicelevel?.name || r.servicelevel?.token || "Standard",
          amount,
          originalAmount: parseFloat(r.amount),
          currency: r.currency || "USD",
          estimatedDays: r.estimated_days || null,
          duration: r.duration_terms || null,
          freeShipping: amount === 0,
        }
      })

    // If Shippo returned no valid rates, use fallback
    if (rates.length === 0) {
      return NextResponse.json({ rates: applyFreeShipping(FALLBACK_RATES, orderSubtotal) })
    }

    return NextResponse.json({ rates })
  } catch (error: any) {
    console.error("Shipping rates error:", error)
    return NextResponse.json({ rates: applyFreeShipping(FALLBACK_RATES, 0) })
  }
}

function applyFreeShipping(rates: typeof FALLBACK_RATES, subtotal: number) {
  return rates.map(r => {
    let amount = r.amount
    if (subtotal >= FREE_STANDARD_THRESHOLD && r.service.includes("Ground")) {
      amount = 0
    }
    if (subtotal >= FREE_2DAY_THRESHOLD && (r.service.includes("Priority") || r.service.includes("2nd Day"))) {
      amount = 0
    }
    return { ...r, amount, freeShipping: amount === 0 }
  })
}
