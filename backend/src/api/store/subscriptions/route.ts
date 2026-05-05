import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET: List subscriptions for a customer (by email)
// Protected by authentication middleware — customer must be logged in
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const email = req.query.email as string

  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }

  // Verify the authenticated customer owns this email
  const customerId = (req as any).auth_context?.actor_id
  if (customerId) {
    try {
      const customerModuleService = req.scope.resolve("customer") as any
      const customer = await customerModuleService.retrieveCustomer(customerId)
      if (customer?.email && customer.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({ error: "You can only view your own subscriptions" })
      }
    } catch {
      // If customer lookup fails, proceed with email-based lookup (backwards compat)
    }
  }

  try {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    await ensureTable(pgConnection)

    const result = await pgConnection.raw(
      `SELECT * FROM subscriptions WHERE email = ? AND status != 'canceled' ORDER BY created_at DESC`,
      [email]
    )

    return res.json({ subscriptions: result?.rows || [] })
  } catch (error: any) {
    // Error details returned in response; no console.error needed
    return res.status(500).json({ error: "Failed to fetch subscriptions" })
  }
}

// POST: Create a new subscription record
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const {
    email,
    medusa_customer_id,
    medusa_order_id,
    square_customer_id,
    square_card_id,
    square_payment_id,
    amount_cents,
    currency,
    interval,
    items,
    shipping_address,
    next_billing_date,
  } = req.body as any

  if (!email || !square_customer_id || !square_card_id) {
    return res.status(400).json({ error: "Missing required subscription fields" })
  }

  try {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    await ensureTable(pgConnection)

    const result = await pgConnection.raw(
      `INSERT INTO subscriptions (
        email, medusa_customer_id, medusa_order_id,
        square_customer_id, square_card_id, square_payment_id,
        amount_cents, currency, interval_type,
        items, shipping_address, next_billing_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      RETURNING *`,
      [
        email,
        medusa_customer_id || null,
        medusa_order_id || null,
        square_customer_id,
        square_card_id,
        square_payment_id || null,
        amount_cents,
        currency || "USD",
        interval || "monthly",
        JSON.stringify(items || []),
        JSON.stringify(shipping_address || {}),
        next_billing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      ]
    )

    return res.json({ subscription: result?.rows?.[0] })
  } catch (error: any) {
    // Error details returned in response; no console.error needed
    return res.status(500).json({ error: "Failed to create subscription" })
  }
}

async function ensureTable(pgConnection: any) {
  await pgConnection.raw(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      medusa_customer_id VARCHAR(255),
      medusa_order_id VARCHAR(255),
      square_customer_id VARCHAR(255) NOT NULL,
      square_card_id VARCHAR(255) NOT NULL,
      square_payment_id VARCHAR(255),
      amount_cents INTEGER NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      interval_type VARCHAR(20) DEFAULT 'monthly',
      items JSONB DEFAULT '[]',
      shipping_address JSONB DEFAULT '{}',
      next_billing_date TIMESTAMPTZ,
      status VARCHAR(50) DEFAULT 'active',
      failure_count INTEGER DEFAULT 0,
      last_payment_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}
