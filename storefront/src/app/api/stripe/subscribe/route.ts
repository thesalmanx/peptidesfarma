import { NextRequest, NextResponse } from "next/server"


let _stripe: any = null
function getStripe() { if (!_stripe) { const S = require("stripe").default || require("stripe"); _stripe = new S(process.env.STRIPE_SECRET_KEY || ""); } return _stripe; }
const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const NOTIFY_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

const VALID_CURRENCIES = new Set(["usd", "eur", "gbp", "cad", "aud"])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_AMOUNT = 10000 // $10,000 max per subscription

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      paymentMethodId, // From Stripe Elements
      email,
      firstName,
      lastName,
      amount, // Monthly amount in dollars
      currency,
      items, // Array of { title, variantId, quantity, price }
      shippingAddress,
    } = body

    // ── Validation ──
    if (!paymentMethodId || !email || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    if (typeof amount !== "number" || amount <= 0 || amount > MAX_AMOUNT) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const normCurrency = (currency || "usd").toLowerCase()
    if (!VALID_CURRENCIES.has(normCurrency)) {
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 })
    }

    // Use integer math to avoid floating point issues
    const amountInCents = Math.round((amount * 100 + Number.EPSILON) * 1) // e.g. 42.5 → 4250

    // Step 1: Find or create Stripe customer
    const existingCustomers = await getStripe().customers.list({ email, limit: 1 })
    let customer: any

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await getStripe().customers.create({
        email,
        name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
        metadata: { source: "peptidesfarma_subscription" },
      })
    }

    // Step 2: Attach payment method to customer (handle already-attached case)
    try {
      await getStripe().paymentMethods.attach(paymentMethodId, { customer: customer.id })
    } catch (attachErr: any) {
      // If already attached to this customer, continue. Otherwise fail.
      if (!attachErr?.message?.includes("already been attached")) {
        return NextResponse.json(
          { error: attachErr?.message || "Failed to save payment method" },
          { status: 400 }
        )
      }
    }

    await getStripe().customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // Step 3: Charge the first month immediately
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amountInCents,
      currency: normCurrency,
      customer: customer.id,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        type: "subscription_first_payment",
        items: JSON.stringify(items.slice(0, 10).map((i: any) => i.title || "item")),
      },
    })

    // Handle 3D Secure / requires_action
    if (paymentIntent.status === "requires_action" || paymentIntent.status === "requires_payment_method") {
      return NextResponse.json(
        { error: "Payment requires additional authentication. Please try again." },
        { status: 400 }
      )
    }

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: `Payment failed (status: ${paymentIntent.status})` },
        { status: 400 }
      )
    }

    // Step 4: Calculate next billing date (30 days from now)
    const nextBillingDate = new Date()
    nextBillingDate.setDate(nextBillingDate.getDate() + 30)

    // Step 5: Store subscription in Medusa backend (with retry)
    let medusaSaved = false
    if (MEDUSA_URL) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(`${MEDUSA_URL}/store/subscriptions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              stripe_customer_id: customer.id,
              stripe_payment_method_id: paymentMethodId,
              amount_cents: amountInCents,
              currency: normCurrency.toUpperCase(),
              items,
              shipping_address: shippingAddress,
              next_billing_date: nextBillingDate.toISOString(),
              status: "active",
              payment_id: paymentIntent.id,
            }),
          })
          if (res.ok) {
            medusaSaved = true
            break
          }
        } catch {
          // Retry once
        }
      }
      if (!medusaSaved) {
        console.error("CRITICAL: Stripe payment succeeded but Medusa subscription save failed", {
          paymentId: paymentIntent.id,
          email,
          amount: amountInCents,
        })
      }
    }

    // Step 6: Send subscription confirmation email
    try {
      await fetch(`${NOTIFY_ORIGIN}/api/stripe/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-secret": process.env.MEDUSA_WEBHOOK_SECRET || "" },
        body: JSON.stringify({
          type: "subscription_created",
          email,
          data: {
            amountCents: amountInCents,
            items,
            nextBillingDate: nextBillingDate.toISOString(),
          },
        }),
      })
    } catch {
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      success: true,
      subscriptionData: {
        stripeCustomerId: customer.id,
        stripePaymentMethodId: paymentMethodId,
        paymentId: paymentIntent.id,
        amountCents: amountInCents,
        currency: normCurrency.toUpperCase(),
        nextBillingDate: nextBillingDate.toISOString(),
        items,
        medusaSaved,
      },
    })
  } catch (error: any) {
    console.error("Stripe subscribe error:", error)
    return NextResponse.json(
      { error: error?.message || "Subscription creation failed. Please try again." },
      { status: 500 }
    )
  }
}
