import { NextRequest, NextResponse } from "next/server"

// Lazy-init Stripe only when actually called (avoids build errors if key is missing)
let _stripe: any = null
function getStripe() {
  if (!_stripe) {
    const Stripe = require("stripe").default || require("stripe")
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")
  }
  return _stripe
}
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
  const text = await res.text()
  try { return JSON.parse(text) } catch { return { _raw: text, _status: res.status } }
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"
    const { cartId, form, selectedShippoRate, calculatedTotal, currencyCode } = await request.json()

    if (!cartId || !form?.email || !calculatedTotal) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    const [first_name, ...rest] = (form.full_name || "").trim().split(" ")
    const last_name = rest.join(" ") || first_name
    const countryCode = (form.country_code || "us").toLowerCase()
    const normCurrency = (currencyCode || "usd").toLowerCase()
    const amountInCents = Math.round(calculatedTotal * 100)

    // Run ALL three in parallel: cart update + list shipping + create Stripe session
    const [, shippingData, session] = await Promise.all([
      medusa(`/store/carts/${cartId}`, {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          shipping_address: { first_name, last_name, address_1: form.address_1, address_2: form.address_2 || undefined, city: form.city, province: form.province, postal_code: form.postal_code, country_code: countryCode, phone: form.phone },
          billing_address: { first_name, last_name, address_1: form.address_1, address_2: form.address_2 || undefined, city: form.city, province: form.province, postal_code: form.postal_code, country_code: countryCode, phone: form.phone },
          metadata: {
            payment_method: "stripe",
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
      }),
      medusa(`/store/shipping-options?cart_id=${cartId}`),
      getStripe().checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: normCurrency,
            product_data: { name: form.full_name || "Payment" },
            unit_amount: amountInCents,
          },
          quantity: 1,
        }],
        ...(form.email && { customer_email: form.email }),
        metadata: { cartId },
        custom_text: { shipping_address: null, submit: null },
        success_url: `${origin}/checkout/stripe-callback?session_id={CHECKOUT_SESSION_ID}&cart_id=${cartId}`,
        cancel_url: `${origin}/checkout?step=2`,
      }),
    ])

    // Add shipping method (depends on cart update completing)
    const options = shippingData?.shipping_options || []
    if (options.length) {
      const sorted = [...options].sort((a: any, b: any) => (a.price_type === "calculated" ? 0 : 1) - (b.price_type === "calculated" ? 0 : 1))
      for (const opt of sorted) {
        const addRes = await medusa(`/store/carts/${cartId}/shipping-methods`, {
          method: "POST",
          body: JSON.stringify({ option_id: opt.id }),
        })
        if (!addRes?._raw) break
      }
    }

    // Save Stripe session ID to cart (non-blocking)
    medusa(`/store/carts/${cartId}`, {
      method: "POST",
      body: JSON.stringify({ metadata: { stripe_checkout_session_id: session.id } }),
    }).catch(() => {})

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error("Prepare Stripe error:", error)
    return NextResponse.json({ error: error?.message || "Failed to start checkout" }, { status: 500 })
  }
}
