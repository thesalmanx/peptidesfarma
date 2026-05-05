import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Fail endpoint is called by the cron job (server-to-server), not directly by customers.
// Protected by webhook secret header.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const secret = req.headers["x-webhook-secret"] || req.headers["authorization"]
  const expectedSecret = process.env.MEDUSA_WEBHOOK_SECRET
  if (!expectedSecret || (secret !== expectedSecret && secret !== `Bearer ${expectedSecret}`)) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const id = req.params.id
  try {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    await pgConnection.raw(
      `UPDATE subscriptions SET
        failure_count = failure_count + 1,
        status = CASE WHEN failure_count >= 2 THEN 'payment_failed' ELSE status END,
        updated_at = NOW()
       WHERE id = ? AND status = 'active'`,
      [id]
    )
    return res.json({ success: true })
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to record failure" })
  }
}
