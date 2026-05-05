import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

interface PasswordResetData {
  entity_id: string
  actor_type: string
  token: string
  metadata?: Record<string, unknown>
}

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetData>) {
  if (data.actor_type !== "customer") return

  const notificationService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION)

  const storefrontUrl =
    process.env.STOREFRONT_URL || "https://www.peptidesfarma.com"
  const resetUrl = `${storefrontUrl}/auth/reset-password?token=${data.token}&email=${encodeURIComponent(data.entity_id)}`

  const fromEmail = `Peptidesfarma <${process.env.RESEND_FROM_EMAIL || "contact@peptidesfarma.com"}>`

  await notificationService.createNotifications({
    to: data.entity_id,
    from: fromEmail,
    channel: "email",
    template: "password-reset",
    content: {
      subject: "Reset Your Password - Peptidesfarma",
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
          <h1 style="color:#141414;font-size:24px;margin:0 0 8px">Reset Your Password</h1>
          <p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 24px">
            We received a request to reset the password for your Peptidesfarma account. Click the button below to set a new password.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:linear-gradient(90deg,#115C6F,#36848E);color:#fff;text-decoration:none;padding:12px 32px;border-radius:110px;font-weight:700;font-size:16px">
            Reset Password
          </a>
          <p style="color:#999;font-size:14px;line-height:1.6;margin:24px 0 0">
            If you didn't request this, you can safely ignore this email. This link will expire in 15 minutes.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px" />
          <p style="color:#999;font-size:12px;margin:0">Peptidesfarma</p>
        </div>
      `,
    },
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
