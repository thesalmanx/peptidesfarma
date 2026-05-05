"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { sdk } from "@/lib/medusa"
import { syncWishlistFromServer, clearWishlistCache } from "@/lib/wishlist"

interface Customer {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  has_account: boolean
  metadata?: Record<string, unknown> | null
}

interface AuthContextValue {
  customer: Customer | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  register: (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    marketingConsent?: boolean
  }) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCustomer = useCallback(async () => {
    // Retry with increasing delays for OAuth flows where cookie is being established
    const delays = [0, 500, 1500]
    for (let i = 0; i < delays.length; i++) {
      try {
        if (delays[i] > 0) await new Promise((r) => setTimeout(r, delays[i]))
        const { customer: c } = await sdk.store.customer.retrieve()
        setCustomer(c as unknown as Customer)
        return
      } catch {
        if (i === delays.length - 1) setCustomer(null)
      }
    }
  }, [])

  useEffect(() => {
    fetchCustomer()
      .then(() => syncWishlistFromServer())
      .finally(() => setIsLoading(false))
  }, [fetchCustomer])

  const login = useCallback(
    async (email: string, password: string) => {
      await sdk.auth.login("customer", "emailpass", { email, password })
      await fetchCustomer()
      await syncWishlistFromServer()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("peptidesfarma:auth-changed"))
      }
    },
    [fetchCustomer]
  )

  const loginWithGoogle = useCallback(async () => {
    const callbackUrl = `${window.location.origin}/api/auth/google/callback`
    const result = await sdk.auth.login("customer", "google", { callback_url: callbackUrl })
    if (typeof result !== "string" && result.location) {
      window.location.href = result.location
    }
  }, [])

  const loginWithApple = useCallback(async () => {
    const result = await sdk.auth.login("customer", "apple", {})
    if (typeof result !== "string" && result.location) {
      window.location.href = result.location
    }
  }, [])

  const register = useCallback(
    async (data: {
      email: string
      password: string
      first_name: string
      last_name: string
      marketingConsent?: boolean
    }) => {
      let token: unknown
      try {
        token = await sdk.auth.register("customer", "emailpass", {
          email: data.email,
          password: data.password,
        })
      } catch (err: any) {
        const msg = err?.message?.toLowerCase() || ""
        if (msg.includes("exists") || msg.includes("already") || msg.includes("duplicate")) {
          throw new Error("An account with this email already exists. Please log in instead.")
        }
        throw new Error(err?.message || "Registration failed. Please try again.")
      }

      if (typeof token === "string") {
        const customerPayload: Record<string, unknown> = {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
        }
        if (data.marketingConsent) {
          customerPayload.metadata = {
            klaviyo: {
              email: true,
              consented_at: new Date().toISOString(),
            },
          }
        }
        await sdk.store.customer.create(customerPayload as any)
        await sdk.auth.refresh()
      }

      await fetchCustomer()
      await syncWishlistFromServer()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("peptidesfarma:auth-changed"))
      }
    },
    [fetchCustomer]
  )

  const logout = useCallback(async () => {
    try {
      await sdk.auth.logout()
    } catch {
    }
    clearWishlistCache()
    setCustomer(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: email,
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoading,
        isAuthenticated: !!customer,
        login,
        loginWithGoogle,
        loginWithApple,
        register,
        logout,
        resetPassword,
        refreshCustomer: fetchCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
