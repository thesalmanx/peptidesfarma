import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { render } from "@react-email/render"
import { BaseLayout } from "../email-templates/components/base-layout"
import { fireSubscribedToEmailMarketing } from "../utils/klaviyo-events"
import {
  Column,
  Hr,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

function WelcomeEmail({ name, storefrontUrl }: { name: string; storefrontUrl: string }) {
  return (
    <BaseLayout
      preview={`Welcome to Peptidesfarma, ${name}!`}
      storefrontUrl={storefrontUrl}
    >
      <Section style={{ padding: "44px 40px 36px", textAlign: "center" as const }}>
        <Text style={{ color: "#242424", fontSize: "26px", fontWeight: 700, margin: "0 0 12px", lineHeight: "1.3" }}>
          Welcome to Peptidesfarma, {name}!
        </Text>
        <Text style={{ color: "#6B7280", fontSize: "15px", margin: 0, lineHeight: "1.7" }}>
          Thank you for creating an account with us. You're all set to explore premium research peptides and compounds.
        </Text>
      </Section>

      <Hr style={{ borderColor: "#E5E5E5", margin: "0 40px" }} />

      <Section style={{ padding: "28px 40px" }}>
        <Text style={{ color: "#115C6F", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const, margin: "0 0 20px" }}>
          Your Account Benefits
        </Text>

        <Row style={{ marginBottom: "12px" }}>
          <Column>
            <Text style={{ color: "#242424", fontSize: "14px", fontWeight: 500, margin: 0, lineHeight: "1.6", borderBottom: "1px solid #F0F0F0", paddingBottom: "12px" }}>
              Track your orders in real time
            </Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: "12px" }}>
          <Column>
            <Text style={{ color: "#242424", fontSize: "14px", fontWeight: 500, margin: 0, lineHeight: "1.6", borderBottom: "1px solid #F0F0F0", paddingBottom: "12px" }}>
              Save your shipping details for faster checkout
            </Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={{ color: "#242424", fontSize: "14px", fontWeight: 500, margin: 0, lineHeight: "1.6" }}>
              Access your order history and invoices
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr style={{ borderColor: "#E5E5E5", margin: "0 40px" }} />

      <Section style={{ padding: "32px 40px", textAlign: "center" as const }}>
        <Link
          href={`${storefrontUrl}/products`}
          style={{
            background: "linear-gradient(90deg, #0B59A2 0%, #1174BF 50%, #0D92CF 100%)",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 600,
            padding: "14px 48px",
            display: "inline-block",
            textAlign: "center" as const,
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Start Shopping
        </Link>
      </Section>
    </BaseLayout>
  )
}

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION)

  const query = container.resolve("query")
  const logger = container.resolve("logger")

  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name", "metadata"],
    filters: { id: data.id },
  })

  if (!customer?.email) return

  // Fire Klaviyo Welcome flow trigger.
  // Subscribes the profile to email marketing AND fires the metric event.
  // Gated on customer.metadata.klaviyo.email === true (set client-side at signup).
  // If you want every signup auto-subscribed, remove the consent check.
  const klaviyoMeta = (() => {
    const m = (customer as any).metadata?.klaviyo
    if (!m) return null
    if (typeof m === "string") {
      try { return JSON.parse(m) } catch { return null }
    }
    return m
  })()
  const hasMarketingConsent = klaviyoMeta?.email === true
  if (hasMarketingConsent) {
    fireSubscribedToEmailMarketing(logger, {
      profile: {
        email: customer.email,
        first_name: customer.first_name || undefined,
        last_name: customer.last_name || undefined,
      },
      source: "Medusa customer.created",
    }).catch((err) => logger.warn(`[Klaviyo] Subscribed to Email Marketing fire failed: ${err.message}`))
  }

  const name = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ") || "there"

  const storefrontUrl = process.env.STOREFRONT_URL || "https://www.peptidesfarma.com"

  try {
    const html = await render(
      WelcomeEmail({ name, storefrontUrl })
    )

    await notificationService.createNotifications({
      to: customer.email,
      channel: "email",
      template: "welcome",
      content: {
        subject: "Welcome to Peptidesfarma!",
        html,
      },
      receiver_id: customer.id,
      resource_id: customer.id,
      resource_type: "customer",
    })

    logger.info(`Welcome email sent to ${customer.email}`)
  } catch (error: any) {
    logger.error(`Failed to send welcome email to ${customer.email} — ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
