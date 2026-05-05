import type { MedusaRequest } from "@medusajs/framework/http"

/**
 * Verify the authenticated customer owns the subscription.
 * Returns an error message string if unauthorized, or null if OK.
 */
export async function verifySubscriptionOwnership(
  req: MedusaRequest,
  pgConnection: any,
  subscriptionId: string | number
): Promise<string | null> {
  const customerId = (req as any).auth_context?.actor_id
  if (!customerId) return "Authentication required"

  try {
    const customerModuleService = req.scope.resolve("customer") as any
    const customer = await customerModuleService.retrieveCustomer(customerId)
    if (!customer?.email) return "Customer not found"

    const result = await pgConnection.raw(
      `SELECT id FROM subscriptions WHERE id = ? AND LOWER(email) = LOWER(?)`,
      [subscriptionId, customer.email]
    )

    if (!result?.rows?.length) {
      return "You can only manage your own subscriptions"
    }

    return null // Ownership verified
  } catch {
    return "Failed to verify subscription ownership"
  }
}
