"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { sdk } from "@/lib/medusa"

function GoogleCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")

  useEffect(() => {
    async function handleCallback() {
      try {
        // Check if server-side route passed us a token
        const tokenFromServer = searchParams.get("token")
        const errorParam = searchParams.get("error")

        if (errorParam) {
          setError(`Sign in failed: ${errorParam}`)
          return
        }

        if (tokenFromServer) {
          // Server-side route already exchanged the code for a token.
          // Store it in the SDK's localStorage so subsequent requests work.
          localStorage.setItem("medusa_auth_token", tokenFromServer)

          // Also set it on the SDK instance
          try {
            await sdk.client.setToken(tokenFromServer)
          } catch {}

          // Verify it works
          try {
            await sdk.store.customer.retrieve()
          } catch {
            // Token might not have actor_id — try refresh
            try {
              await sdk.auth.refresh()
              // Re-retrieve
              await sdk.store.customer.retrieve()
            } catch {}
          }

          // Redirect to account with full page load
          window.location.href = "/account"
          return
        }

        // Fallback: old client-side flow (code in URL)
        const code = searchParams.get("code")
        const state = searchParams.get("state")

        if (!code) {
          setError("No authorization data received")
          return
        }

        const token = await sdk.auth.callback("customer", "google", {
          code,
          state: state || "",
        })

        if (typeof token === "string") {
          let payload: any = {}
          try {
            payload = JSON.parse(atob(token.split(".")[1]))
          } catch {}

          if (!payload.actor_id) {
            const email = payload.user_metadata?.email || ""
            try {
              await sdk.store.customer.create({
                email,
                first_name: payload.user_metadata?.given_name || "",
                last_name: payload.user_metadata?.family_name || "",
              })
            } catch {}
            try {
              await sdk.auth.refresh()
            } catch {}
          }
        }

        window.location.href = "/account"
      } catch (err) {
        console.error("Google auth error:", err)
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
      <p className="text-[#52525B] text-sm">Completing sign in with Google...</p>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-8 h-8 border-2 border-[#4F8AF7] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#52525B] text-sm">Completing sign in with Google...</p>
        </div>
      }
    >
      <GoogleCallbackHandler />
    </Suspense>
  )
}
