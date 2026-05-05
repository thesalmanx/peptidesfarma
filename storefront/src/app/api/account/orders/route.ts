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

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")
  if (!email) {
    return NextResponse.json({ orders: [], error: "no email" })
  }

  const token = await getAdminToken()
  if (!token) {
    return NextResponse.json({ orders: [], error: "admin auth failed", url: MEDUSA_URL })
  }

  try {
    const apiUrl = `${MEDUSA_URL}/admin/orders?q=${encodeURIComponent(email)}&limit=50&order=-created_at&fields=id,display_id,email,total,subtotal,tax_total,shipping_total,discount_total,currency_code,created_at,status,metadata,items.*,fulfillments.*,fulfillments.labels.*,shipping_address.*`
    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ orders: [], error: `api ${res.status}`, detail: errText.slice(0, 200) })
    }

    const data = await res.json()
    const filtered = (data.orders || []).filter(
      (o: any) => (o.email || "").toLowerCase() === email.toLowerCase()
    )
    return NextResponse.json({ orders: filtered })
  } catch (err: any) {
    return NextResponse.json({ orders: [], error: err.message })
  }
}
