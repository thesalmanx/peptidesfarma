import { NextRequest, NextResponse } from "next/server"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cart_id, code } = body

    if (!cart_id || !code) {
      return NextResponse.json(
        { error: "cart_id and code are required" },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = PUBLISHABLE_KEY
    }

    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cart_id}/promotions`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ promo_codes: [code.toUpperCase()] }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      const message =
        data?.message || data?.error || "Invalid or expired promo code"
      return NextResponse.json({ error: message }, { status: res.status })
    }

    return NextResponse.json({ cart: data.cart ?? data })
  } catch (error: any) {
    console.error("[api/cart/promo] POST error:", error)
    return NextResponse.json(
      { error: "Failed to apply promo code" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cart_id = searchParams.get("cart_id")
    const code = searchParams.get("code")

    if (!cart_id || !code) {
      return NextResponse.json(
        { error: "cart_id and code are required" },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = PUBLISHABLE_KEY
    }

    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cart_id}/promotions`,
      {
        method: "DELETE",
        headers,
        body: JSON.stringify({ promo_codes: [code.toUpperCase()] }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      const message =
        data?.message || data?.error || "Failed to remove promo code"
      return NextResponse.json({ error: message }, { status: res.status })
    }

    return NextResponse.json({ cart: data.cart ?? data })
  } catch (error: any) {
    console.error("[api/cart/promo] DELETE error:", error)
    return NextResponse.json(
      { error: "Failed to remove promo code" },
      { status: 500 }
    )
  }
}
