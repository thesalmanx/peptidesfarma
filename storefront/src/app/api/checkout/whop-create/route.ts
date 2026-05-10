import { NextRequest, NextResponse } from "next/server"

// ── Required env vars ──
// WHOP_API_KEY        – Whop company API key (Bearer token)
// WHOP_PRODUCT_ID     – The Whop product to attach plans to
// WHOP_COMPANY_ID     – Your Whop company ID
const WHOP_API_KEY = process.env.WHOP_API_KEY || ""
const WHOP_PRODUCT_ID = process.env.WHOP_PRODUCT_ID || ""
const WHOP_COMPANY_ID = process.env.WHOP_COMPANY_ID || ""
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

    // Store cart metadata in internal_notes for retrieval during verification
    const notesPayload = JSON.stringify({
      cartId,
      cartData: cartData || "",
      email: email || "",
      name: name || "",
    })

    // Create a hidden one-time Whop plan for this exact amount
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
        internal_notes: notesPayload,
      }),
    })

    if (!planRes.ok) {
      const err = await planRes.text()
      console.error("[whop-create] Plan creation failed:", planRes.status, err)
      return NextResponse.json({ error: "Failed to create checkout", debug: err, status: planRes.status }, { status: 500 })
    }

    const plan = await planRes.json()

    // Whop hosted checkout URL with d2c (direct-to-consumer) flag
    // Redirect back to our callback page after successful payment
    const callbackUrl = `${SITE_URL}/checkout/whop-callback?plan_id=${plan.id}&cart_id=${cartId}`
    const checkoutUrl = `https://whop.com/checkout/${plan.id}/?d2c=true&redirect_url=${encodeURIComponent(callbackUrl)}`

    return NextResponse.json({
      checkoutUrl,
      planId: plan.id,
    })
  } catch (error: any) {
    console.error("[whop-create] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
