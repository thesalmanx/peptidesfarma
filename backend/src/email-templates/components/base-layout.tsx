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
const LOGO_DARK_URL =
  "https://a.storyblok.com/f/290513376833907/28443/6901c37df6/peptora-email-logo-dark.png"

interface BaseLayoutProps {
  preview: string
  storefrontUrl: string
  children: React.ReactNode
}

export function BaseLayout({ preview, storefrontUrl, children }: BaseLayoutProps) {
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
          <Preview>{preview}</Preview>
          <Container style={{ margin: "0 auto", maxWidth: "600px", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>

            {/* ── Header ── */}
            <Section style={{ background: "linear-gradient(135deg, #3D94B5 0%, #2E7089 100%)", padding: "28px 24px", textAlign: "center" as const }}>
              <Img
                src={LOGO_URL}
                alt="Peptidesfarma"
                width="180"
                height="36"
                style={{ margin: "0 auto", display: "block" }}
              />
            </Section>

            {/* ── Content ── */}
            {children}

            {/* ── Help Section ── */}
            <Section style={{ padding: "28px 24px", backgroundColor: "#F9FAFB", borderTop: "1px solid #E5E5E5" }}>
              <Text style={{ color: "#242424", fontSize: "14px", fontWeight: 700, margin: "0 0 8px" }}>
                Need Help?
              </Text>
              <Text style={{ color: "#6B7280", fontSize: "13px", lineHeight: "1.7", margin: "0 0 20px" }}>
                We're here to help with any questions about your order.
              </Text>
              <Text style={{ margin: "0 0 10px" }}>
                <Link href={`${storefrontUrl}/shipping-policy`} style={{ color: "#115C6F", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
                  Shipping Info
                </Link>
              </Text>
              <Text style={{ margin: "0 0 10px" }}>
                <Link href={`${storefrontUrl}/refund-policy`} style={{ color: "#115C6F", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
                  Returns &amp; Exchanges
                </Link>
              </Text>
              <Text style={{ margin: 0 }}>
                <Link href="mailto:support@peptidesfarma.com" style={{ color: "#115C6F", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
                  support@peptidesfarma.com
                </Link>
              </Text>
            </Section>

            {/* ── Footer ── */}
            <Section className="text-center" style={{ borderTop: "1px solid #E5E5E5", padding: "32px 24px 24px" }}>
              <table className="w-full">
                <tr className="w-full">
                  <td align="center">
                    <Img
                      alt="Peptidesfarma"
                      height="42"
                      src={LOGO_DARK_URL}
                      width="210"
                      style={{ margin: "0 auto" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td align="center" style={{ paddingTop: "20px" }}>
                    <Row className="table-cell h-[44px] w-[56px] align-bottom">
                      <Column className="pr-[8px]">
                        <Link href="https://www.instagram.com/peptidesfarma">
                          <Img alt="Instagram" height="36" src={"https://react.email/static/instagram-logo.png"} width="36" />
                        </Link>
                      </Column>
                      <Column className="pr-[8px]">
                        <Link href="https://www.facebook.com/peptidesfarma">
                          <Img alt="Facebook" height="36" src={"https://react.email/static/facebook-logo.png"} width="36" />
                        </Link>
                      </Column>
                      <Column>
                        <Link href="https://x.com/peptidesfarma">
                          <Img alt="X" height="36" src={"https://react.email/static/x-logo.png"} width="36" />
                        </Link>
                      </Column>
                    </Row>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <Text className="my-[8px] text-[14px] font-semibold text-gray-500 leading-[24px]">
                      <Link href="mailto:support@peptidesfarma.com" style={{ color: "#6B7280", textDecoration: "none" }}>support@peptidesfarma.com</Link>
                    </Text>
                    <Text className="mt-[4px] mb-0 text-[12px] text-gray-400 leading-[20px]">
                      &copy; {new Date().getFullYear()} Peptidesfarma. All rights reserved.
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
