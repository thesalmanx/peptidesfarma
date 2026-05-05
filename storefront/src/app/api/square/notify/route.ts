import { NextRequest, NextResponse } from "next/server"
import { buildEmail } from "@/lib/email-template"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = "Peptidesfarma <orders@peptidesfarma.com>"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  subscription_created: (data) => ({
    subject: "Your Peptidesfarma Subscription is Active!",
    html: buildEmail({
      preview: "Your monthly subscription is now active.",
      content: `
    <tr>
      <td style="padding:44px 24px 36px;text-align:center;">
        <p style="margin:0 0 12px;font-size:26px;font-weight:700;color:#242424;line-height:1.3;">Your Subscription is Active!</p>
        <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.7;">Thank you for subscribing. You'll be charged $${(data.amountCents / 100).toFixed(2)} monthly and receive your products automatically.</p>
      </td>
    </tr>
    <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #E5E5E5;margin:0;" /></td></tr>
    <tr>
      <td style="padding:28px 24px;">
        <div style="background-color:#F9FAFB;border-radius:8px;padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#9CA3AF;">Subscription Details</p>
          <p style="margin:0;font-size:14px;color:#242424;line-height:1.8;">
            Items: ${data.items?.map((i: any) => i.title).join(", ") || "Monthly subscription"}
            <br />Monthly Cost: $${(data.amountCents / 100).toFixed(2)}
            <br />Next Billing: ${new Date(data.nextBillingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 32px;text-align:center;">
        <a href="${SITE_URL}/account" style="display:inline-block;background:linear-gradient(90deg,#0B59A2 0%,#1174BF 50%,#0D92CF 100%);color:#ffffff;font-size:15px;font-weight:600;padding:14px 48px;text-align:center;text-decoration:none;border-radius:8px;">Manage Subscription</a>
      </td>
    </tr>`,
    }),
  }),

  subscription_renewed: (data) => ({
    subject: "Your Peptidesfarma Subscription Has Been Renewed",
    html: buildEmail({
      preview: `Your subscription has been renewed. $${(data.amountCents / 100).toFixed(2)} charged.`,
      content: `
    <tr>
      <td style="padding:44px 24px 36px;text-align:center;">
        <p style="margin:0 0 12px;font-size:26px;font-weight:700;color:#242424;line-height:1.3;">Subscription Renewed</p>
        <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.7;">Your monthly subscription has been renewed. $${(data.amountCents / 100).toFixed(2)} has been charged to your card on file.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 32px;text-align:center;">
        <a href="${SITE_URL}/account" style="display:inline-block;background:linear-gradient(90deg,#0B59A2 0%,#1174BF 50%,#0D92CF 100%);color:#ffffff;font-size:15px;font-weight:600;padding:14px 48px;text-align:center;text-decoration:none;border-radius:8px;">View Account</a>
      </td>
    </tr>`,
    }),
  }),

  subscription_failed: (data) => ({
    subject: "Payment Failed for Your Peptidesfarma Subscription",
    html: buildEmail({
      preview: "We couldn't process your subscription payment.",
      content: `
    <tr>
      <td style="padding:44px 24px 36px;text-align:center;">
        <p style="margin:0 0 12px;font-size:26px;font-weight:700;color:#242424;line-height:1.3;">Payment Failed</p>
        <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.7;">We couldn't process your subscription payment of $${(data.amountCents / 100).toFixed(2)}. Please update your payment method to keep your subscription active.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 32px;text-align:center;">
        <a href="${SITE_URL}/account" style="display:inline-block;background:#EF4444;color:#ffffff;font-size:15px;font-weight:600;padding:14px 48px;text-align:center;text-decoration:none;border-radius:8px;">Update Payment</a>
      </td>
    </tr>`,
    }),
  }),

  subscription_paused: (data) => ({
    subject: "Your Peptidesfarma Subscription is Paused",
    html: buildEmail({
      preview: "Your subscription has been paused.",
      content: `
    <tr>
      <td style="padding:44px 24px 36px;text-align:center;">
        <p style="margin:0 0 12px;font-size:26px;font-weight:700;color:#242424;line-height:1.3;">Subscription Paused</p>
        <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.7;">Your subscription has been paused. You won't be charged until you resume. You can resume anytime from your account.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 32px;text-align:center;">
        <a href="${SITE_URL}/account" style="display:inline-block;background:linear-gradient(90deg,#0B59A2 0%,#1174BF 50%,#0D92CF 100%);color:#ffffff;font-size:15px;font-weight:600;padding:14px 48px;text-align:center;text-decoration:none;border-radius:8px;">Resume Subscription</a>
      </td>
    </tr>`,
    }),
  }),

  subscription_canceled: (data) => ({
    subject: "Your Peptidesfarma Subscription Has Been Canceled",
    html: buildEmail({
      preview: "Your subscription has been canceled.",
      content: `
    <tr>
      <td style="padding:44px 24px 36px;text-align:center;">
        <p style="margin:0 0 12px;font-size:26px;font-weight:700;color:#242424;line-height:1.3;">Subscription Canceled</p>
        <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.7;">Your subscription has been canceled. We're sorry to see you go. You can re-subscribe anytime from our product pages.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 32px;text-align:center;">
        <a href="${SITE_URL}/products" style="display:inline-block;background:linear-gradient(90deg,#0B59A2 0%,#1174BF 50%,#0D92CF 100%);color:#ffffff;font-size:15px;font-weight:600;padding:14px 48px;text-align:center;text-decoration:none;border-radius:8px;">Browse Products</a>
      </td>
    </tr>`,
    }),
  }),
}

export async function POST(request: NextRequest) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 })
  }

  // Verify internal caller via shared secret
  const secret = request.headers.get("x-internal-secret")
  const expectedSecret = process.env.MEDUSA_WEBHOOK_SECRET
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, email, data } = body

    if (!type || !email || !templates[type]) {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    const { subject, html } = templates[type](data || {})

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject, html }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Subscription email failed:", err)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Subscription notify error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
