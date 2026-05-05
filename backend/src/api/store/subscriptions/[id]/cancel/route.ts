import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { verifySubscriptionOwnership } from "../../_helpers"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  try {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    // Verify the authenticated customer owns this subscription
    const ownershipError = await verifySubscriptionOwnership(req, pgConnection, id)
    if (ownershipError) return res.status(403).json({ error: ownershipError })

    await pgConnection.raw(
      `UPDATE subscriptions SET status = 'canceled', updated_at = NOW() WHERE id = ? AND status IN ('active', 'paused')`,
      [id]
    )
    return res.json({ success: true, status: "canceled" })
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to cancel subscription" })
  }
}
