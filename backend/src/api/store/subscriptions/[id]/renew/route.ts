import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Renew endpoint is called by the cron job (server-to-server), not directly by customers.
// Protected by webhook secret header.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const secret = req.headers["x-webhook-secret"] || req.headers["authorization"]
  const expectedSecret = process.env.MEDUSA_WEBHOOK_SECRET
  if (!expectedSecret || (secret !== expectedSecret && secret !== `Bearer ${expectedSecret}`)) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const id = req.params.id
  const { paymentId } = req.body as any
  try {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const nextBilling = new Date()
    nextBilling.setDate(nextBilling.getDate() + 30)
    await pgConnection.raw(
      `UPDATE subscriptions SET
        square_payment_id = ?,
        next_billing_date = ?,
        last_payment_date = NOW(),
        failure_count = 0,
        updated_at = NOW()
       WHERE id = ? AND status = 'active'`,
      [paymentId, nextBilling.toISOString(), id]
    )
    return res.json({ success: true })
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update renewal" })
  }
}
