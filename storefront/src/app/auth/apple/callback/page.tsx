"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { sdk } from "@/lib/medusa"

function AppleCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")

  useEffect(() => {
    async function handleCallback() {
      try {
        const tokenFromServer = searchParams.get("token")
        const errorParam = searchParams.get("error")

        if (errorParam) {
          setError(`Apple Sign In failed: ${errorParam}`)
          return
        }

        if (tokenFromServer) {
          // Server-side route already exchanged the code and handled linking.
          // Store the token so the SDK uses it for subsequent requests.
          localStorage.setItem("medusa_auth_token", tokenFromServer)

          try {
            await sdk.client.setToken(tokenFromServer)
          } catch {}

          // Verify it works
          try {
            await sdk.store.customer.retrieve()
          } catch {
            try {
              await sdk.auth.refresh()
              await sdk.store.customer.retrieve()
            } catch {}
          }

          window.location.href = "/account"
          return
        }

        // Fallback: old client-side flow (code in URL)
        const code = searchParams.get("code")
        const state = searchParams.get("state")

        if (!code) {
          setError("No authorization data received from Apple")
          return
        }

        const token = await sdk.auth.callback("customer", "apple", {
          code,
          state: state || "",
        })

        if (typeof token === "string") {
          let payload: any = {}
          try {
            payload = JSON.parse(atob(token.split(".")[1]))
          } catch {}

          if (!payload.actor_id) {
            const userParam = searchParams.get("user")
            let firstName = payload.user_metadata?.given_name || ""
            let lastName = payload.user_metadata?.family_name || ""
            if (userParam) {
              try {
                const userData = JSON.parse(userParam)
                if (userData.name?.firstName) firstName = userData.name.firstName
                if (userData.name?.lastName) lastName = userData.name.lastName
              } catch {}
            }

            try {
              await sdk.store.customer.create({
                email: payload.user_metadata?.email || "",
                first_name: firstName,
                last_name: lastName,
              })
            } catch {}
            try {
              await sdk.auth.refresh()
            } catch {}
          }
        }

        window.location.href = "/account"
      } catch (err) {
        console.error("Apple auth error:", err)
        setError(err instanceof Error ? err.message : "Authentication failed")
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm max-w-md text-center">
          {error}
        </div>
        <button
          onClick={() => (window.location.href = "/auth/login")}
          className="text-[#4F8AF7] hover:underline font-semibold text-sm"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-8 h-8 border-2 border-[#4F8AF7] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#52525B] text-sm">Completing sign in with Apple...</p>
    </div>
  )
}

export default function AppleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-8 h-8 border-2 border-[#4F8AF7] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#52525B] text-sm">Completing sign in with Apple...</p>
        </div>
      }
    >
      <AppleCallbackHandler />
    </Suspense>
  )
}
