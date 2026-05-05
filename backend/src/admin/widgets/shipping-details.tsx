import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { Container, Heading, Text, Badge } from "@medusajs/ui"

const ShippingDetailsWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const meta = (data as any).metadata || {}

  const shippingCost = meta.shippo_shipping_cost
  const provider = meta.shippo_shipping_provider
  const service = meta.shippo_shipping_service
  const estimatedDays = meta.shippo_shipping_estimated_days
  const isFree = meta.shippo_shipping_free
  const rateId = meta.shippo_rate_id

  // Tax from metadata (Zip-Tax calculated at checkout)
  const taxAmount = meta.tax_amount != null ? Number(meta.tax_amount) : 0
  const taxRate = meta.tax_rate != null ? Number(meta.tax_rate) : 0
  const taxJurisdiction = meta.tax_jurisdiction || ""
  const customerPaidTotal = meta.customer_paid_total != null ? Number(meta.customer_paid_total) : 0

  // Don't render if no shipping and no tax metadata
  if (!provider && !service && shippingCost == null && taxAmount === 0) {
    return null
  }

  const subtotal = (data as any).subtotal ?? 0
  const discountTotal = (data as any).discount_total ?? 0
  const medusaShipping = (data as any).shipping_total ?? 0
  const actualShipping = shippingCost != null ? Number(shippingCost) : medusaShipping

  const toNum = (v: any): number => {
    if (v == null) return 0
    if (typeof v === "object" && v.value != null) return Number(v.value)
    return Number(v) || 0
  }

  const formatUsd = (v: number) => `$${v.toFixed(2)}`

  // Use customer_paid_total as the authoritative total
  const displayTotal = customerPaidTotal > 0
    ? customerPaidTotal
    : toNum(subtotal) + actualShipping + taxAmount - toNum(discountTotal)

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Shipping Details</Heading>
        {isFree && <Badge color="green">FREE SHIPPING</Badge>}
      </div>

      <div className="px-6 py-4 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
        {provider && (
          <>
            <Text className="text-ui-fg-subtle font-medium">Carrier</Text>
            <Text className="font-semibold">{provider}</Text>
          </>
        )}
        {service && (
          <>
            <Text className="text-ui-fg-subtle font-medium">Service</Text>
            <Text className="font-semibold">{service}</Text>
          </>
        )}
        {estimatedDays && (
          <>
            <Text className="text-ui-fg-subtle font-medium">Est. Delivery</Text>
            <Text className="font-semibold">{estimatedDays} business days</Text>
          </>
        )}
        {shippingCost != null && (
          <>
            <Text className="text-ui-fg-subtle font-medium">Shipping Cost</Text>
            <Text className="font-semibold">
              {isFree ? (
                <span>
                  <span className="line-through text-ui-fg-subtle mr-1">{formatUsd(Number(meta.shippo_original_cost || shippingCost))}</span>
                  FREE
                </span>
              ) : (
                formatUsd(Number(shippingCost))
              )}
            </Text>
          </>
        )}
        {rateId && (
          <>
            <Text className="text-ui-fg-subtle font-medium">Shippo Rate ID</Text>
            <Text className="font-mono text-xs">{rateId}</Text>
          </>
        )}
      </div>

      {/* Customer total breakdown — always show when we have tax or shipping data */}
      <div className="px-6 py-4 bg-ui-bg-subtle">
        <div className="flex items-center justify-between mb-1">
          <Text className="text-ui-fg-subtle text-sm">Items Subtotal</Text>
          <Text className="text-sm">{formatUsd(toNum(subtotal))}</Text>
        </div>
        <div className="flex items-center justify-between mb-1">
          <Text className="text-ui-fg-subtle text-sm">
            Shipping{provider ? ` (${provider}${service ? ` ${service}` : ''})` : ''}
          </Text>
          <Text className="text-sm">{isFree ? "FREE" : formatUsd(actualShipping)}</Text>
        </div>
        {taxAmount > 0 && (
          <div className="flex items-center justify-between mb-1">
            <Text className="text-ui-fg-subtle text-sm">
              Tax{taxJurisdiction ? ` (${(taxRate * 100).toFixed(2)}% ${taxJurisdiction})` : ''}
            </Text>
            <Text className="text-sm">{formatUsd(taxAmount)}</Text>
          </div>
        )}
        {toNum(discountTotal) > 0 && (
          <div className="flex items-center justify-between mb-1">
            <Text className="text-ui-fg-subtle text-sm">Discount</Text>
            <Text className="text-sm text-green-600">-{formatUsd(toNum(discountTotal))}</Text>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-ui-border-base">
          <Text className="font-semibold">Customer Paid (Total)</Text>
          <Text className="font-bold text-base">{formatUsd(displayTotal)}</Text>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default ShippingDetailsWidget
