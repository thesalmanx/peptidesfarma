import { getStoryblokApi } from "@/lib/storyblok"
import { StoryblokStory } from "@storyblok/react/rsc"
import { unstable_cache } from "next/cache"
import type { ISbResult } from "@storyblok/react/rsc"
import type { Metadata } from "next"
import { getFeaturedProducts } from "@/lib/data"
import HomepageClient from "@/components/sections/HomepageClient"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

export const revalidate = 3600

const fetchHomeStory = unstable_cache(
  async () => {
    try {
      const storyblokApi = getStoryblokApi()
      const response: ISbResult = await storyblokApi.get("cdn/stories/home", {
        version: "draft",
      })
      return response.data
    } catch {
      try {
        const token = process.env.NEXT_PUBLIC_STORYBLOK_TOKEN
        const res = await fetch(
          `https://api.storyblok.com/v2/cdn/stories/home?version=draft&token=${token}`,
          { cache: "no-store" }
        )
        if (res.ok) return await res.json()
      } catch {
        // Both failed
      }
      return null
    }
  },
  ["storyblok-story-v5", "home"],
  { revalidate: 3600, tags: ["storyblok", "storyblok-home"] }
)

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchHomeStory()
  const content = data?.story?.content || {}

  const title =
    content.seo_title ||
    "Peptidesfarma | Research-Grade Peptides, Verified Before They Ship"
  const description =
    content.seo_description ||
    "Peptidesfarma offers high-purity research peptides and compounds for laboratory use. 99%+ purity, same-day shipping, certificates of analysis included."
  const ogImage =
    content.og_image?.filename || `${SITE_URL}/icons/peptidesfarma-logo.png`

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: "Peptidesfarma",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: { canonical: SITE_URL },
  }
}

export default async function HomePage() {
  const data = await fetchHomeStory()

  // If Storyblok has the home story, render it via StoryblokStory (Visual Editor works)
  if (data?.story) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Peptidesfarma",
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <StoryblokStory
          story={data.story}
          bridgeOptions={{
            resolveRelations: [],
          }}
        />
      </>
    )
  }

  // Fallback: render the hardcoded homepage if Storyblok is unavailable
  const products = await getFeaturedProducts()
  return <HomepageClient products={products} />
}
