import { NextRequest, NextResponse } from "next/server"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

/**
 * Apple sends a POST with form data (code, state, user).
 * We exchange the code for a token server-side (same pattern as Google),
 * handle existing customer linking, then redirect to the client page with the token.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData()

  const code = formData.get("code") as string | null
  const state = formData.get("state") as string | null
  const user = formData.get("user") as string | null
  const errorParam = formData.get("error") as string | null

  if (errorParam) {
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=${encodeURIComponent(errorParam)}`, 303)
  }
  if (!code) {
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=no_code`, 303)
  }

  try {
    // Step 1: Exchange code for token via Medusa
    const callbackRes = await fetch(
      `${MEDUSA_URL}/auth/customer/apple/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || "")}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        body: JSON.stringify(user ? { user } : {}),
      }
    )

    if (!callbackRes.ok) {
      const errText = await callbackRes.text().catch(() => "")
      console.error("Apple callback failed:", callbackRes.status, errText)
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=callback_failed`, 303)
    }

    const { token } = await callbackRes.json()
    if (!token) {
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=no_token`, 303)
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

      // Parse user data from Apple (only sent on first sign in)
      let firstName = payload.user_metadata?.given_name || ""
      let lastName = payload.user_metadata?.family_name || ""
      if (user) {
        try {
          const userData = JSON.parse(user)
          if (userData.name?.firstName) firstName = userData.name.firstName
          if (userData.name?.lastName) lastName = userData.name.lastName
          if (userData.email && !email) payload.user_metadata = { ...payload.user_metadata, email: userData.email }
        } catch {}
      }

      if (email || payload.user_metadata?.email) {
        const customerEmail = email || payload.user_metadata?.email

        // Step 3: Try create customer (new users)
        const createRes = await fetch(`${MEDUSA_URL}/store/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-publishable-api-key": PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            email: customerEmail,
            first_name: firstName,
            last_name: lastName,
          }),
        })

        if (createRes.ok) {
          // New customer — refresh to get token with actor_id
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
          // Step 4: Customer exists — link auth identity to existing customer
          try {
            const linkRes = await fetch(`${MEDUSA_URL}/store/auth/link`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": PUBLISHABLE_KEY,
              },
              body: JSON.stringify({ email: customerEmail, auth_identity_id: authIdentityId }),
            })
            const linkData = await linkRes.json()
            if (linkData.token) {
              finalToken = linkData.token
            }
          } catch {}
        }
      }
    }

    // Step 5: Pass token to client page
    return NextResponse.redirect(
      `${BASE_URL}/auth/apple/callback?token=${encodeURIComponent(finalToken)}`,
      303
    )
  } catch (err) {
    console.error("Apple callback error:", err)
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=server_error`, 303)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=no_code`, 303)
  }

  // Redirect to same handler logic via internal fetch
  const params = new URLSearchParams()
  if (code) params.set("code", code)
  if (state) params.set("state", state)

  return NextResponse.redirect(`${BASE_URL}/auth/apple/callback?${params.toString()}`, 303)
}
