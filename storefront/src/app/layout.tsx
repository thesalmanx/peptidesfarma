import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Newsletter from "@/components/sections/Newsletter"
import LayoutShell from "@/components/layout/LayoutShell"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
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
  themeColor: "#14213D",
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Peptidesfarma | Premium Research Peptides & Compounds",
    template: "%s | Peptidesfarma",
  },
  description:
    "Peptidesfarma offers high-purity research peptides and compounds for laboratory use. 99%+ purity, same-day shipping, certificates of analysis included.",
  keywords: [
    "research peptides",
    "laboratory compounds",
    "high-purity peptides",
    "BPC-157",
    "GHK-Cu",
    "peptide research",
    "laboratory reagents",
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
    title: "Peptidesfarma | Premium Research Peptides & Compounds",
    description:
      "High-purity research peptides and compounds for laboratory use. 99%+ purity, same-day shipping, certificates of analysis included.",
    images: [{ url: `${SITE_URL}/icons/peptidesfarma-logo.png`, width: 1200, height: 630, alt: "Peptidesfarma" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Peptidesfarma | Premium Research Peptides & Compounds",
    description:
      "High-purity research peptides and compounds for laboratory use. 99%+ purity, same-day shipping.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased font-sans`}
      >
        <AuthProvider>
          <CartProvider>
            <LayoutShell
              header={<Header />}
              newsletter={<Newsletter />}
              footer={<Footer />}
            >
              {children}
            </LayoutShell>
            <SpeedInsights />
            <Analytics />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
