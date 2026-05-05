import { NextRequest, NextResponse } from "next/server"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const errorParam = searchParams.get("error")

  if (errorParam) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(errorParam)}`, request.url))
  }
  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url))
  }

  try {
    // Step 1: Exchange code for token
    const callbackRes = await fetch(
      `${MEDUSA_URL}/auth/customer/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || "")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-publishable-api-key": PUBLISHABLE_KEY },
      }
    )
    if (!callbackRes.ok) {
      return NextResponse.redirect(new URL("/auth/login?error=callback_failed", request.url))
    }

    const { token } = await callbackRes.json()
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login?error=no_token", request.url))
    }

    // Step 2: Decode JWT
    let payload: any = {}
    try {
      payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
    } catch {}

    let finalToken = token

    if (!payload.actor_id) {
      const email = payload.user_metadata?.email || ""
      const authIdentityId = payload.auth_identity_id || ""

      if (email) {
        // Step 3: Try create customer (new users)
        const createRes = await fetch(`${MEDUSA_URL}/store/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-publishable-api-key": PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            email,
            first_name: payload.user_metadata?.given_name || "",
            last_name: payload.user_metadata?.family_name || "",
          }),
        })

        if (createRes.ok) {
          // New customer created — refresh to get token with actor_id
          try {
            const refreshRes = await fetch(`${MEDUSA_URL}/auth/token/refresh`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            })
            if (refreshRes.ok) {
              const data = await refreshRes.json()
              if (data.token) finalToken = data.token
            }
          } catch {}
        } else {
          // Step 4: Customer exists — link and get NEW token from backend
          try {
            const linkRes = await fetch(`${MEDUSA_URL}/store/auth/link`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": PUBLISHABLE_KEY,
              },
              body: JSON.stringify({ email, auth_identity_id: authIdentityId }),
            })
            const linkData = await linkRes.json()

            // The link endpoint generates a NEW JWT with actor_id baked in
            if (linkData.token) {
              finalToken = linkData.token
            }
          } catch {}
        }
      }
    }

    // Step 5: Pass token to client
    return NextResponse.redirect(
      new URL(`/auth/google/callback?token=${encodeURIComponent(finalToken)}`, request.url)
    )
  } catch (err) {
    console.error("Google callback error:", err)
    return NextResponse.redirect(new URL("/auth/login?error=server_error", request.url))
  }
}
