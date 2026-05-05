import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  Font,
} from "@react-email/components"
import * as React from "react"

const LOGO_URL =
  "https://a.storyblok.com/f/290513376833907/28535/e1de827e26/peptora-email-logo.png"

interface OrderItem {
  title: string
  variant_title?: string
  quantity: number
  unit_price: string
  line_total?: string
  thumbnail?: string
}

interface Address {
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

interface AdminOrderNotificationProps {
  displayId: string
  orderId: string
  email: string
  items: OrderItem[]
  subtotal: string
  shippingTotal: string
  taxTotal: string
  discountTotal?: string
  discountCode?: string
  total: string
  currency: string
  shippingAddress?: Address
  shippingMethod?: string
  shippingEstimate?: string
  paymentMethod?: string
  adminUrl: string
  orderDate: string
}

export default function AdminOrderNotification({
  displayId,
  orderId,
  email,
  items,
  subtotal,
  shippingTotal,
  taxTotal,
  discountTotal,
  discountCode,
  total,
  currency,
  shippingAddress,
  shippingMethod,
  shippingEstimate,
  paymentMethod,
  adminUrl,
  orderDate,
}: AdminOrderNotificationProps) {
  const addr = shippingAddress

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Tailwind>
        <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "'Inter', Helvetica, Arial, sans-serif", margin: 0, padding: "40px 0" }}>
          <Preview>{`Nice! You just got an order (#${displayId}) — $${total} ${currency}`}</Preview>
          <Container style={{ margin: "0 auto", maxWidth: "600px", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>

            {/* ── Header ── */}
            <Section style={{ background: "linear-gradient(135deg, #3D94B5 0%, #2E7089 100%)", padding: "40px 24px", textAlign: "center" as const }}>
              <Img
                src={LOGO_URL}
                alt="Peptidesfarma"
                width="140"
                height="28"
                style={{ margin: "0 auto 24px", display: "block" }}
              />
              <Text style={{ color: "#ffffff", fontSize: "26px", fontWeight: 700, margin: "0 0 8px", lineHeight: "1.3" }}>
                Nice! You just got an order
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", margin: "0 0 8px" }}>
                An order has been placed on your site.
              </Text>
              <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700, margin: "0 0 20px" }}>
                Order #{displayId}
              </Text>
              <Link
                href={`${adminUrl}/orders/${orderId}`}
                style={{
                  display: "inline-block",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "10px 32px",
                  border: "2px solid rgba(255,255,255,0.8)",
                  borderRadius: "6px",
                  textDecoration: "none",
                  textAlign: "center" as const,
                }}
              >
                View Order
              </Link>
            </Section>

            {/* ── Order Information ── */}
            <Section style={{ padding: "28px 24px" }}>
              <Text style={{ color: "#242424", fontSize: "16px", fontWeight: 700, margin: "0 0 16px" }}>
                Order Information
              </Text>
              <Text style={{ color: "#555", fontSize: "14px", lineHeight: "1.8", margin: 0 }}>
                Order #: {displayId}
                <br />
                Order Date: {orderDate}
                <br />
                Total Cost: ${total}
                <br />
                Payment Status: {paymentMethod === "venmo" ? "Unpaid — Awaiting Venmo Payment" : "Paid"}
                <br />
                Payment Method: {paymentMethod === "venmo" ? "Venmo" : "Credit/Debit Card"}
              </Text>
            </Section>

            <Hr style={{ borderColor: "#E5E5E5", margin: "0 24px" }} />

            {/* ── Billing & Shipping ── */}
            {addr && (
              <Section style={{ padding: "28px 24px" }}>
                <Row>
                  <Column style={{ width: "50%", verticalAlign: "top", paddingRight: "12px" }}>
                    <Text style={{ color: "#242424", fontSize: "14px", fontWeight: 700, margin: "0 0 10px" }}>
                      Shipping Information
                    </Text>
                    <Text style={{ color: "#555", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
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
                    <Text style={{ color: "#242424", fontSize: "14px", fontWeight: 700, margin: "0 0 10px" }}>
                      Delivery Method
                    </Text>
                    <Text style={{ color: "#555", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                      {shippingMethod || "Standard Shipping"}
                      {shippingEstimate ? <><br />({shippingEstimate})</> : null}
                    </Text>
                  </Column>
                </Row>
              </Section>
            )}

            <Hr style={{ borderColor: "#E5E5E5", margin: "0 24px" }} />

            {/* ── Order Details ── */}
            <Section style={{ padding: "28px 24px" }}>
              <Text style={{ color: "#242424", fontSize: "16px", fontWeight: 700, margin: "0 0 16px" }}>
                Order Details
              </Text>

              {/* Table header */}
              <Row style={{ borderBottom: "2px solid #242424", paddingBottom: "8px", marginBottom: "8px" }}>
                <Column style={{ width: "55%" }}>
                  <Text style={{ color: "#555", fontSize: "13px", fontWeight: 600, margin: 0 }}>Item</Text>
                </Column>
                <Column style={{ width: "15%", textAlign: "center" as const }}>
                  <Text style={{ color: "#555", fontSize: "13px", fontWeight: 600, margin: 0 }}>Qty</Text>
                </Column>
                <Column style={{ width: "30%", textAlign: "right" as const }}>
                  <Text style={{ color: "#555", fontSize: "13px", fontWeight: 600, margin: 0 }}>Total</Text>
                </Column>
              </Row>

              {/* Items */}
              {items.map((item, i) => (
                <Row key={i} style={{ borderBottom: "1px solid #F0F0F0", padding: "10px 0" }}>
                  <Column style={{ width: "55%", verticalAlign: "top" }}>
                    <Row>
                      {item.thumbnail && (
                        <Column style={{ width: "56px", verticalAlign: "top" }}>
                          <Img
                            src={item.thumbnail}
                            alt={item.title}
                            width="48"
                            height="48"
                            style={{ borderRadius: "6px", border: "1px solid #F0F0F0" }}
                          />
                        </Column>
                      )}
                      <Column style={{ verticalAlign: "top", paddingLeft: item.thumbnail ? "10px" : "0" }}>
                        <Text style={{ color: "#242424", fontSize: "14px", fontWeight: 500, margin: "0 0 2px" }}>
                          {item.title}
                        </Text>
                        {item.variant_title && (
                          <Text style={{ color: "#888", fontSize: "13px", margin: "0 0 2px" }}>
                            Size: {item.variant_title}
                          </Text>
                        )}
                        <Text style={{ color: "#888", fontSize: "13px", margin: 0 }}>
                          Price: ${item.unit_price}
                        </Text>
                      </Column>
                    </Row>
                  </Column>
                  <Column style={{ width: "15%", textAlign: "center" as const, verticalAlign: "top" }}>
                    <Text style={{ color: "#242424", fontSize: "14px", margin: 0 }}>
                      {item.quantity}
                    </Text>
                  </Column>
                  <Column style={{ width: "30%", textAlign: "right" as const, verticalAlign: "top" }}>
                    <Text style={{ color: "#242424", fontSize: "14px", fontWeight: 600, margin: 0 }}>
                      ${item.line_total || item.unit_price}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr style={{ borderColor: "#E5E5E5", margin: "0 24px" }} />

            {/* ── Totals ── */}
            <Section style={{ padding: "24px 24px" }}>
              <Row style={{ marginBottom: "6px" }}>
                <Column style={{ textAlign: "right" as const, paddingRight: "16px" }}>
                  <Text style={{ color: "#555", fontSize: "14px", margin: 0 }}>Subtotal</Text>
                </Column>
                <Column style={{ width: "100px", textAlign: "right" as const }}>
                  <Text style={{ color: "#242424", fontSize: "14px", margin: 0 }}>${subtotal}</Text>
                </Column>
              </Row>
              <Row style={{ marginBottom: "6px" }}>
                <Column style={{ textAlign: "right" as const, paddingRight: "16px" }}>
                  <Text style={{ color: "#555", fontSize: "14px", margin: 0 }}>Shipping</Text>
                </Column>
                <Column style={{ width: "100px", textAlign: "right" as const }}>
                  <Text style={{ color: "#242424", fontSize: "14px", margin: 0 }}>
                    {parseFloat(shippingTotal) === 0 ? "Free" : `$${shippingTotal}`}
                  </Text>
                </Column>
              </Row>
              {discountTotal && (
                <Row style={{ marginBottom: "6px" }}>
                  <Column style={{ textAlign: "right" as const, paddingRight: "16px" }}>
                    <Text style={{ color: "#16a34a", fontSize: "14px", margin: 0 }}>Coupon{discountCode ? ` (${discountCode})` : ""}</Text>
                  </Column>
                  <Column style={{ width: "100px", textAlign: "right" as const }}>
                    <Text style={{ color: "#16a34a", fontSize: "14px", margin: 0 }}>- ${discountTotal}</Text>
                  </Column>
                </Row>
              )}
              <Row style={{ marginBottom: "6px" }}>
                  <Column style={{ textAlign: "right" as const, paddingRight: "16px" }}>
                    <Text style={{ color: "#555", fontSize: "14px", margin: 0 }}>Tax</Text>
                  </Column>
                  <Column style={{ width: "100px", textAlign: "right" as const }}>
                    <Text style={{ color: "#242424", fontSize: "14px", margin: 0 }}>${taxTotal}</Text>
                  </Column>
                </Row>
              <Row>
                <Column style={{ textAlign: "right" as const, paddingRight: "16px" }}>
                  <Text style={{ color: "#242424", fontSize: "15px", fontWeight: 700, margin: 0 }}>Total</Text>
                </Column>
                <Column style={{ width: "100px", textAlign: "right" as const }}>
                  <Text style={{ color: "#242424", fontSize: "15px", fontWeight: 700, margin: 0 }}>${total}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={{ borderColor: "#E5E5E5", margin: 0 }} />

            {/* ── Footer ── */}
            <Section style={{ padding: "20px 24px", backgroundColor: "#F9FAFB", textAlign: "center" as const }}>
              <Text style={{ color: "#AFAFAF", fontSize: "12px", margin: 0 }}>
                &copy; {new Date().getFullYear()} Peptidesfarma. All rights reserved.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
