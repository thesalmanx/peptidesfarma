import { NextResponse } from "next/server"
import savedReviews from "@/data/trustpilot-reviews.json"
import { getTrustpilotReviews } from "@/lib/trustpilot"

export const revalidate = 86400

export async function GET() {
  let reviews = savedReviews
  if (!reviews || reviews.length === 0) {
    const live = await getTrustpilotReviews()
    // Map the scraper format (stars/text) to the API response format (rating/body)
    const mapped = live
      .filter((r) => r.stars === 5 && r.text.length > 20)
      .map((r) => ({
        id: `tp-${r.name.replace(/\s+/g, "-").toLowerCase()}-${r.date}`,
        author: r.name,
        rating: r.stars,
        title: r.title,
        body: r.text,
        date: r.date,
      }))
    return NextResponse.json(mapped, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
    })
  }
  return NextResponse.json(reviews, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
  })
}
