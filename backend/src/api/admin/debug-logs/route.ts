import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/debug-logs?event=payment_captured&order_id=order_123&limit=50&level=error
 * Returns recent debug logs. All query params are optional filters.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const event = req.query.event as string | undefined
  const orderId = req.query.order_id as string | undefined
  const level = req.query.level as string | undefined
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200)

  const conditions: string[] = []
  const params: any[] = []

  if (event) {
    conditions.push(`event = ?`)
    params.push(event)
  }
  if (orderId) {
    conditions.push(`order_id = ?`)
    params.push(orderId)
  }
  if (level) {
    conditions.push(`level = ?`)
    params.push(level)
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
  params.push(limit)

  try {
    const result = await pgConnection.raw(
      `SELECT * FROM debug_log ${where} ORDER BY created_at DESC LIMIT ?`,
      params
    )
    return res.json({ logs: result?.rows || [] })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
