import { unstable_cache } from "next/cache"

export interface TrustpilotReview {
  name: string
  stars: number
  title: string
  text: string
  date: string
}

async function scrapeReviews(): Promise<TrustpilotReview[]> {
  try {
    const res = await fetch("https://www.trustpilot.com/review/peptidesfarma.com", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 86400 },
    })

    if (!res.ok) return fallbackReviews()

    const html = await res.text()
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/
    )
    if (!match) return fallbackReviews()

    const data = JSON.parse(match[1])
    const reviews: unknown[] =
      data?.props?.pageProps?.reviews || []

    if (reviews.length === 0) return fallbackReviews()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return reviews.map((r: any) => ({
      name: r?.consumer?.displayName || "",
      stars: r?.rating || 5,
      title: r?.title || "",
      text: r?.text || "",
      date: r?.dates?.publishedDate || "",
    }))
  } catch {
    return fallbackReviews()
  }
}

function fallbackReviews(): TrustpilotReview[] {
  // Fallback to local data if Trustpilot scraping fails
  try {
    // Dynamic import doesn't work in this context, return empty
    // The TrustBadges component handles the empty case gracefully
    return []
  } catch {
    return []
  }
}

export const getTrustpilotReviews = unstable_cache(
  scrapeReviews,
  ["trustpilot-reviews-v1"],
  { revalidate: 86400, tags: ["trustpilot"] }
)
