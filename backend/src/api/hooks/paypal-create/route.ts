import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getPayPalAccessToken, PAYPAL_API } from "../../../utils/paypal"
import { debugLog } from "../../../utils/debug-log"

/**
 * POST /hooks/paypal-create
 * Creates a PayPal order for Google Pay / Apple Pay flows.
 * Called from summerteez.com frontend.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type")

  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const { items, total, currency } = req.body as any

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items required" })
  }

  await debugLog(pg, "paypal_create_start", null, `Creating PayPal order: ${items.length} items, $${total}`, { itemCount: items.length, total, currency })

  try {
    const accessToken = await getPayPalAccessToken()

    // Normalize items
    const normalizedItems = items.map((item: any) => ({
      name: item.name || "Product",
      quantity: String(item.quantity || 1),
      category: item.category || "PHYSICAL_GOODS",
      unit_amount: typeof item.unit_amount === "object"
        ? item.unit_amount
        : { currency_code: currency || "USD", value: String(item.unit_amount) },
    }))

    const itemTotal = normalizedItems
      .reduce((sum: number, item: any) => sum + parseFloat(item.unit_amount.value) * parseInt(item.quantity), 0)
      .toFixed(2)

    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: currency || "USD",
            value: itemTotal,
            breakdown: { item_total: { currency_code: currency || "USD", value: itemTotal } },
          },
          items: normalizedItems,
        }],
      }),
    })

    const orderData = await orderRes.json()

    if (!orderRes.ok) {
      await debugLog(pg, "paypal_create_error", null, `PayPal order creation failed: ${orderRes.status}`, { status: orderRes.status, error: orderData }, { level: "error" })
      return res.status(500).json({ error: "Order creation failed", details: orderData })
    }

    await debugLog(pg, "paypal_create_success", null, `PayPal order created: ${orderData.id}`, { orderId: orderData.id, amount: itemTotal })

    return res.json({ id: orderData.id, status: orderData.status })
  } catch (err: any) {
    await debugLog(pg, "paypal_create_error", null, `Error: ${err.message}`, { error: err.message }, { level: "error" })
    return res.status(500).json({ error: err.message })
  }
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  return res.status(204).send("")
}
