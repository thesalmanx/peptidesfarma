import { NextRequest, NextResponse } from "next/server"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function medusa(path: string, options: RequestInit = {}) {
  const res = await fetch(`${MEDUSA_URL}${path}`, {
    ...options,
    headers: {
      "x-publishable-api-key": PUB_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || `Medusa ${path} failed (${res.status})`)
  }
  return data
}

export async function POST(request: NextRequest) {
  try {
    const { cartId, form, selectedShippoRate, calculatedTotal, tax, taxRate, taxJurisdiction } = await request.json()

    if (!cartId) {
      return NextResponse.json({ error: "Missing cartId" }, { status: 400 })
    }

    // If form data is available (from sessionStorage), update the cart.
    // If not (sessionStorage lost), skip update — cart already has address from checkout page.
    let cartData: any
    const shippingData = await medusa(`/store/shipping-options?cart_id=${cartId}`)

    if (form?.email) {
      const [first_name, ...rest] = (form.full_name || "").trim().split(" ")
      const last_name = rest.join(" ") || first_name
      const countryCode = (form.country_code || "us").toLowerCase()

      cartData = await medusa(`/store/carts/${cartId}`, {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          shipping_address: { first_name, last_name, address_1: form.address_1, address_2: form.address_2 || undefined, city: form.city, province: form.province, postal_code: form.postal_code, country_code: countryCode, phone: form.phone },
          billing_address: { first_name, last_name, address_1: form.address_1, address_2: form.address_2 || undefined, city: form.city, province: form.province, postal_code: form.postal_code, country_code: countryCode, phone: form.phone },
          metadata: {
            payment_method: "venmo",
            customer_paid_total: String(calculatedTotal),
            tax_amount: String(tax || 0),
            tax_rate: String(taxRate || 0),
            tax_jurisdiction: taxJurisdiction || "",
            ...(selectedShippoRate ? {
              shippo_shipping_cost: selectedShippoRate.amount,
              shippo_shipping_provider: selectedShippoRate.provider,
              shippo_shipping_service: selectedShippoRate.service,
              shippo_shipping_estimated_days: selectedShippoRate.estimatedDays,
              shippo_shipping_free: selectedShippoRate.freeShipping,
              shippo_rate_id: selectedShippoRate.id,
            } : {}),
          },
        }),
      })
    } else {
      // No form data — just retrieve the existing cart (address already set)
      cartData = await medusa(`/store/carts/${cartId}`)
    }

    // Step 2: Add shipping method
    const options = shippingData?.shipping_options || []
    let shippingAdded = false
    if (options.length) {
      const sorted = [...options].sort((a: any, b: any) => (a.price_type === "calculated" ? 0 : 1) - (b.price_type === "calculated" ? 0 : 1))
      for (const opt of sorted) {
        try {
          await medusa(`/store/carts/${cartId}/shipping-methods`, {
            method: "POST",
            body: JSON.stringify({ option_id: opt.id }),
          })
          shippingAdded = true
          break
        } catch {}
      }
    }
    if (!shippingAdded) {
      return NextResponse.json({ error: "Unable to set up shipping. Please check your address." }, { status: 400 })
    }

    // Step 3: Init payment session (create collection if needed, then init session)
    const cart = cartData?.cart
    let pcId = cart?.payment_collection?.id
    if (!pcId) {
      const pcRes = await medusa(`/store/payment-collections`, {
        method: "POST",
        body: JSON.stringify({ cart_id: cartId }),
      })
      pcId = pcRes?.payment_collection?.id
    }
    if (!pcId) {
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
    }
    await medusa(`/store/payment-collections/${pcId}/payment-sessions`, {
      method: "POST",
      body: JSON.stringify({ provider_id: "pp_system_default" }),
    })

    // Step 4: Complete cart
    const completeRes = await medusa(`/store/carts/${cartId}/complete`, { method: "POST" })

    if (!completeRes?.order?.id) {
      return NextResponse.json({ error: "Order completion failed. Please try again." }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      orderId: completeRes.order.id,
      orderDisplayId: completeRes.order.display_id,
      order: completeRes.order,
    })
  } catch (error: any) {
    console.error("Complete Venmo error:", error?.message || error)
    return NextResponse.json({ error: error?.message || "Order failed. Please try again." }, { status: 500 })
  }
}
