import type { MetadataRoute } from "next"
import { getAllProductHandles } from "@/lib/data"

const SITE_URL = "https://www.peptidesfarma.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const handles = await getAllProductHandles()

  const productUrls: MetadataRoute.Sitemap = handles.map((handle) => ({
    url: `${SITE_URL}/product/${handle}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/terms-of-service`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/shipping-and-returns`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/shipping-policy`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/refund-policy`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ]

  return [...staticPages, ...productUrls]
}
