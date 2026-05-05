import { NextRequest, NextResponse } from "next/server"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD

async function getAdminToken(): Promise<string | null> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return null
  try {
    const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    })
    const data = await res.json()
    return data.token || null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 })
    }

    const token = await getAdminToken()
    if (!token) {
      return NextResponse.json({ error: "Admin auth failed" }, { status: 500 })
    }

    // Get the order's payment collections to find the payment to capture
    const orderRes = await fetch(
      `${MEDUSA_URL}/admin/orders/${orderId}?fields=payment_collections.payments.*`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!orderRes.ok) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const orderData = await orderRes.json()
    const order = orderData.order
    const paymentCollections = order?.payment_collections || []

    let captured = false
    for (const pc of paymentCollections) {
      for (const payment of pc.payments || []) {
        if (payment.captured_at) continue // Already captured

        // Capture this payment
        const captureRes = await fetch(
          `${MEDUSA_URL}/admin/payments/${payment.id}/capture`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        )

        if (captureRes.ok) {
          captured = true
        } else {
          const err = await captureRes.text()
          console.error(`Failed to capture payment ${payment.id}:`, err)
        }
      }
    }

    return NextResponse.json({ success: true, captured })
  } catch (error: any) {
    console.error("Auto-capture error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
