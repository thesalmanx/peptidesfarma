import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID
const SQUARE_ENVIRONMENT = process.env.SQUARE_ENVIRONMENT || "sandbox"

const BASE_URL =
  SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"

const HEADERS = {
  "Square-Version": "2024-11-20",
  Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
}

async function squarePost(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  })
  const text = await res.text()
  try {
    return { ok: res.ok, data: JSON.parse(text) }
  } catch {
    return { ok: false, data: { errors: [{ detail: text.slice(0, 300) }] } }
  }
}

const AMOUNT_TOLERANCE_CENTS = 2 // Allow ±2 cents for rounding

export async function POST(request: NextRequest) {
  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return NextResponse.json({ error: "Square not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const {
      sourceId,   // Card nonce from Web Payments SDK
      amount,     // Total amount in dollars (e.g. 42.5 for $42.50)
      currency,   // Currency code, defaults to "USD"
      orderId,    // Optional Medusa order ID for reference
      cartId,     // Medusa cart ID for server-side validation
    } = body

    if (!sourceId || !amount) {
      return NextResponse.json({ error: "Missing required fields: sourceId and amount" }, { status: 400 })
    }

    const amountInCents = Math.round(amount * 100)

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
              console.error("Square payment amount below cart subtotal", {
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
        console.warn("Cart verification failed, proceeding with caution:", verifyErr)
      }
    }

    // IMPORTANT: Only send the total amount to Square.
    // Do NOT include product names, descriptions, SKUs, or line items.
    // Idempotency key tied to cartId prevents double-charging on retries.
    const paymentBody: any = {
      source_id: sourceId,
      idempotency_key: cartId ? `pay_${cartId}_${amountInCents}` : crypto.randomUUID(),
      amount_money: {
        amount: amountInCents,
        currency: (currency || "USD").toUpperCase(),
      },
      location_id: SQUARE_LOCATION_ID,
      autocomplete: true,
    }

    // Attach Medusa order ID as reference_id if provided (no product details)
    if (orderId) {
      paymentBody.reference_id = orderId
    }

    const paymentRes = await squarePost("/v2/payments", paymentBody)

    if (!paymentRes.ok) {
      return NextResponse.json(
        { error: paymentRes.data.errors?.[0]?.detail || "Payment failed" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentRes.data.payment.id,
      status: paymentRes.data.payment.status,
      receiptUrl: paymentRes.data.payment.receipt_url,
      amountCents: amountInCents,
      currency: (currency || "USD").toUpperCase(),
      orderId: orderId || null,
    })
  } catch (error: any) {
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: "Payment processing failed. Please try again." },
      { status: 500 }
    )
  }
}
