import { NextRequest, NextResponse } from "next/server"

const WHOP_API_KEY = process.env.WHOP_API_KEY || ""
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://admin.peptidesfarma.com"
const MEDUSA_PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const ORDER_NUMBER_OFFSET = 11000

async function medusa(path: string, options: RequestInit = {}) {
  const res = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "x-publishable-api-key": MEDUSA_PUB_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => null)
  return { ok: res.ok, data }
}

export async function POST(request: NextRequest) {
  try {
    const { planId, cartId } = await request.json()

    if (!planId || !cartId) {
      return NextResponse.json({ success: false, error: "Missing planId or cartId" }, { status: 400 })
    }

    // ── Step 1: Verify payment via Whop API ──
    let paymentVerified = false

    // Check memberships for this plan
    try {
      const membershipsRes = await fetch(
        `https://api.whop.com/api/v5/company/memberships?plan_id=${planId}&per_page=1`,
        { headers: { Authorization: `Bearer ${WHOP_API_KEY}` } }
      )
      if (membershipsRes.ok) {
        const memberships = await membershipsRes.json()
        const membership = memberships.data?.[0]
        if (membership?.status === "active") {
          paymentVerified = true
        }
      }
    } catch (e: any) {
      console.error("[whop-verify] Memberships check failed:", e?.message)
    }

    // Fallback: check payments directly
    if (!paymentVerified) {
      try {
        const paymentsRes = await fetch(
          `https://api.whop.com/api/v5/company/payments?plan_id=${planId}&per_page=1`,
          { headers: { Authorization: `Bearer ${WHOP_API_KEY}` } }
        )
        if (paymentsRes.ok) {
          const payments = await paymentsRes.json()
          const payment = payments.data?.[0]
          if (payment?.status === "paid") {
            paymentVerified = true
          }
        }
      } catch (e: any) {
        console.error("[whop-verify] Payments check failed:", e?.message)
      }
    }

    if (!paymentVerified) {
      return NextResponse.json(
        { success: false, error: "Payment not confirmed yet. If you just paid, please wait a moment and refresh." },
        { status: 402 }
      )
    }

    // ── Step 2: Retrieve cart data from plan's internal_notes ──
    let cartData = ""
    try {
      const planRes = await fetch(`https://api.whop.com/api/v1/plans/${planId}`, {
        headers: { Authorization: `Bearer ${WHOP_API_KEY}` },
      })
      if (planRes.ok) {
        const plan = await planRes.json()
        try {
          const notes = JSON.parse(plan.internal_notes || "{}")
          cartData = notes.cartData || ""
        } catch {
          // internal_notes might be a plain cartId string (legacy format)
          cartData = plan.internal_notes || ""
        }
      }
    } catch (e: any) {
      console.error("[whop-verify] Plan retrieval failed:", e?.message)
    }

    // ── Step 3: Complete the order via Medusa ──

    // Try the card-payment-complete webhook first (handles shipping, payment session, completion)
    try {
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
    } catch (e: any) {
      console.error("[whop-verify] card-payment-complete failed:", e?.message)
    }

    // Fallback: complete via Medusa SDK (init payment session + complete cart)
    try {
      // Init payment session
      const shippingData = await medusa(`/store/shipping-options?cart_id=${cartId}`)
      const options = shippingData.data?.shipping_options || []
      if (options.length) {
        const sorted = [...options].sort((a: any, b: any) => (a.price_type === "calculated" ? 0 : 1) - (b.price_type === "calculated" ? 0 : 1))
        for (const opt of sorted) {
          const addResult = await medusa(`/store/carts/${cartId}/shipping-methods`, {
            method: "POST",
            body: JSON.stringify({ option_id: opt.id }),
          })
          if (addResult.ok) break
        }
      }

      // Create payment collection if needed
      const cartResult = await medusa(`/store/carts/${cartId}`)
      let pcId = cartResult.data?.cart?.payment_collection?.id
      if (!pcId) {
        const pcRes = await medusa(`/store/payment-collections`, {
          method: "POST",
          body: JSON.stringify({ cart_id: cartId }),
        })
        pcId = pcRes.data?.payment_collection?.id
      }

      if (pcId) {
        await medusa(`/store/payment-collections/${pcId}/payment-sessions`, {
          method: "POST",
          body: JSON.stringify({ provider_id: "pp_system_default" }),
        })
      }

      // Complete cart
      const completeRes = await medusa(`/store/carts/${cartId}/complete`, { method: "POST" })
      const order = completeRes.data?.order

      if (order?.display_id) {
        return NextResponse.json({
          success: true,
          orderNumber: String(Number(order.display_id) + ORDER_NUMBER_OFFSET),
          orderId: order.id,
        })
      }

      if (order?.id) {
        return NextResponse.json({
          success: true,
          orderNumber: "",
          orderId: order.id,
        })
      }
    } catch (e: any) {
      console.error("[whop-verify] SDK completion failed:", e?.message)
    }

    // If we get here, payment was verified but order completion had issues
    // Still return success since the customer paid
    return NextResponse.json({
      success: true,
      orderNumber: "",
    })
  } catch (error: any) {
    console.error("[whop-verify] Error:", error)
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 })
  }
}
