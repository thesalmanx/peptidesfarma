import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createQuiklieS2SPayment, QUIKLIE_STATUS } from "../../../utils/quiklie"
import { debugLog } from "../../../utils/debug-log"

/**
 * POST /hooks/quiklie-pay
 * S2S card payment — receives card data from storefront, sends to Quiklie.
 * Returns status + 3DS redirect URL if needed.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "content-type")

  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const {
    cartId, amount, email, firstName, lastName, phone,
    address, city, state, zipCode, country,
    callbackUrl, redirectUrl,
    cardNumber, cardHolderName, cardExpiryMonth, cardExpiryYear, cardCvv,
  } = req.body as any

  if (!cartId || !amount || !cardNumber || !cardCvv) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  const transactionReferenceId = `${cartId}-${Date.now()}`
  const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    || (req.headers["x-real-ip"] as string) || "0.0.0.0"

  await debugLog(pg, "quiklie_s2s_start", cartId, `S2S payment: $${amount}`, {
    cartId, amount, email, last4: cardNumber?.slice(-4),
  })

  try {
    const result = await createQuiklieS2SPayment({
      amount: Number(amount),
      currencyCode: "USD",
      firstName: firstName || "Customer",
      lastName: lastName || "",
      email: email || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
      country: country || "US",
      ipAddress,
      callbackUrl: callbackUrl || "",
      redirectUrl: redirectUrl || "",
      cardNumber,
      cardHolderName: cardHolderName || `${firstName || ""} ${lastName || ""}`.trim(),
      cardExpiryMonth,
      cardExpiryYear,
      cardCvv,
      customerReferenceId: cartId,
      transactionReferenceId,
      midType: "THREE_D",
    })

    // Check if declined at creation
    if (result.statusCode === QUIKLIE_STATUS.DECLINED) {
      await debugLog(pg, "quiklie_s2s_declined", cartId, `Declined: ${result.message || result.status}`, {
        cartId, statusCode: result.statusCode, message: result.message,
      }, { level: "error" })
      return res.status(422).json({
        status: "DECLINED",
        statusCode: result.statusCode,
        message: result.message || "Your card was declined. Please try a different card.",
      })
    }

    // 3DS required — return redirect URL
    if (result.statusCode === QUIKLIE_STATUS.THREE_DS_REQUIRED) {
      await debugLog(pg, "quiklie_s2s_3ds", cartId, `3DS required: ${result.qkpaymentId}`, {
        cartId, paymentId: result.qkpaymentId,
      })
      return res.json({
        status: "3DS_REQUIRED",
        statusCode: result.statusCode,
        paymentId: result.qkpaymentId,
        quikleeRedirectUrl: result.quikleeRedirectUrl,
        transactionReferenceId,
      })
    }

    // OTP required
    if (result.statusCode === QUIKLIE_STATUS.OTP_REQUIRED) {
      await debugLog(pg, "quiklie_s2s_otp", cartId, `OTP required: ${result.qkpaymentId}`, {
        cartId, paymentId: result.qkpaymentId,
      })
      return res.json({
        status: "OTP_REQUIRED",
        statusCode: result.statusCode,
        paymentId: result.qkpaymentId,
        transactionReferenceId,
      })
    }

    // Success
    if (result.statusCode === QUIKLIE_STATUS.SUCCESS) {
      await debugLog(pg, "quiklie_s2s_success", cartId, `Payment approved: ${result.qkpaymentId}`, {
        cartId, paymentId: result.qkpaymentId, last4: result.last4digit,
      })
      return res.json({
        status: "SUCCESS",
        statusCode: result.statusCode,
        paymentId: result.qkpaymentId,
        transactionReferenceId,
        last4digit: result.last4digit,
      })
    }

    // Pending or other
    await debugLog(pg, "quiklie_s2s_pending", cartId, `Status ${result.statusCode}: ${result.message}`, {
      cartId, paymentId: result.qkpaymentId, statusCode: result.statusCode,
    })
    return res.json({
      status: result.status || "PENDING",
      statusCode: result.statusCode,
      paymentId: result.qkpaymentId,
      quikleeRedirectUrl: result.quikleeRedirectUrl,
      transactionReferenceId,
    })

  } catch (err: any) {
    await debugLog(pg, "quiklie_s2s_error", cartId, `Error: ${err.message}`, {
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
