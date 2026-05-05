import { sdk } from "@/lib/medusa"

const WISHLIST_KEY = "peptidesfarma_wishlist"
let _cache: string[] | null = null
let _syncing = false

function getLocalWishlist(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]")
  } catch {
    return []
  }
}

function setLocalWishlist(items: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items))
}

export function getWishlist(): string[] {
  if (_cache !== null) return _cache
  _cache = getLocalWishlist()
  return _cache
}

export function isInWishlist(productId: string): boolean {
  return getWishlist().includes(productId)
}

export function toggleWishlistItem(productId: string): boolean {
  const items = [...getWishlist()]
  const index = items.indexOf(productId)
  const added = index === -1
  if (added) items.push(productId)
  else items.splice(index, 1)
  _cache = items
  setLocalWishlist(items)
  window.dispatchEvent(new Event("wishlist-change"))
  syncToServer(items)
  return added
}

async function syncToServer(items: string[]) {
  try {
    await sdk.store.customer.update({ metadata: { wishlist_items: items } } as Record<string, unknown>)
  } catch {}
}

export async function syncWishlistFromServer(): Promise<void> {
  if (_syncing) return
  _syncing = true
  try {
    const { customer } = await sdk.store.customer.retrieve()
    const serverItems = (((customer as any)?.metadata?.wishlist_items) as string[]) || []
    const localItems = getLocalWishlist()
    const merged = [...new Set([...serverItems, ...localItems])]
    _cache = merged
    setLocalWishlist(merged)
    const changed = merged.length !== serverItems.length || !merged.every((id) => serverItems.includes(id))
    if (changed) {
      await sdk.store.customer.update({ metadata: { wishlist_items: merged } } as Record<string, unknown>)
    }
    window.dispatchEvent(new Event("wishlist-change"))
  } catch {} finally {
    _syncing = false
  }
}

export function clearWishlistCache() {
  _cache = null
}
