import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { debugLog } from "../../../utils/debug-log"

/**
 * POST /hooks/payment-log
 * Receives log entries from vulaskin frontend for tracking payment flow.
 * No auth required — logs are informational only.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type")

  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const { event, orderId, message, data, level } = req.body as any

  if (!event || !message) {
    return res.status(400).json({ error: "event and message required" })
  }

  await debugLog(pg, event, orderId || null, message, data || {}, { level: level || "info" })
  return res.json({ ok: true })
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  return res.status(204).send("")
}
