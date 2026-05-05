import { NextRequest, NextResponse } from "next/server"
import { buildEmail } from "@/lib/email-template"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = "Peptidesfarma <contact@peptidesfarma.com>"
const SUPPORT_EMAIL = "support@peptidesfarma.com"
const LOGO_URL = ""

type EmailPayload = {
  to: string
  subject: string
  html?: string
  text?: string
  replyTo?: string
}

async function sendEmail({ to, subject, html, text, replyTo }: EmailPayload) {
  const payload: Record<string, unknown> = { from: FROM_EMAIL, to: [to], subject }
  if (html) payload.html = html
  if (text) payload.text = text
  if (replyTo) payload.reply_to = replyTo

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error ${res.status}: ${body}`)
  }
  return res.json()
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, message } = body

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!firstName || !email || !message) {
      return NextResponse.json(
        { error: "First name, email, and message are required" },
        { status: 400 }
      )
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    const fullName = [firstName, lastName].filter(Boolean).join(" ")
    const safeFullName = escapeHtml(fullName)
    const safeEmail = escapeHtml(email)
    const safePhone = phone ? escapeHtml(phone) : ""
    const safeMessage = escapeHtml(message)

    // ── Admin notification (lightweight HTML — logo + bold labels, clean reply thread) ──
    const adminTextLines = [
      `Name: ${fullName}`,
      `Email: ${email}`,
    ]
    if (phone) adminTextLines.push(`Phone: ${phone}`)
    adminTextLines.push("", `Message:`, message)

    const adminHtml = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:Helvetica,Arial,sans-serif;color:#242424;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:20px 24px;text-align:center;border-bottom:1px solid #E5E5E5;">
          <img src="${LOGO_URL}" alt="Peptidesfarma" width="160" height="32" style="display:block;margin:0 auto;" />
        </td>
      </tr>
      <tr>
        <td style="padding:24px;font-size:14px;line-height:1.7;color:#242424;">
          <p style="margin:0 0 8px;"><strong>Name:</strong> ${safeFullName}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#4F8AF7;text-decoration:none;">${safeEmail}</a></p>
          ${safePhone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${safePhone}</p>` : ""}
          <p style="margin:16px 0 8px;"><strong>Message:</strong></p>
          <p style="margin:0;white-space:pre-wrap;">${safeMessage}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`

    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: "Peptidesfarma Support",
      html: adminHtml,
      text: adminTextLines.join("\n"),
      replyTo: email,
    })

    // ── User confirmation ──
    await sendEmail({
      to: email,
      subject: "Thanks for Contacting Peptidesfarma",
      html: buildEmail({
        preview: "Our team will review your message shortly.",
        content: `
    <tr>
      <td style="padding:44px 24px 36px;text-align:center;">
        <p style="margin:0 0 12px;font-size:26px;font-weight:700;color:#242424;line-height:1.3;">Thanks for Contacting Peptidesfarma</p>
        <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.7;">Our team will review your message shortly.</p>
      </td>
    </tr>
    <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #E5E5E5;margin:0;" /></td></tr>
    <tr>
      <td style="padding:28px 24px;">
        <div style="background-color:#F9FAFB;border-radius:8px;padding:20px 24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#9CA3AF;">Your Message</p>
          <p style="margin:0;font-size:14px;color:#242424;line-height:1.7;white-space:pre-wrap;">${safeMessage}</p>
        </div>
      </td>
    </tr>
    <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #E5E5E5;margin:0;" /></td></tr>
    <tr>
      <td style="padding:28px 24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#242424;">Need help faster?</p>
        <p style="margin:0 0 20px;font-size:14px;color:#6B7280;">Use the Peptidesfarma AI Assistant for instant answers.</p>
        <a href="https://www.peptidesfarma.com" style="display:inline-block;background:linear-gradient(90deg,#0B59A2 0%,#1174BF 50%,#0D92CF 100%);color:#ffffff;font-size:15px;font-weight:600;padding:14px 48px;text-align:center;text-decoration:none;border-radius:8px;">Peptidesfarma AI</a>
      </td>
    </tr>
      </td>
    </tr>`,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    )
  }
}
