import { NextRequest, NextResponse } from "next/server"


let _stripe: any = null
function getStripe() { if (!_stripe) { const S = require("stripe").default || require("stripe"); _stripe = new S(process.env.STRIPE_SECRET_KEY || ""); } return _stripe; }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Find or create customer — uses email as dedup key
    const existing = await getStripe().customers.list({ email, limit: 1 })
    const customer = existing.data.length > 0
      ? existing.data[0]
      : await getStripe().customers.create({
          email,
          metadata: { source: "peptidesfarma_subscription" },
        })

    const setupIntent = await getStripe().setupIntents.create({
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
    })
  } catch (error: any) {
    console.error("Setup intent error:", error)
    return NextResponse.json({ error: "Failed to create setup intent" }, { status: 500 })
  }
}
