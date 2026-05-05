import { NextRequest, NextResponse } from "next/server"


let _stripe: any = null
function getStripe() { if (!_stripe) { const S = require("stripe").default || require("stripe"); _stripe = new S(process.env.STRIPE_SECRET_KEY || ""); } return _stripe; }

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || request.headers.get("referer")?.replace(/\/[^/]*$/, "") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const { amount, currency, cartId, customerName, customerEmail } = await request.json()

    if (!amount || typeof amount !== "number" || amount <= 0 || amount > 50000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    if (!cartId) {
      return NextResponse.json({ error: "Cart ID required" }, { status: 400 })
    }

    // Quick duplicate check — fetch cart metadata in background, don't block session creation
    const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    let duplicateError: string | null = null
    const duplicateCheckPromise = (medusaUrl && pubKey) ? (async () => {
      try {
        const cartRes = await fetch(`${medusaUrl}/store/carts/${cartId}`, {
          headers: { "x-publishable-api-key": pubKey },
        })
        if (!cartRes.ok) return
        const cartData = await cartRes.json()
        const existingSessionId = cartData?.cart?.metadata?.stripe_checkout_session_id
        if (existingSessionId) {
          try {
            const existingSession = await getStripe().checkout.sessions.retrieve(existingSessionId)
            if (existingSession.payment_status === "paid") {
              duplicateError = "This order has already been paid. If you were not redirected, please contact support@peptidesfarma.com."
            }
          } catch {}
        }
      } catch {}
    })() : Promise.resolve()

    const normCurrency = (currency || "usd").toLowerCase()
    const amountInCents = Math.round(amount * 100)

    // Create Stripe session + run duplicate check in parallel
    const [session] = await Promise.all([
      getStripe().checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: normCurrency,
              product_data: { name: customerName || "Payment" },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        ...(customerEmail && { customer_email: customerEmail }),
        metadata: { cartId },
        custom_text: { shipping_address: null, submit: null },
        success_url: `${origin}/checkout/stripe-callback?session_id={CHECKOUT_SESSION_ID}&cart_id=${cartId}`,
        cancel_url: `${origin}/checkout?step=2`,
      }),
      duplicateCheckPromise,
    ])

    // If duplicate was detected during parallel check, abort
    if (duplicateError) {
      return NextResponse.json({ error: duplicateError }, { status: 409 })
    }

    // Save session ID to cart metadata in background (don't block response)
    if (medusaUrl && pubKey) {
      fetch(`${medusaUrl}/store/carts/${cartId}`, {
        method: "POST",
        headers: { "x-publishable-api-key": pubKey, "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: { stripe_checkout_session_id: session.id } }),
      }).catch(() => {})
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error("Stripe checkout session error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
