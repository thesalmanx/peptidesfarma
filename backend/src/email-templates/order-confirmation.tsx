import {
  Column,
  Hr,
  Img,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"
import { BaseLayout } from "./components/base-layout"

interface OrderItem {
  title: string
  variant_title?: string
  quantity: number
  unit_price: string
  line_total?: string
  thumbnail?: string
}

interface ShippingAddress {
  first_name?: string
  last_name?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  phone?: string
}

interface OrderConfirmationProps {
  displayId: string
  orderDate: string
  email: string
  items: OrderItem[]
  subtotal: string
  shippingTotal: string
  taxTotal: string
  discountTotal?: string
  discountCode?: string
  venmoDiscount?: string
  total: string
  currency: string
  shippingAddress?: ShippingAddress
  shippingMethod?: string
  shippingEstimate?: string
  storefrontUrl: string
}

export default function OrderConfirmation({
  displayId,
  orderDate,
  email,
  items,
  subtotal,
  shippingTotal,
  taxTotal,
  discountTotal,
  discountCode,
  venmoDiscount,
  total,
  currency,
  shippingAddress,
  shippingMethod,
  shippingEstimate,
  storefrontUrl,
}: OrderConfirmationProps) {
  const addr = shippingAddress

  return (
    <BaseLayout
      preview={`Thanks for shopping with us! Order #${displayId}`}
      storefrontUrl={storefrontUrl}
    >
      {/* ── Hero ── */}
      <Section style={{ padding: "44px 24px 36px", textAlign: "center" as const }}>
        <Text style={{ color: "#242424", fontSize: "26px", fontWeight: 700, margin: "0 0 12px", lineHeight: "1.3" }}>
          We've received your order.
        </Text>
        <Text style={{ color: "#6B7280", fontSize: "15px", margin: 0, lineHeight: "1.7" }}>
          We'll let you know when your items have been shipped.
        </Text>
      </Section>

      {/* ── Order Info ── */}
      <Section style={{ padding: "0 24px 28px" }}>
        <div style={{ backgroundColor: "#F9FAFB", borderRadius: "8px", padding: "20px 24px" }}>
          <Row>
            <Column>
              <Text style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, margin: "0 0 6px" }}>
                Order Number
              </Text>
              <Text style={{ color: "#242424", fontSize: "16px", fontWeight: 700, margin: 0 }}>
                #{displayId}
              </Text>
            </Column>
            <Column style={{ textAlign: "right" as const }}>
              <Text style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, margin: "0 0 6px" }}>
                Placed on
              </Text>
              <Text style={{ color: "#242424", fontSize: "16px", fontWeight: 700, margin: 0 }}>
                {orderDate}
              </Text>
            </Column>
          </Row>
        </div>
      </Section>

      <Hr style={{ borderColor: "#E5E5E5", margin: "0 24px" }} />

      {/* ── Billing & Shipping Info ── */}
      {addr && (
        <Section style={{ padding: "24px 24px" }}>
          <Row>
            <Column style={{ width: "50%", verticalAlign: "top", paddingRight: "12px" }}>
              <Text style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, margin: "0 0 10px" }}>
                Billing Information
              </Text>
              <Text style={{ color: "#242424", fontSize: "14px", lineHeight: "1.7", margin: "0 0 4px" }}>
                Paid with Credit/Debit Card
              </Text>
              <Text style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                {addr.first_name} {addr.last_name}
                <br />
                {addr.address_1}
                {addr.address_2 ? <><br />{addr.address_2}</> : null}
                <br />
                {addr.city}, {addr.province} {addr.postal_code}
                <br />
                {addr.country_code?.toUpperCase()}
                {addr.phone ? <><br />{addr.phone}</> : null}
                <br />
                {email}
              </Text>
            </Column>
            <Column style={{ width: "50%", verticalAlign: "top", paddingLeft: "12px" }}>
              <Text style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, margin: "0 0 10px" }}>
                Shipping Information
              </Text>
              <Text style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.7", margin: "0 0 12px" }}>
                {addr.first_name} {addr.last_name}
                <br />
                {addr.address_1}
                {addr.address_2 ? <><br />{addr.address_2}</> : null}
                <br />
                {addr.city}, {addr.province} {addr.postal_code}
                <br />
                {addr.country_code?.toUpperCase()}
                {addr.phone ? <><br />{addr.phone}</> : null}
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, margin: "0 0 6px" }}>
                Delivery Method
              </Text>
              <Text style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                {shippingMethod || "Standard Shipping"}
                {shippingEstimate ? <><br />({shippingEstimate})</> : null}
              </Text>
            </Column>
          </Row>
        </Section>
      )}

      <Hr style={{ borderColor: "#E5E5E5", margin: "0 24px" }} />

      {/* ── Items ── */}
      <Section style={{ padding: "28px 24px" }}>
        <Text style={{ color: "#115C6F", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const, margin: "0 0 24px" }}>
          Order Summary
        </Text>

        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: i < items.length - 1 ? "24px" : "0" }}>
            <Row>
              <Column style={{ width: "72px", verticalAlign: "top" }}>
                {item.thumbnail ? (
                  <Img
                    src={item.thumbnail}
                    alt={item.title}
                    width="64"
                    height="64"
                    style={{ borderRadius: "8px", border: "1px solid #F0F0F0", objectFit: "cover" as const }}
                  />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: "#F5F5F5" }} />
                )}
              </Column>
              <Column style={{ verticalAlign: "top", paddingLeft: "16px" }}>
                <Text style={{ color: "#242424", fontSize: "15px", fontWeight: 600, margin: "0 0 4px", lineHeight: "1.4" }}>
                  {item.title}
                </Text>
                {item.variant_title && (
                  <Text style={{ color: "#6B7280", fontSize: "13px", fontWeight: 500, margin: "0 0 6px" }}>
                    {item.variant_title}
                  </Text>
                )}
                <Text style={{ color: "#9CA3AF", fontSize: "13px", margin: 0 }}>
                  Qty: {item.quantity}
                </Text>
              </Column>
              <Column style={{ verticalAlign: "top", textAlign: "right" as const, width: "90px" }}>
                <Text style={{ color: "#242424", fontSize: "15px", fontWeight: 700, margin: 0 }}>
                  ${item.line_total || item.unit_price}
                </Text>
              </Column>
            </Row>
          </div>
        ))}
      </Section>

      <Hr style={{ borderColor: "#E5E5E5", margin: "0 24px" }} />

      {/* ── Totals ── */}
      <Section style={{ padding: "24px 24px" }}>
        <Row style={{ marginBottom: "8px" }}>
          <Column>
            <Text style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>Subtotal</Text>
          </Column>
          <Column style={{ textAlign: "right" as const }}>
            <Text style={{ color: "#242424", fontSize: "14px", fontWeight: 500, margin: 0 }}>${subtotal}</Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: "8px" }}>
          <Column>
            <Text style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>Shipping</Text>
          </Column>
          <Column style={{ textAlign: "right" as const }}>
            <Text style={{ color: "#242424", fontSize: "14px", fontWeight: 500, margin: 0 }}>
              {parseFloat(shippingTotal) === 0 ? "Free" : `$${shippingTotal}`}
            </Text>
          </Column>
        </Row>
        {discountTotal && (
          <Row style={{ marginBottom: "8px" }}>
            <Column>
              <Text style={{ color: "#16a34a", fontSize: "14px", margin: 0 }}>Coupon{discountCode ? ` (${discountCode})` : ""}</Text>
            </Column>
            <Column style={{ textAlign: "right" as const }}>
              <Text style={{ color: "#16a34a", fontSize: "14px", fontWeight: 500, margin: 0 }}>- ${discountTotal}</Text>
            </Column>
          </Row>
        )}
        {venmoDiscount && (
          <Row style={{ marginBottom: "8px" }}>
            <Column>
              <Text style={{ color: "#008CFF", fontSize: "14px", margin: 0 }}>Venmo Discount (5%)</Text>
            </Column>
            <Column style={{ textAlign: "right" as const }}>
              <Text style={{ color: "#008CFF", fontSize: "14px", fontWeight: 500, margin: 0 }}>- ${venmoDiscount}</Text>
            </Column>
          </Row>
        )}
        <Row style={{ marginBottom: "8px" }}>
          <Column>
            <Text style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>Tax</Text>
          </Column>
          <Column style={{ textAlign: "right" as const }}>
            <Text style={{ color: "#242424", fontSize: "14px", fontWeight: 500, margin: 0 }}>${taxTotal}</Text>
          </Column>
        </Row>
        <Hr style={{ borderColor: "#115C6F", borderWidth: "2px", margin: "12px 0" }} />
        <Row>
          <Column>
            <Text style={{ color: "#115C6F", fontSize: "18px", fontWeight: 700, margin: 0 }}>Total</Text>
          </Column>
          <Column style={{ textAlign: "right" as const }}>
            <Text style={{ color: "#115C6F", fontSize: "18px", fontWeight: 700, margin: 0 }}>${total}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={{ borderColor: "#E5E5E5", margin: "0 24px" }} />

      {/* ── CTA ── */}
      <Section style={{ padding: "32px 24px", textAlign: "center" as const }}>
        <Link
          href={`${storefrontUrl}/account/orders`}
          style={{
            background: "linear-gradient(90deg, #0B59A2 0%, #1174BF 50%, #0D92CF 100%)",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 600,
            padding: "14px 48px",
            display: "inline-block",
            textAlign: "center" as const,
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          View Your Order
        </Link>
      </Section>
    </BaseLayout>
  )
}
