import { NextRequest, NextResponse } from "next/server"


let _stripe: any = null
function getStripe() { if (!_stripe) { const S = require("stripe").default || require("stripe"); _stripe = new S(process.env.STRIPE_SECRET_KEY || ""); } return _stripe; }

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 })
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      paymentStatus: session.payment_status,
      status: session.status,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_email,
      cartId: session.metadata?.cartId || null,
    })
  } catch (error: any) {
    console.error("Stripe verify-session error:", error)
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 })
  }
}
