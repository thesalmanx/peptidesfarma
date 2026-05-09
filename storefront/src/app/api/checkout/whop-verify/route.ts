import { NextRequest, NextResponse } from "next/server"

const WHOP_API_KEY = process.env.WHOP_API_KEY || ""
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://admin.peptidesfarma.com"

export async function POST(request: NextRequest) {
  try {
    const { planId, cartId } = await request.json()

    if (!planId || !cartId) {
      return NextResponse.json({ success: false, error: "Missing planId or cartId" }, { status: 400 })
    }

    // Check if any membership exists for this plan (payment went through)
    const membershipsRes = await fetch(
      `https://api.whop.com/api/v5/company/memberships?plan_id=${planId}&per_page=1`,
      { headers: { Authorization: `Bearer ${WHOP_API_KEY}` } }
    )

    if (!membershipsRes.ok) {
      return NextResponse.json({ success: false, error: "Could not verify payment" }, { status: 500 })
    }

    const memberships = await membershipsRes.json()
    const membership = memberships.data?.[0]

    if (!membership || membership.status !== "active") {
      // Also check payments directly
      const paymentsRes = await fetch(
        `https://api.whop.com/api/v5/company/payments?plan_id=${planId}&per_page=1`,
        { headers: { Authorization: `Bearer ${WHOP_API_KEY}` } }
      )
      const payments = await paymentsRes.json()
      const payment = payments.data?.[0]

      if (!payment || payment.status !== "paid") {
        return NextResponse.json({ success: false, error: "Payment not confirmed yet. If you just paid, please wait a moment and refresh." }, { status: 402 })
      }
    }

    // Payment verified. Get cart data from plan's internal_notes
    const planRes = await fetch(`https://api.whop.com/api/v1/plans/${planId}`, {
      headers: { Authorization: `Bearer ${WHOP_API_KEY}` },
    })
    const plan = await planRes.json()

    let cartData = ""
    try {
      const notes = JSON.parse(plan.internal_notes || "{}")
      cartData = notes.cartData || ""
    } catch {}

    // Complete the order via Medusa card-payment-complete webhook
    const completeRes = await fetch(`${MEDUSA_BACKEND_URL}/hooks/card-payment-complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartId,
        paymentId: `whop_${planId}`,
        paymentProvider: "whop",
        cartData,
      }),
    })

    const result = await completeRes.json()

    if (result?.orderNumber || result?.success) {
      return NextResponse.json({
        success: true,
        orderNumber: result.orderNumber || "",
        orderId: result.orderId || "",
      })
    }

    // If card-payment-complete doesn't work, try completing via SDK
    // (cart might already be set up from checkout pre-setup)
    try {
      const sdkCompleteRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const sdkResult = await sdkCompleteRes.json()
      const order = sdkResult?.order
      if (order?.display_id) {
        const ORDER_NUMBER_OFFSET = 11000
        return NextResponse.json({
          success: true,
          orderNumber: String(Number(order.display_id) + ORDER_NUMBER_OFFSET),
          orderId: order.id,
        })
      }
    } catch {}

    return NextResponse.json({
      success: true,
      orderNumber: result?.orderNumber || "",
    })
  } catch (error: any) {
    console.error("[whop-verify] Error:", error)
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 })
  }
}
