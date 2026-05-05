import { NextRequest, NextResponse } from "next/server"

import crypto from "crypto"

let _stripe: any = null
function getStripe() { if (!_stripe) { const S = require("stripe").default || require("stripe"); _stripe = new S(process.env.STRIPE_SECRET_KEY || ""); } return _stripe; }
const VALID_CURRENCIES = new Set(["usd", "eur", "gbp", "cad", "aud"])
const MAX_AMOUNT = 50000 // $50,000 max
const AMOUNT_TOLERANCE_CENTS = 2 // Allow ±2 cents for rounding

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, intentId, cartId } = await request.json()

    if (!amount || typeof amount !== "number" || amount <= 0 || amount > MAX_AMOUNT) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const normCurrency = (currency || "usd").toLowerCase()
    if (!VALID_CURRENCIES.has(normCurrency)) {
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 })
    }

    const amountInCents = Math.round((amount * 100 + Number.EPSILON) * 1)

    // Server-side cart validation: verify payment amount is not below cart item subtotal.
    // Note: Shipping is calculated externally via Shippo and added client-side,
    // so the payment total will be >= cart subtotal. We check the amount isn't
    // suspiciously LOWER than the cart items (fraud prevention).
    if (cartId) {
      try {
        const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        if (medusaUrl && pubKey) {
          const cartRes = await fetch(`${medusaUrl}/store/carts/${cartId}`, {
            headers: {
              "x-publishable-api-key": pubKey,
              "Content-Type": "application/json",
            },
          })
          if (cartRes.ok) {
            const { cart: serverCart } = await cartRes.json()
            // Use item_subtotal (items only, before shipping/tax) as the floor
            const cartSubtotal = serverCart?.item_subtotal ?? serverCart?.subtotal ?? serverCart?.total ?? 0
            // Payment must be at least the item subtotal (shipping adds to it)
            if (amountInCents < cartSubtotal - AMOUNT_TOLERANCE_CENTS) {
              console.error("Payment amount below cart subtotal", {
                requested: amountInCents,
                cartSubtotal,
                cartId,
              })
              return NextResponse.json(
                { error: "Payment amount is invalid. Please refresh and try again." },
                { status: 400 }
              )
            }
          }
        }
      } catch (verifyErr) {
        // Log but don't block — cart verification is a safety net
        console.warn("Cart verification failed, proceeding with caution:", verifyErr)
      }
    }

    // If intentId provided, update existing PaymentIntent (e.g. shipping rate changed)
    if (intentId && typeof intentId === "string" && intentId.startsWith("pi_")) {
      await getStripe().paymentIntents.update(intentId, { amount: amountInCents })
      return NextResponse.json({ updated: true })
    }

    // Otherwise create new PaymentIntent with idempotency key
    try {
      const paymentIntent = await getStripe().paymentIntents.create(
        {
          amount: amountInCents,
          currency: normCurrency,
          automatic_payment_methods: { enabled: true },
        },
        { idempotencyKey: `pi_create_${cartId || crypto.randomUUID()}_${amountInCents}_${normCurrency}` }
      )
      return NextResponse.json({ clientSecret: paymentIntent.client_secret })
    } catch (idempotencyErr: any) {
      if (idempotencyErr.type === "StripeIdempotencyError") {
        // Idempotency conflict (cart params changed) — create without key
        const paymentIntent = await getStripe().paymentIntents.create({
          amount: amountInCents,
          currency: normCurrency,
          automatic_payment_methods: { enabled: true },
        })
        return NextResponse.json({ clientSecret: paymentIntent.client_secret })
      }
      throw idempotencyErr
    }
  } catch (error: any) {
    console.error("Stripe intent error:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
