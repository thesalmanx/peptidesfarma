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

async function squareGet(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: HEADERS })
  const data = await res.json()
  return { ok: res.ok, data }
}

export async function POST(request: NextRequest) {
  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return NextResponse.json({ error: "Square not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const {
      sourceId,       // Card token from Web Payments SDK
      email,
      firstName,
      lastName,
      amount,         // Monthly amount in dollars (e.g. 42.5 for $42.50)
      currency,
      items,          // Array of { title, variantId, quantity, price }
      shippingAddress,
    } = body

    if (!sourceId || !email || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const amountInCents = Math.round(amount * 100)

    // Step 1: Find or create Square customer
    let customerId: string
    const searchRes = await squarePost("/v2/customers/search", {
      query: { filter: { email_address: { exact: email } } },
    })

    if (searchRes.ok && searchRes.data.customers?.length > 0) {
      customerId = searchRes.data.customers[0].id
    } else {
      const createRes = await squarePost("/v2/customers", {
        idempotency_key: crypto.randomUUID(),
        given_name: firstName || "",
        family_name: lastName || "",
        email_address: email,
      })
      if (!createRes.ok) {
        return NextResponse.json(
          { error: createRes.data.errors?.[0]?.detail || "Failed to create customer" },
          { status: 400 }
        )
      }
      customerId = createRes.data.customer.id
    }

    // Step 2: Store card on file
    const cardRes = await squarePost("/v2/cards", {
      idempotency_key: crypto.randomUUID(),
      source_id: sourceId,
      card: {
        customer_id: customerId,
      },
    })

    if (!cardRes.ok) {
      return NextResponse.json(
        { error: cardRes.data.errors?.[0]?.detail || "Failed to store card" },
        { status: 400 }
      )
    }
    const cardId = cardRes.data.card.id

    // Step 3: Charge the first month immediately
    const paymentRes = await squarePost("/v2/payments", {
      source_id: cardId,
      idempotency_key: crypto.randomUUID(),
      amount_money: { amount: amountInCents, currency: (currency || "USD").toUpperCase() },
      location_id: SQUARE_LOCATION_ID,
      customer_id: customerId,
      autocomplete: true,
      note: `Subscription first month - ${items?.map((i: any) => i.title).join(", ")}`,
    })

    if (!paymentRes.ok) {
      return NextResponse.json(
        { error: paymentRes.data.errors?.[0]?.detail || "First payment failed" },
        { status: 400 }
      )
    }

    // Step 4: Calculate next billing date (30 days from now)
    const nextBillingDate = new Date()
    nextBillingDate.setDate(nextBillingDate.getDate() + 30)

    // Step 5: Send subscription confirmation email
    try {
      const origin = request.headers.get("origin") || "https://www.peptidesfarma.com"
      await fetch(`${origin}/api/square/notify`, {
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
        squareCustomerId: customerId,
        squareCardId: cardId,
        paymentId: paymentRes.data.payment.id,
        amountCents: amountInCents,
        currency: (currency || "USD").toUpperCase(),
        nextBillingDate: nextBillingDate.toISOString(),
        items,
      },
    })
  } catch (error: any) {
    console.error("Subscribe error:", error)
    return NextResponse.json(
      { error: "Subscription creation failed. Please try again." },
      { status: 500 }
    )
  }
}
