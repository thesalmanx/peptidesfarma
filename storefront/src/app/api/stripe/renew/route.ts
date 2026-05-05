import { NextRequest, NextResponse } from "next/server"


/**
 * Cron job to renew Stripe subscriptions.
 * Called daily by Vercel Cron. Charges all active subscriptions whose
 * next_billing_date is today or past.
 */

let _stripe: any = null
function getStripe() { if (!_stripe) { const S = require("stripe").default || require("stripe"); _stripe = new S(process.env.STRIPE_SECRET_KEY || ""); } return _stripe; }
const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const CRON_SECRET = process.env.CRON_SECRET
const NOTIFY_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

export async function GET(request: NextRequest) {
  // REQUIRED: Verify cron secret — reject if missing or wrong
  const authHeader = request.headers.get("authorization")
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!MEDUSA_URL) {
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
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

    for (const sub of subscriptions || []) {
      try {
        // Idempotency: skip if already charged today
        if (sub.last_charged_date && sub.last_charged_date.slice(0, 10) === today) {
          results.push({ id: sub.id, status: "skipped", reason: "already_charged_today" })
          continue
        }

        // Sanitize subscription ID
        const subId = String(sub.id).replace(/[^a-zA-Z0-9_-]/g, "")

        // Idempotency key prevents double-charging on retry
        const idempotencyKey = `renewal_${subId}_${today}`

        // Charge using Stripe payment method on file
        const paymentIntent = await getStripe().paymentIntents.create(
          {
            amount: sub.amount_cents,
            currency: (sub.currency || "usd").toLowerCase(),
            customer: sub.stripe_customer_id,
            payment_method: sub.stripe_payment_method_id,
            off_session: true,
            confirm: true,
            metadata: {
              type: "subscription_renewal",
              subscription_id: subId,
            },
          },
          { idempotencyKey }
        )

        if (paymentIntent.status === "succeeded") {
          // Update subscription: set next billing date +30 days
          await fetch(`${MEDUSA_URL}/store/subscriptions/${subId}/renew`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: paymentIntent.id }),
          })

          // Send renewal success email
          try {
            await fetch(`${NOTIFY_ORIGIN}/api/stripe/notify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-internal-secret": process.env.MEDUSA_WEBHOOK_SECRET || "" },
              body: JSON.stringify({
                type: "subscription_renewed",
                email: sub.email,
                data: { amountCents: sub.amount_cents },
              }),
            })
          } catch {}

          results.push({ id: sub.id, status: "renewed", paymentId: paymentIntent.id })
        } else {
          throw new Error(`Payment status: ${paymentIntent.status}`)
        }
      } catch (err: any) {
        const errorDetail = err?.message || "Payment failed"

        // Mark as failed in Medusa
        const subId = String(sub.id).replace(/[^a-zA-Z0-9_-]/g, "")
        try {
          await fetch(`${MEDUSA_URL}/store/subscriptions/${subId}/fail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: errorDetail }),
          })
        } catch {}

        // Send payment failed email
        try {
          await fetch(`${NOTIFY_ORIGIN}/api/stripe/notify`, {
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
    }

    return NextResponse.json({
      processed: results.length,
      results,
    })
  } catch (error: any) {
    console.error("Stripe renewal cron error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
