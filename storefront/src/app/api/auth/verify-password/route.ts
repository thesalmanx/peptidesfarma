import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { password } = await req.json()
  const sitePassword = process.env.SITE_PASSWORD

  if (!sitePassword) {
    // No password set, allow access
    return NextResponse.json({ ok: true })
  }

  if (password === sitePassword) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 })
}
