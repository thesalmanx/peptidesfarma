/**
 * Quiklie HPP payment utilities.
 */

const QUIKLIE_API = "https://api.quiklie.com"

function getQuiklieHeaders(): Record<string, string> {
  const apiKey = process.env.QUIKLIE_API_KEY
  if (!apiKey) throw new Error("QUIKLIE_API_KEY not configured")
  return { "Content-Type": "application/json", "x-api-key": apiKey, "x-source": "api" }
}

interface QuikliePaymentParams {
  amount: number; currencyCode: string; firstName: string; lastName: string
  email: string; phone: string; address: string; city: string; state: string
  zipCode: string; country: string; ipAddress: string; callbackUrl: string
  redirectUrl: string; customerReferenceId?: string; transactionReferenceId?: string
  midType?: "THREE_D" | "TWO_D"
}

interface QuikliePaymentResponse {
  status: string; statusCode: string; qkpaymentId: string; amount: number
  currency: string; last4digit: string | null; message: string
  quikleeRedirectUrl: string; customerReferenceId?: string; transactionReferenceId?: string
}

export async function createQuikliePayment(params: QuikliePaymentParams): Promise<QuikliePaymentResponse> {
  const merchantId = process.env.QUIKLIE_MERCHANT_ID
  if (!merchantId) throw new Error("QUIKLIE_MERCHANT_ID not configured")
  const body = {
    merchantId, firstName: params.firstName, lastName: params.lastName, email: params.email,
    phone: params.phone, amount: params.amount, currencyCode: params.currencyCode,
    address: params.address, zipCode: params.zipCode, city: params.city, state: params.state,
    country: params.country, ipAddress: params.ipAddress, callbackUrl: params.callbackUrl,
    redirectUrl: params.redirectUrl,
    ...(params.midType ? { midType: params.midType } : {}),
    ...(params.customerReferenceId ? { customerReferenceId: params.customerReferenceId } : {}),
    ...(params.transactionReferenceId ? { transactionReferenceId: params.transactionReferenceId } : {}),
  }
  const res = await fetch(`${QUIKLIE_API}/api/v2/process-payment/hpp`, { method: "POST", headers: getQuiklieHeaders(), body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(`Quiklie payment creation failed: ${res.status} — ${JSON.stringify(data)}`)
  return data as QuikliePaymentResponse
}

interface QuiklieTransactionStatus {
  quickleePaymentId: string; status: string; statusCode: string; quikleeMessage: string
  amount: number; currency: string; customerReferenceId?: string; transactionReferenceId?: string
}

export async function getQuiklieTransactionStatus(paymentIdOrTxRef: string): Promise<QuiklieTransactionStatus> {
  const res = await fetch(`${QUIKLIE_API}/api/v1/transaction-status/${paymentIdOrTxRef}`, { headers: getQuiklieHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(`Quiklie status check failed: ${res.status} — ${JSON.stringify(data)}`)
  return data as QuiklieTransactionStatus
}

export function validateQuiklieWebhook(apiKeyHeader: string | undefined): boolean {
  const expectedKey = process.env.QUIKLIE_API_KEY
  if (!expectedKey || !apiKeyHeader) return false
  return apiKeyHeader === expectedKey
}

export const QUIKLIE_STATUS = {
  SUCCESS: "1", THREE_DS_REQUIRED: "2", OTP_REQUIRED: "3", PENDING: "4",
  DECLINED: "5", REFUNDED: "6", REFUND_FAILED: "7", CHARGEBACK: "8",
} as const

interface QuiklieS2SParams extends QuikliePaymentParams {
  cardNumber: string; cardHolderName: string; cardExpiryMonth: string
  cardExpiryYear: string; cardCvv: string
}

export async function createQuiklieS2SPayment(params: QuiklieS2SParams): Promise<QuikliePaymentResponse> {
  const merchantId = process.env.QUIKLIE_MERCHANT_ID
  if (!merchantId) throw new Error("QUIKLIE_MERCHANT_ID not configured")
  const body = {
    merchantId, firstName: params.firstName, lastName: params.lastName, email: params.email,
    phone: params.phone, amount: params.amount, currencyCode: params.currencyCode,
    address: params.address, zipCode: params.zipCode, city: params.city, state: params.state,
    country: params.country, ipAddress: params.ipAddress, callbackUrl: params.callbackUrl,
    redirectUrl: params.redirectUrl, cardNumber: params.cardNumber, cardHolderName: params.cardHolderName,
    cardExpiryMonth: params.cardExpiryMonth, cardExpiryYear: params.cardExpiryYear, cardCvv: params.cardCvv,
    ...(params.midType ? { midType: params.midType } : {}),
    ...(params.customerReferenceId ? { customerReferenceId: params.customerReferenceId } : {}),
    ...(params.transactionReferenceId ? { transactionReferenceId: params.transactionReferenceId } : {}),
  }
  const res = await fetch(`${QUIKLIE_API}/api/v2/process-payment`, { method: "POST", headers: getQuiklieHeaders(), body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(`Quiklie S2S payment failed: ${res.status} — ${JSON.stringify(data)}`)
  return data as QuikliePaymentResponse
}

export async function verifyQuiklieOTP(transactionId: string, otp: string): Promise<{ approved: boolean; status: string; message: string; transactionId: string }> {
  const res = await fetch(`${QUIKLIE_API}/api/v1/verify-otp`, { method: "POST", headers: getQuiklieHeaders(), body: JSON.stringify({ transactionId, otp }) })
  const data = await res.json()
  if (!res.ok) throw new Error(`Quiklie OTP verification failed: ${res.status} — ${JSON.stringify(data)}`)
  return data
}

export { QUIKLIE_API }
