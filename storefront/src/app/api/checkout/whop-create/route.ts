import { NextRequest, NextResponse } from "next/server"

const WHOP_API_KEY = process.env.WHOP_API_KEY || ""
const WHOP_PRODUCT_ID = process.env.WHOP_PRODUCT_ID || ""
const WHOP_COMPANY_ID = process.env.WHOP_COMPANY_ID || ""
const PAYMENT_DOMAIN = process.env.NEXT_PUBLIC_PAYMENT_DOMAIN || "https://summerteez.com"
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com").trim()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId, amount, cartData, email, name } = body

    if (!cartId || !amount) {
      return NextResponse.json({ error: "cartId and amount required" }, { status: 400 })
    }

    if (!WHOP_API_KEY) {
      return NextResponse.json({ error: "Whop API key not configured" }, { status: 500 })
    }

    const planRes = await fetch("https://api.whop.com/api/v1/plans", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHOP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_id: WHOP_COMPANY_ID,
        product_id: WHOP_PRODUCT_ID,
        plan_type: "one_time",
        currency: "usd",
        initial_price: String(Number(amount).toFixed(2)),
        visibility: "hidden",
        internal_notes: cartId,
      }),
    })

    if (!planRes.ok) {
      const err = await planRes.text()
      console.error("[whop-create] Plan creation failed:", planRes.status, err)
      return NextResponse.json({ error: "Failed to create checkout", debug: err, status: planRes.status }, { status: 500 })
    }

    const plan = await planRes.json()

    // Build payment domain URL with all params for embedded checkout
    const payParams = new URLSearchParams({
      planId: plan.id,
      cartId,
      amount: String(Number(amount).toFixed(2)),
      email: email || "",
      name: name || "",
      cancelUrl: `${SITE_URL}/checkout?resume=1&cc=true`,
      cartData: cartData || "",
    })

    return NextResponse.json({
      checkoutUrl: `${PAYMENT_DOMAIN}/checkout/whop?${payParams.toString()}`,
      planId: plan.id,
    })
  } catch (error: any) {
    console.error("[whop-create] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
