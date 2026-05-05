import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { trackSubscriber } from "../../../utils/back-in-stock-store"
import { subscribeToBackInStock } from "../../../utils/klaviyo-events"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = (req.body || {}) as {
    email?: string
    variant_id?: string
    first_name?: string
    last_name?: string
  }
  const { email, variant_id, first_name, last_name } = body

  if (!email || !variant_id) {
    res.status(400).json({ error: "email and variant_id are required" })
    return
  }

  const logger = req.scope.resolve("logger")

  try {
    // Local Redis waitlist (drives our own back-in-stock event firing
    // when stock returns; see klaviyo-inventory-sync.ts).
    await trackSubscriber(email, variant_id)

    // Klaviyo native back-in-stock subscription — triggers flow XfjPvZ
    // ("Back in Stock — Peptidesfarma") via the Klaviyo-native "Subscribed to
    // Back in Stock" metric. Fire-and-forget; never block the response.
    subscribeToBackInStock(logger, {
      profile: {
        email,
        first_name: first_name || undefined,
        last_name: last_name || undefined,
      },
      variantId: variant_id,
    }).catch((err) => logger.warn(`[Klaviyo BIS subscribe] ${err.message}`))

    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to track subscription" })
  }
}
