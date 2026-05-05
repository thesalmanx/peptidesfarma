export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args)
  }
}

export function trackPageView(url: string) {
  gtag("config", GA_MEASUREMENT_ID, { page_path: url })
}

export function trackViewItem(item: {
  id: string
  name: string
  price?: number
  currency?: string
  category?: string
}) {
  gtag("event", "view_item", {
    currency: item.currency || "USD",
    value: item.price || 0,
    items: [{ item_id: item.id, item_name: item.name, price: item.price || 0, item_category: item.category }],
  })
}

export function trackViewItemList(
  listName: string,
  items: { id: string; name: string; price?: number; index?: number }[]
) {
  gtag("event", "view_item_list", {
    item_list_name: listName,
    items: items.map((item, i) => ({ item_id: item.id, item_name: item.name, price: item.price || 0, index: item.index ?? i })),
  })
}

export function trackAddToCart(item: {
  id: string
  name: string
  variant?: string
  price?: number
  currency?: string
  quantity: number
}) {
  gtag("event", "add_to_cart", {
    currency: item.currency || "USD",
    value: (item.price || 0) * item.quantity,
    items: [{ item_id: item.id, item_name: item.name, item_variant: item.variant, price: item.price || 0, quantity: item.quantity }],
  })
}

export function trackRemoveFromCart(item: {
  id: string
  name: string
  variant?: string
  price?: number
  currency?: string
  quantity: number
}) {
  gtag("event", "remove_from_cart", {
    currency: item.currency || "USD",
    value: (item.price || 0) * item.quantity,
    items: [{ item_id: item.id, item_name: item.name, item_variant: item.variant, price: item.price || 0, quantity: item.quantity }],
  })
}

export function trackViewCart(
  items: { id: string; name: string; variant?: string; price?: number; quantity: number }[],
  currency: string,
  value: number
) {
  gtag("event", "view_cart", {
    currency,
    value,
    items: items.map((item) => ({ item_id: item.id, item_name: item.name, item_variant: item.variant, price: item.price || 0, quantity: item.quantity })),
  })
}

export function trackBeginCheckout(
  items: { id: string; name: string; variant?: string; price?: number; quantity: number }[],
  currency: string,
  value: number
) {
  gtag("event", "begin_checkout", {
    currency,
    value,
    items: items.map((item) => ({ item_id: item.id, item_name: item.name, item_variant: item.variant, price: item.price || 0, quantity: item.quantity })),
  })
}

export function trackPurchase(order: {
  transactionId: string
  value: number
  currency: string
  shipping?: number
  tax?: number
  items: { id: string; name: string; variant?: string; price?: number; quantity: number }[]
}) {
  gtag("event", "purchase", {
    transaction_id: order.transactionId,
    value: order.value,
    currency: order.currency,
    shipping: order.shipping || 0,
    tax: order.tax || 0,
    items: order.items.map((item) => ({ item_id: item.id, item_name: item.name, item_variant: item.variant, price: item.price || 0, quantity: item.quantity })),
  })
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  gtag("event", eventName, params)
}
