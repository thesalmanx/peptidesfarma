/**
 * Build a carrier-specific tracking URL from a tracking number and optional carrier name.
 *
 * Detection order:
 *   1. Carrier string (from Shippo webhook / fulfillment data)
 *   2. Tracking number pattern (heuristic fallback)
 *
 * Supported carriers: UPS, USPS, FedEx, DHL.
 * Falls back to UPS if carrier cannot be determined.
 */
export function getCarrierTrackingUrl(
  trackingNumber: string,
  carrier?: string
): string {
  if (!trackingNumber) return ""

  const c = (carrier || "").toUpperCase()

  // 1. Match by carrier name first (most reliable — comes from Shippo)
  if (c.includes("UPS")) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`
  }
  if (c.includes("USPS")) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
  }
  if (c.includes("FEDEX")) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
  }
  if (c.includes("DHL")) {
    return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`
  }

  // 2. Heuristic: detect carrier from tracking number format
  if (trackingNumber.startsWith("1Z")) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`
  }
  if (/^9[234]\d{18,}$/.test(trackingNumber) || /^\d{20,}$/.test(trackingNumber)) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
  }
  if (/^\d{12,15}$/.test(trackingNumber)) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
  }

  // 3. Default to UPS
  return `https://www.ups.com/track?tracknum=${trackingNumber}`
}

/**
 * Get a human-readable carrier name from a carrier string or tracking number.
 */
export function getCarrierName(trackingNumber: string, carrier?: string): string {
  const c = (carrier || "").toUpperCase()

  if (c.includes("UPS")) return "UPS"
  if (c.includes("USPS")) return "USPS"
  if (c.includes("FEDEX")) return "FedEx"
  if (c.includes("DHL")) return "DHL"

  // Heuristic from tracking number
  if (trackingNumber?.startsWith("1Z")) return "UPS"
  if (/^9[234]\d{18,}$/.test(trackingNumber) || /^\d{20,}$/.test(trackingNumber)) return "USPS"
  if (/^\d{12,15}$/.test(trackingNumber)) return "FedEx"

  return "UPS"
}
