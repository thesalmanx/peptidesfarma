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

interface VenmoPaymentInstructionsProps {
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
  storefrontUrl: string
}

const VENMO_QR_URL =
  "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://venmo.com/peptidesfarma"
const VENMO_PROFILE_URL = "https://venmo.com/peptidesfarma"

export default function VenmoPaymentInstructions({
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
  storefrontUrl,
}: VenmoPaymentInstructionsProps) {
  const addr = shippingAddress

  return (
    <BaseLayout
      preview={`Complete your Venmo payment for Order #${displayId} — $${total} due`}
      storefrontUrl={storefrontUrl}
    >
      {/* ── Order ID Badge ── */}
      <Section style={{ padding: "32px 24px 8px", textAlign: "center" as const }}>
        <Text style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" as const, margin: "0 0 4px" }}>
          ORDER #{displayId}
        </Text>
      </Section>

      {/* ── Hero ── */}
      <Section style={{ padding: "8px 24px 20px", textAlign: "center" as const }}>
        <Text style={{ color: "#242424", fontSize: "26px", fontWeight: 700, margin: "0 0 12px", lineHeight: "1.3" }}>
          Complete your payment
        </Text>
        <Text style={{ color: "#6B7280", fontSize: "15px", margin: "0 0 4px", lineHeight: "1.7" }}>
          Thank you for your order! Please complete your Venmo payment to proceed.
        </Text>
      </Section>

      {/* ── Urgency Banner ── */}
      <Section style={{ padding: "0 24px 24px" }}>
        <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "8px", padding: "16px 20px", textAlign: "center" as const }}>
          <Text style={{ color: "#92400E", fontSize: "14px", fontWeight: 600, margin: 0, lineHeight: "1.5" }}>
            ⏱️ Action required: Please complete payment within 24 hours to avoid order cancellation.
          </Text>
        </div>
      </Section>

      {/* ── Amount Due ── */}
      <Section style={{ padding: "0 24px 28px" }}>
        <div style={{ backgroundColor: "#EFF6FF", border: "2px solid #008CFF", borderRadius: "12px", padding: "24px", textAlign: "center" as const }}>
          <Text style={{ color: "#6B7280", fontSize: "12px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, margin: "0 0 8px" }}>
            Amount Due
          </Text>
          <Text style={{ color: "#008CFF", fontSize: "36px", fontWeight: 700, margin: 0, lineHeight: "1.2" }}>
            ${total}
          </Text>
        </div>
      </Section>

      <Hr style={{ borderColor: "#E5E5E5", margin: "0 24px" }} />

      {/* ── Venmo Payment Instructions ── */}
      <Section style={{ padding: "28px 24px" }}>
        <Text style={{ color: "#115C6F", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const, margin: "0 0 20px" }}>
          Venmo Payment Instructions
        </Text>

        {/* QR Code */}
        <div style={{ textAlign: "center" as const, marginBottom: "24px" }}>
          <Img
            src={VENMO_QR_URL}
            alt="Venmo QR Code — Scan to pay @peptidesfarma"
            width="200"
            height="200"
            style={{ margin: "0 auto", display: "block", borderRadius: "8px", border: "1px solid #E5E5E5" }}
          />
          <Text style={{ color: "#9CA3AF", fontSize: "12px", margin: "8px 0 0", textAlign: "center" as const }}>
            Scan with the Venmo app
          </Text>
        </div>

        {/* Pay with Venmo Button */}
        <div style={{ textAlign: "center" as const, marginBottom: "24px" }}>
          <Link
            href={VENMO_PROFILE_URL}
            style={{
              backgroundColor: "#008CFF",
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
            Pay with Venmo
          </Link>
        </div>

        {/* Profile & Note */}
        <div style={{ backgroundColor: "#F9FAFB", borderRadius: "8px", padding: "20px 24px" }}>
          <Row style={{ marginBottom: "16px" }}>
            <Column>
              <Text style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, margin: "0 0 6px" }}>
                Venmo Profile
              </Text>
              <Link href={VENMO_PROFILE_URL} style={{ color: "#008CFF", fontSize: "16px", fontWeight: 700, textDecoration: "none" }}>
                @peptidesfarma
              </Link>
            </Column>
          </Row>
          <Row style={{ marginBottom: "16px" }}>
            <Column>
              <Text style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, margin: "0 0 6px" }}>
                Required Memo
              </Text>
              <Text style={{ color: "#242424", fontSize: "16px", fontWeight: 700, margin: 0 }}>
                Order {displayId}
              </Text>
            </Column>
          </Row>
          <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "6px", padding: "12px 16px" }}>
            <Text style={{ color: "#92400E", fontSize: "13px", fontWeight: 600, margin: 0, lineHeight: "1.5" }}>
              Include &quot;Order {displayId}&quot; in the Memo so we can match your payment.
            </Text>
          </div>
        </div>
      </Section>

      <Hr style={{ borderColor: "#E5E5E5", margin: "0 24px" }} />

      {/* ── Items ── */}
      <Section style={{ padding: "28px 24px" }}>
        <Text style={{ color: "#115C6F", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const, margin: "0 0 24px" }}>
          Order Summary
        </Text>

        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: i < items.length - 1 ? "24px" : "0" }}>
            <Row>
              <Column style={{ width: "36px", verticalAlign: "top" }}>
                <Text style={{ fontSize: "20px", margin: 0, lineHeight: "1.4" }}>📦</Text>
              </Column>
              <Column style={{ verticalAlign: "top", paddingLeft: "12px" }}>
                <Text style={{ color: "#242424", fontSize: "15px", fontWeight: 600, margin: "0 0 4px", lineHeight: "1.4" }}>
                  {item.title} × {item.quantity}
                </Text>
                {item.variant_title && (
                  <Text style={{ color: "#6B7280", fontSize: "13px", fontWeight: 500, margin: 0 }}>
                    {item.variant_title}
                  </Text>
                )}
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

      {/* ── Shipping Address ── */}
      {addr && (
        <>
          <Section style={{ padding: "24px 24px" }}>
            <Text style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, margin: "0 0 10px" }}>
              Shipping To
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
            </Text>
          </Section>
          <Hr style={{ borderColor: "#E5E5E5", margin: "0 24px" }} />
        </>
      )}

      {/* ── What's Next ── */}
      <Section style={{ padding: "28px 24px", textAlign: "center" as const }}>
        <Text style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.7", margin: "0 0 24px" }}>
          <strong style={{ color: "#242424" }}>What's next?</strong> Once we confirm your payment, we'll process your order and send you tracking information.
        </Text>
        <Link
          href={VENMO_PROFILE_URL}
          style={{
            backgroundColor: "#008CFF",
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
          Pay with Venmo Now
        </Link>
        <Text style={{ color: "#9CA3AF", fontSize: "12px", margin: "12px 0 0", lineHeight: "1.5" }}>
          Or open Venmo and send to @peptidesfarma
        </Text>
      </Section>
    </BaseLayout>
  )
}
