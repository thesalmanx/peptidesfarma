import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account/", "/auth/", "/cart/", "/cart", "/checkout/", "/track/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
