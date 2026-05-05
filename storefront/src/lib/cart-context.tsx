"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react"
import { sdk } from "@/lib/medusa"
import type { HttpTypes } from "@medusajs/types"
import { trackAddToCart, trackRemoveFromCart } from "@/lib/gtag"

const CART_ID_KEY = "medusa_cart_id"

interface CartContextValue {
  cart: HttpTypes.StoreCart | null
  isLoading: boolean
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (variantId: string, quantity: number, metadata?: Record<string, unknown>) => Promise<void>
  updateItem: (lineItemId: string, quantity: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  refreshCart: (cartId: string) => Promise<void>
  clearCart: () => void
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

let cachedRegionId: string | null = null
let regionPromise: Promise<string> | null = null

function getRegionId(): Promise<string> {
  if (cachedRegionId) return Promise.resolve(cachedRegionId)
  if (regionPromise) return regionPromise
  regionPromise = sdk.store.region.list({ limit: 10 }).then(({ regions }) => {
    const usd = regions?.find((r) => r.currency_code === "usd")
    cachedRegionId = usd?.id || regions?.[0]?.id || ""
    return cachedRegionId
  })
  return regionPromise
}

// Preload region on module load so it's ready when user clicks add to cart
if (typeof window !== "undefined") getRegionId()

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const pendingOps = useRef(0)
  // Track in-flight operations per item to prevent race conditions
  const busyItems = useRef(new Set<string>())

  useEffect(() => {
    const cartId = localStorage.getItem(CART_ID_KEY)
    if (!cartId) {
      // Pre-create cart so first addItem is always 1 API call instead of 3
      getRegionId()
        .then((regionId) => sdk.store.cart.create({ region_id: regionId }))
        .then(({ cart }) => {
          localStorage.setItem(CART_ID_KEY, cart.id)
          setCart(cart)
        })
        .catch(() => {})
        .finally(() => setIsLoading(false))
      return
    }
    sdk.store.cart
      .retrieve(cartId)
      .then(async ({ cart }) => {
        // If cart is already completed, clear it and create a fresh one
        if ((cart as any)?.completed_at) {
          localStorage.removeItem(CART_ID_KEY)
          setCart(null)
          getRegionId()
            .then((regionId) => sdk.store.cart.create({ region_id: regionId }))
            .then(({ cart: newCart }) => {
              localStorage.setItem(CART_ID_KEY, newCart.id)
              setCart(newCart)
            })
            .catch(() => {})
          return
        }
        // Re-attach cart to the authenticated customer if needed (covers
        // OAuth callbacks that finish with a full page reload).
        if (!(cart as any)?.customer_id) {
          try {
            const { cart: transferred } = await sdk.store.cart.transferCart(cartId)
            setCart(transferred)
            return
          } catch {
            // Not authenticated, or transfer not applicable — keep the
            // anonymous cart we already retrieved.
          }
        }
        setCart(cart)
      })
      .catch(() => localStorage.removeItem(CART_ID_KEY))
      .finally(() => setIsLoading(false))
  }, [])

  // Re-attach the cart to the customer after sign-up / sign-in so the
  // cart isn't dropped when ownership changes from anonymous to the new
  // customer. Triggered via a window event so this stays decoupled from
  // auth-context.
  useEffect(() => {
    const handler = async () => {
      const cartId = localStorage.getItem(CART_ID_KEY)
      if (!cartId) return
      try {
        await sdk.store.cart.transferCart(cartId)
      } catch {
        // Already owned, or transfer not needed; fall through to refresh.
      }
      try {
        const { cart: updated } = await sdk.store.cart.retrieve(cartId)
        setCart(updated)
      } catch {
        // Leave existing state in place; next page load will recover.
      }
    }
    window.addEventListener("peptidesfarma:auth-changed", handler)
    return () => window.removeEventListener("peptidesfarma:auth-changed", handler)
  }, [])

  const ensureCart = useCallback(async (): Promise<string> => {
    const existingId = localStorage.getItem(CART_ID_KEY)
    if (existingId && cart) return existingId

    const regionId = await getRegionId()
    const { cart: newCart } = await sdk.store.cart.create({ region_id: regionId })
    localStorage.setItem(CART_ID_KEY, newCart.id)
    setCart(newCart)
    return newCart.id
  }, [cart])

  const refreshCart = useCallback(async (cartId: string) => {
    const { cart: updated } = await sdk.store.cart.retrieve(cartId)
    setCart(updated)
  }, [])

  const clearCart = useCallback(() => {
    localStorage.removeItem(CART_ID_KEY)
    setCart(null)
    setIsDrawerOpen(false)
  }, [])

  // ── addItem ──
  // Button shows spinner → API adds item → drawer opens with real item
  const addItem = useCallback(
    async (variantId: string, quantity: number, metadata?: Record<string, unknown>) => {
      if (busyItems.current.has(variantId)) return
      busyItems.current.add(variantId)

      let cartId: string
      try {
        cartId = await ensureCart()
      } catch {
        busyItems.current.delete(variantId)
        return
      }

      pendingOps.current++
      try {
        const { cart: updated } = await sdk.store.cart.createLineItem(cartId, {
          variant_id: variantId,
          quantity,
          ...(metadata ? { metadata } : {}),
        })
        setCart(updated)
        setIsDrawerOpen(true)
        const addedItem = updated.items?.find((i) => i.variant_id === variantId)
        if (addedItem) {
          trackAddToCart({
            id: addedItem.product_id || variantId,
            name: addedItem.product_title || "",
            variant: addedItem.variant_title || undefined,
            price: (addedItem.unit_price ?? 0) / 100,
            currency: updated.currency_code?.toUpperCase() || "USD",
            quantity,
          })
        }
      } catch (err) {
        refreshCart(cartId)
        throw err
      } finally {
        pendingOps.current--
        busyItems.current.delete(variantId)
      }
    },
    [ensureCart, refreshCart]
  )

  // ── Optimistic updateItem ──
  // Updates quantity in local state instantly, syncs API in background
  const updateItem = useCallback(
    async (lineItemId: string, quantity: number) => {
      if (!cart) return
      // Prevent concurrent updates to the same line item
      if (busyItems.current.has(lineItemId)) return
      busyItems.current.add(lineItemId)

      // Optimistic: update local cart immediately
      setCart((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items?.map((item) =>
            item.id === lineItemId
              ? {
                  ...item,
                  quantity,
                  total: (item.unit_price ?? 0) * quantity,
                }
              : item
          ),
        } as HttpTypes.StoreCart
      })

      // Sync with backend in background
      pendingOps.current++
      sdk.store.cart
        .updateLineItem(cart.id, lineItemId, { quantity })
        .then(({ cart: updated }) => {
          setCart(updated)
        })
        .catch(() => {
          refreshCart(cart.id)
        })
        .finally(() => {
          pendingOps.current--
          busyItems.current.delete(lineItemId)
        })
    },
    [cart, refreshCart]
  )

  // ── Optimistic removeItem ──
  // Removes item from local state instantly, syncs API in background
  const removeItem = useCallback(
    async (lineItemId: string) => {
      if (!cart) return
      // Prevent concurrent removal of the same item
      if (busyItems.current.has(lineItemId)) return
      busyItems.current.add(lineItemId)

      // GA4: track remove_from_cart before removing
      const removedItem = cart.items?.find((i) => i.id === lineItemId)
      if (removedItem) {
        trackRemoveFromCart({
          id: removedItem.product_id || lineItemId,
          name: removedItem.product_title || "",
          variant: removedItem.variant_title || undefined,
          price: (removedItem.unit_price ?? 0) / 100,
          currency: cart.currency_code?.toUpperCase() || "USD",
          quantity: removedItem.quantity,
        })
      }

      // Optimistic: remove from local state immediately
      setCart((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items?.filter((item) => item.id !== lineItemId),
        } as HttpTypes.StoreCart
      })

      // Sync with backend in background
      pendingOps.current++
      sdk.store.cart
        .deleteLineItem(cart.id, lineItemId)
        .then(() => refreshCart(cart.id))
        .catch(() => refreshCart(cart.id))
        .finally(() => {
          pendingOps.current--
          busyItems.current.delete(lineItemId)
        })
    },
    [cart, refreshCart]
  )

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addItem,
        updateItem,
        removeItem,
        refreshCart,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
