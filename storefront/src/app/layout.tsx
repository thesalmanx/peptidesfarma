import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Instrument_Serif } from "next/font/google"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import LayoutShell from "@/components/layout/LayoutShell"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import PasswordGate from "@/components/PasswordGate"
import StoryblokProvider from "@/components/StoryblokProvider"
import IntercomMessenger from "@/components/Intercom"
import EmailCapturePopup from "@/components/EmailCapturePopup"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#08122A",
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Peptidesfarma | Research-Grade Peptides, Verified Before They Ship",
    template: "%s | Peptidesfarma",
  },
  description:
    "Pharmaceutical-grade research peptides. HPLC-verified, lot-traced compounds for laboratory use. 99%+ purity, same-day shipping, COA included with every order.",
  keywords: [
    "research peptides",
    "laboratory compounds",
    "high-purity peptides",
    "BPC-157",
    "GHK-Cu",
    "peptide research",
    "HPLC verified",
    "certificate of analysis",
  ],
  authors: [{ name: "Peptidesfarma" }],
  creator: "Peptidesfarma",
  publisher: "Peptidesfarma",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Peptidesfarma",
    title: "Peptidesfarma | Research-Grade Peptides, Verified Before They Ship",
    description:
      "Pharmaceutical-grade research peptides. HPLC-verified, lot-traced compounds for laboratory use. 99%+ purity, same-day shipping.",
    images: [{ url: `${SITE_URL}/icons/peptidesfarma-logo.png`, width: 1200, height: 630, alt: "Peptidesfarma" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Peptidesfarma | Research-Grade Peptides",
    description:
      "Pharmaceutical-grade research peptides. HPLC-verified, lot-traced. 99%+ purity, same-day shipping.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: SITE_URL },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TWD8M6F2');`,
          }}
        />
        {/* GA4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-CN97FWF0EV" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-CN97FWF0EV');`,
          }}
        />
        {process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL && (
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Peptidesfarma",
              url: SITE_URL,
              logo: `${SITE_URL}/icons/peptidesfarma-logo.svg`,
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: "support@peptidesfarma.com",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
        style={{ fontFamily: "var(--pf-sans)" }}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TWD8M6F2" height="0" width="0" style={{ display: "none", visibility: "hidden" }} /></noscript>
        <PasswordGate>
        <StoryblokProvider>
        <AuthProvider>
          <CartProvider>
            <LayoutShell
              header={<Header />}
              footer={<Footer />}
            >
              {children}
            </LayoutShell>
            <IntercomMessenger />
            <EmailCapturePopup />
            <SpeedInsights />
            <Analytics />
          </CartProvider>
        </AuthProvider>
        </StoryblokProvider>
        </PasswordGate>
      </body>
    </html>
  )
}
