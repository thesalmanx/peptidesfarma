export interface OrderReceiptItem {
  title: string
  variant_title?: string
  quantity: number
  unit_price: number
  line_total: number
  thumbnail?: string
}

export interface OrderShippingAddress {
  name?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  phone?: string
}

export interface OrderReceipt {
  orderNumber?: string
  shipping_address?: OrderShippingAddress
  items: OrderReceiptItem[]
  subtotal: number
  shipping: number
  shippingMethod?: string
  tax: number
  taxJurisdiction?: string
  discount: number
  promoCode?: string
  total: number
  paymentMethod: string
  paymentLast4?: string
  currency: string
}

const KEY = "peptidesfarma_last_order_summary"

export function saveOrderReceipt(receipt: OrderReceipt): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(KEY, JSON.stringify(receipt))
  } catch {
    // Quota or disabled storage, ignore.
  }
}

export function getOrderReceipt(orderNumber?: string): OrderReceipt | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as OrderReceipt
    // If both URL and stash carry an orderNumber, they must match. If the
    // stash has no orderNumber yet (bank redirect flow stashes pre-order),
    // accept it for the just-completed checkout regardless.
    if (orderNumber && parsed.orderNumber && parsed.orderNumber !== orderNumber) return null
    return parsed
  } catch {
    return null
  }
}

export function clearOrderReceipt(): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Ignore.
  }
}
