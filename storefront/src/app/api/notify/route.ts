import { NextRequest, NextResponse } from "next/server"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_PRIVATE_KEY
const FROM_EMAIL = "Peptidesfarma <contact@peptidesfarma.com>"
const ADMIN_EMAIL = "contact@peptidesfarma.com"
const ORDER_ADMIN_EMAIL = "peptidesfarma@gmail.com"
const ORDER_ADMIN_CC = "salmann.dev2@gmail.com"

const KLAVIYO_REVISION = "2024-10-15"
const KLAVIYO_BIS_LIST_ID = "RqmZ2H" // "back in stock" list

// Klaviyo catalog variant IDs use this prefix format
const klaviyoVariantId = (variantId: string) =>
  `$custom:::$default:::${variantId}`

async function subscribeToKlaviyoBackInStock(
  email: string,
  variantId: string,
): Promise<{ ok: boolean; status: number; error?: string }> {
  if (!KLAVIYO_PRIVATE_KEY) {
    return { ok: false, status: 0, error: "KLAVIYO_PRIVATE_KEY not configured" }
  }

  const res = await fetch(
    "https://a.klaviyo.com/api/back-in-stock-subscriptions/",
    {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
        "Content-Type": "application/json",
        accept: "application/json",
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify({
        data: {
          type: "back-in-stock-subscription",
          attributes: {
            channels: ["EMAIL"],
            profile: {
              data: {
                type: "profile",
                attributes: { email },
              },
            },
          },
          relationships: {
            variant: {
              data: {
                type: "catalog-variant",
                id: klaviyoVariantId(variantId),
              },
            },
          },
        },
      }),
    },
  )

  if (res.ok) return { ok: true, status: res.status }

  const text = await res.text().catch(() => "")
  return { ok: false, status: res.status, error: text.slice(0, 500) }
}

// Klaviyo's back-in-stock-subscriptions endpoint creates the variant subscription
// but doesn't set the email channel consent — profiles end up flagged
// "Never subscribed", which can block flow sends. This endpoint sets email
// channel consent to SUBSCRIBED on the back-in-stock list (implicit consent
// established by the user explicitly entering their email + clicking Notify Me).
async function subscribeProfileEmailConsent(email: string): Promise<void> {
  if (!KLAVIYO_PRIVATE_KEY) return
  await fetch(
    "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
    {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
        "Content-Type": "application/json",
        accept: "application/json",
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email,
                    subscriptions: {
                      email: { marketing: { consent: "SUBSCRIBED" } },
                    },
                  },
                },
              ],
            },
          },
          relationships: {
            list: { data: { type: "list", id: KLAVIYO_BIS_LIST_ID } },
          },
        },
      }),
    },
  ).catch(() => {})
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // ── Order creation failed alert ──
    if (body.type === "order_creation_failed") {
      if (!RESEND_API_KEY) return NextResponse.json({ success: true })

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Peptidesfarma <orders@peptidesfarma.com>",
          to: [ORDER_ADMIN_EMAIL],
          cc: [ORDER_ADMIN_CC],
          subject: `URGENT: Order creation failed — ${body.name || body.email} ($${body.total})`,
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px;margin-bottom:20px">
                <h2 style="color:#991B1B;margin:0 0 8px;font-size:18px">Order Creation Failed</h2>
                <p style="color:#B91C1C;margin:0;font-size:14px">A customer was shown Venmo payment instructions but the order failed to create in Medusa after 3 attempts. They may have already paid. Please create this order manually.</p>
              </div>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#999;width:120px">Customer</td><td style="padding:8px 0;color:#333;font-weight:600">${body.name || "Unknown"}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Email</td><td style="padding:8px 0;color:#333">${body.email || "Unknown"}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Total</td><td style="padding:8px 0;color:#333;font-weight:600">$${body.total || "?"}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Items</td><td style="padding:8px 0;color:#333">${body.items || "Unknown"}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Address</td><td style="padding:8px 0;color:#333">${body.address || "Unknown"}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Cart ID</td><td style="padding:8px 0;color:#333;font-family:monospace;font-size:12px">${body.cartId || "Unknown"}</td></tr>
              </table>
            </div>
          `,
        }),
      })

      return NextResponse.json({ success: true })
    }

    // ── Back-in-stock notification ──
    const { email, productName, variantTitle, variantId } = body

    if (!email || !variantId) {
      return NextResponse.json(
        { error: "email and variantId are required" },
        { status: 400 },
      )
    }

    const variant = variantTitle ? ` (${variantTitle})` : ""

    // 1. Subscribe in Klaviyo (creates "Subscribed to Back in Stock" event → confirmation flow)
    const klaviyoResult = await subscribeToKlaviyoBackInStock(email, variantId)
    if (!klaviyoResult.ok) {
      console.error(
        `Klaviyo back-in-stock subscribe failed (${klaviyoResult.status}): ${klaviyoResult.error}`,
      )
    }

    // Fire-and-forget: ensure the profile's email channel is opted in so flow
    // sends aren't blocked by a "Never subscribed" status.
    void subscribeProfileEmailConsent(email)

    // 2. Track in Medusa Redis (waitlist — used when stock returns to fire the notification)
    try {
      const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      await fetch(`${medusaUrl}/store/back-in-stock-track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
        },
        body: JSON.stringify({ email, variant_id: variantId }),
      })
    } catch (err) {
      console.error("Failed to track back-in-stock in Medusa:", err)
    }

    // 2. Notify admin so Jake sees the demand signal in his inbox
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject: `Back-in-stock request: ${productName}${variant}`,
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#141414;margin:0 0 16px">Back-in-Stock Notification Request</h2>
              <p style="color:#555;font-size:14px;margin:0 0 16px">A customer signed up for restock notifications. Klaviyo is tracking them and will email automatically when inventory returns.</p>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#999;width:120px">Product</td><td style="padding:8px 0;color:#333">${productName}${variant}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Email</td><td style="padding:8px 0;color:#333">${email}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Variant ID</td><td style="padding:8px 0;color:#333;font-family:monospace;font-size:12px">${variantId}</td></tr>
                <tr><td style="padding:8px 0;color:#999">Klaviyo</td><td style="padding:8px 0;color:#333">${klaviyoResult.ok ? "✓ subscribed" : `✗ failed (${klaviyoResult.status})`}</td></tr>
              </table>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, klaviyo: klaviyoResult.ok })
  } catch (error) {
    console.error("Notify error:", error)
    return NextResponse.json({ success: true })
  }
}
