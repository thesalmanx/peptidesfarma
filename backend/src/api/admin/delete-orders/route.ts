import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * POST /admin/delete-orders
 * Body: { order_ids: ["order_123", "order_456"] }
 * Hard-deletes orders and all related data from the database.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const { order_ids } = req.body as { order_ids: string[] }

  if (!order_ids?.length) {
    return res.status(400).json({ error: "order_ids required" })
  }

  try {
    // Delete in dependency order
    const tables = [
      "order_shipping",
      "order_line_item",
      "order_payment_collection",
      "order_change",
      "order_summary",
      "order_fulfillment",
    ]

    for (const table of tables) {
      await pg.raw(`DELETE FROM "${table}" WHERE order_id = ANY(?)`, [order_ids]).catch(() => {})
    }

    // Delete the orders themselves
    const result = await pg.raw(`DELETE FROM "order" WHERE id = ANY(?)`, [order_ids])
    const deleted = result?.rowCount || 0

    return res.json({ success: true, deleted })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
