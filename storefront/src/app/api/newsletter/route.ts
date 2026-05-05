import { NextRequest, NextResponse } from "next/server"
import { buildEmail } from "@/lib/email-template"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = "Peptidesfarma <contact@peptidesfarma.com>"
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"
const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

function buildNewsletterWelcome(): string {
  return buildEmail({
    preview: "Welcome to the Peptidesfarma newsletter! You're now part of our research community.",
    content: `
    <tr>
      <td style="padding:44px 40px 36px;text-align:center;">
        <p style="margin:0 0 12px;font-size:26px;font-weight:700;color:#242424;line-height:1.3;">Welcome to Peptidesfarma!</p>
        <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.7;">Thank you for subscribing to the Peptidesfarma newsletter. You're now part of our research community.</p>
      </td>
    </tr>
    <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #E5E5E5;margin:0;" /></td></tr>

    <!-- What You'll Get -->
    <tr>
      <td style="padding:28px 40px;">
        <p style="margin:0 0 20px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#4F8AF7;">What You'll Get</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:10px 0;font-size:14px;font-weight:500;color:#242424;line-height:1.6;border-bottom:1px solid #F0F0F0;">
              Early access to new compounds &amp; research
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;font-size:14px;font-weight:500;color:#242424;line-height:1.6;border-bottom:1px solid #F0F0F0;">
              Research insights &amp; industry updates
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;font-size:14px;font-weight:500;color:#242424;line-height:1.6;">
              Exclusive subscriber-only offers
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #E5E5E5;margin:0;" /></td></tr>

    <!-- CTA -->
    <tr>
      <td style="padding:32px 40px;text-align:center;">
        <a href="${SITE_URL}/products" style="display:inline-block;background:linear-gradient(90deg,#0B59A2 0%,#1174BF 50%,#0D92CF 100%);color:#ffffff;font-size:15px;font-weight:600;padding:14px 48px;text-align:center;text-decoration:none;border-radius:8px;">
          Browse Products
        </a>
      </td>
    </tr>`,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      )
    }

    // 1. Save to database via Medusa backend
    if (MEDUSA_URL) {
      try {
        await fetch(`${MEDUSA_URL}/store/newsletter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
      } catch (dbErr) {
        console.error("Failed to save subscriber to database:", dbErr)
      }
    }

    // 2. Send branded confirmation email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: "Welcome to the Peptidesfarma Newsletter!",
        html: buildNewsletterWelcome(),
      }),
    })

    if (!res.ok) {
      const errorBody = await res.text()
      throw new Error(`Resend error ${res.status}: ${errorBody}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Newsletter error:", error)
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    )
  }
}
