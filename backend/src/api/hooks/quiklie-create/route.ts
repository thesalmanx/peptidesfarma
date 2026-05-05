import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createQuikliePayment } from "../../../utils/quiklie"
import { debugLog } from "../../../utils/debug-log"

/**
 * POST /hooks/quiklie-create
 * Creates a Quiklie HPP payment session and returns the redirect URL.
 * Called from the storefront checkout page when PAYMENT_PROVIDER=quiklie.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type")

  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const {
    cartId,
    amount,
    email,
    firstName,
    lastName,
    phone,
    address,
    city,
    state,
    zipCode,
    country,
    callbackUrl,
    redirectUrl,
  } = req.body as any

  if (!cartId || !amount || !email) {
    return res.status(400).json({ error: "cartId, amount, and email required" })
  }

  // Generate unique transaction reference from cartId + timestamp
  const transactionReferenceId = `${cartId}-${Date.now()}`

  await debugLog(pg, "quiklie_create_start", cartId, `Creating Quiklie payment: $${amount}`, {
    cartId, amount, email, transactionReferenceId,
  })

  try {
    // Get client IP for fraud screening
    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || (req.headers["x-real-ip"] as string)
      || "0.0.0.0"

    const result = await createQuikliePayment({
      amount: Number(amount),
      currencyCode: "USD",
      firstName: firstName || "Customer",
      lastName: lastName || "",
      email,
      phone: phone || "",
      address: address || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
      country: country || "US",
      ipAddress,
      callbackUrl: callbackUrl || "",
      redirectUrl: redirectUrl || "",
      customerReferenceId: cartId,
      transactionReferenceId,
      midType: "THREE_D",
    })

    await debugLog(pg, "quiklie_create_success", cartId, `Quiklie payment created: ${result.qkpaymentId}`, {
      cartId, paymentId: result.qkpaymentId, statusCode: result.statusCode,
    })

    return res.json({
      paymentId: result.qkpaymentId,
      quikleeRedirectUrl: result.quikleeRedirectUrl,
      status: result.status,
      statusCode: result.statusCode,
      transactionReferenceId,
    })
  } catch (err: any) {
    await debugLog(pg, "quiklie_create_error", cartId, `Error: ${err.message}`, {
      cartId, error: err.message,
    }, { level: "error" })
    return res.status(500).json({ error: err.message })
  }
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  return res.status(204).send("")
}
