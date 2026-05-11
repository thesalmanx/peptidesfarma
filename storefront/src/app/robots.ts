import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account/", "/auth/", "/cart/", "/cart", "/checkout/", "/track/", "/theme-preview/"],
      },
    ],
    sitemap: "https://www.peptidesfarma.com/sitemap.xml",
    host: "https://www.peptidesfarma.com",
  }
}
