import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

/**
 * Cron job to renew subscriptions.
 * Called daily by Vercel Cron. Charges all active subscriptions whose
 * next_billing_date is today or past.
 */

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID
const SQUARE_ENVIRONMENT = process.env.SQUARE_ENVIRONMENT || "sandbox"
const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const CRON_SECRET = process.env.CRON_SECRET

const BASE_URL =
  SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization")
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID || !MEDUSA_URL) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 })
  }

  try {
    // Fetch active subscriptions that need renewal from Medusa backend
    const subsRes = await fetch(`${MEDUSA_URL}/store/subscriptions/due`, {
      headers: { "Content-Type": "application/json" },
    })

    if (!subsRes.ok) {
      return NextResponse.json({ error: "Failed to fetch due subscriptions" }, { status: 500 })
    }

    const { subscriptions } = await subsRes.json()
    const results: any[] = []

    for (const sub of subscriptions || []) {
      try {
        // Charge the stored card
        const payRes = await fetch(`${BASE_URL}/v2/payments`, {
          method: "POST",
          headers: {
            "Square-Version": "2024-11-20",
            Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_id: sub.square_card_id,
            idempotency_key: crypto.randomUUID(),
            amount_money: {
              amount: sub.amount_cents,
              currency: sub.currency || "USD",
            },
            location_id: SQUARE_LOCATION_ID,
            customer_id: sub.square_customer_id,
            autocomplete: true,
            note: `Subscription renewal - ${sub.product_title || "Monthly subscription"}`,
          }),
        })

        const payData = await payRes.json()

        if (payRes.ok && payData.payment) {
          // Update subscription: set next billing date +30 days
          await fetch(`${MEDUSA_URL}/store/subscriptions/${sub.id}/renew`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: payData.payment.id }),
          })

          // Send renewal success email
          try {
            const origin = request.headers.get("origin") || "https://www.peptidesfarma.com"
            await fetch(`${origin}/api/square/notify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-internal-secret": process.env.MEDUSA_WEBHOOK_SECRET || "" },
              body: JSON.stringify({
                type: "subscription_renewed",
                email: sub.email,
                data: { amountCents: sub.amount_cents },
              }),
            })
          } catch {}

          results.push({ id: sub.id, status: "renewed", paymentId: payData.payment.id })
        } else {
          const errorDetail = payData.errors?.[0]?.detail || "Payment failed"
          await fetch(`${MEDUSA_URL}/store/subscriptions/${sub.id}/fail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: errorDetail }),
          })

          // Send payment failed email
          try {
            const origin = request.headers.get("origin") || "https://www.peptidesfarma.com"
            await fetch(`${origin}/api/square/notify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-internal-secret": process.env.MEDUSA_WEBHOOK_SECRET || "" },
              body: JSON.stringify({
                type: "subscription_failed",
                email: sub.email,
                data: { amountCents: sub.amount_cents },
              }),
            })
          } catch {}

          results.push({ id: sub.id, status: "failed", error: errorDetail })
        }
      } catch (err: any) {
        results.push({ id: sub.id, status: "error", error: err.message })
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    })
  } catch (error: any) {
    console.error("Renewal cron error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
