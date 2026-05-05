import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { verifySubscriptionOwnership } from "../../_helpers"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  try {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    const ownershipError = await verifySubscriptionOwnership(req, pgConnection, id)
    if (ownershipError) return res.status(403).json({ error: ownershipError })

    const nextBilling = new Date()
    nextBilling.setDate(nextBilling.getDate() + 30)
    await pgConnection.raw(
      `UPDATE subscriptions SET status = 'active', next_billing_date = ?, updated_at = NOW() WHERE id = ? AND status = 'paused'`,
      [nextBilling.toISOString(), id]
    )
    return res.json({ success: true, status: "active" })
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to resume subscription" })
  }
}
