import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET: Fetch subscriptions due for renewal (next_billing_date <= now)
// Internal endpoint — called by the cron job, protected by webhook secret
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // Verify this is an internal/cron call
  const secret = req.headers["x-webhook-secret"] || req.headers["authorization"]
  const expectedSecret = process.env.MEDUSA_WEBHOOK_SECRET
  if (!expectedSecret || (secret !== expectedSecret && secret !== `Bearer ${expectedSecret}`)) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    const result = await pgConnection.raw(
      `SELECT * FROM subscriptions
       WHERE status = 'active'
       AND next_billing_date <= NOW()
       AND failure_count < 3
       ORDER BY next_billing_date ASC
       LIMIT 100`
    )

    return res.json({ subscriptions: result?.rows || [] })
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch due subscriptions" })
  }
}
