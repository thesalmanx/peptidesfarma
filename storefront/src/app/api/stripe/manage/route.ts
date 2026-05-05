import { NextRequest, NextResponse } from "next/server"

/**
 * Manage subscription actions: pause, resume, cancel.
 * Updates Medusa backend and sends notification emails.
 */

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const NOTIFY_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"
const VALID_ACTIONS = ["pause", "resume", "cancel"] as const

export async function POST(request: NextRequest) {
  if (!MEDUSA_URL) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 })
  }

  try {
    const { subscriptionId, action, email, amountCents } = await request.json()

    if (!subscriptionId || !action) {
      return NextResponse.json({ error: "Missing subscriptionId or action" }, { status: 400 })
    }

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Sanitize subscription ID — only allow alphanumeric, hyphens, underscores
    const safeId = String(subscriptionId).replace(/[^a-zA-Z0-9_-]/g, "")
    if (!safeId) {
      return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 })
    }

    // Update subscription status in Medusa
    const res = await fetch(`${MEDUSA_URL}/store/subscriptions/${safeId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err || `Failed to ${action} subscription` }, { status: 500 })
    }

    // Send notification email
    const typeMap: Record<string, string> = {
      pause: "subscription_paused",
      cancel: "subscription_canceled",
    }

    if (email && typeMap[action]) {
      try {
        await fetch(`${NOTIFY_ORIGIN}/api/stripe/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-internal-secret": process.env.MEDUSA_WEBHOOK_SECRET || "" },
          body: JSON.stringify({
            type: typeMap[action],
            email,
            data: { amountCents: amountCents || 0 },
          }),
        })
      } catch {}
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Subscription manage error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
