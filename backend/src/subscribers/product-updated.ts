import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export default async function productUpdatedHandler({
  event: { name, data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  const storefrontUrl =
    process.env.STOREFRONT_URL || "https://www.peptidesfarma.com"
  const webhookSecret = process.env.MEDUSA_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.warn("Storefront revalidation: MEDUSA_WEBHOOK_SECRET not set")
    return
  }

  try {
    let handle: string | undefined
    try {
      const query = container.resolve("query")
      const {
        data: [product],
      } = await query.graph({
        entity: "product",
        fields: ["handle"],
        filters: { id: data.id },
      })
      handle = product?.handle
    } catch {}

    const res = await fetch(`${storefrontUrl}/api/revalidate/medusa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": webhookSecret,
      },
      body: JSON.stringify({
        event: name,
        data: { id: data.id, handle },
      }),
    })

    if (res.ok) {
      logger.info(
        `Storefront revalidation: ${name} → ${handle || data.id} (ok)`
      )
    } else {
      const text = await res.text()
      logger.warn(
        `Storefront revalidation: ${name} → ${res.status} ${text.slice(0, 200)}`
      )
    }
  } catch (error: any) {
    logger.warn(`Storefront revalidation failed: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product.deleted"],
}
