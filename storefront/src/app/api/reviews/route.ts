import { NextResponse } from "next/server"
import savedReviews from "@/data/trustpilot-reviews.json"
import { getTrustpilotReviews } from "@/lib/trustpilot"

export const revalidate = 86400

export async function GET() {
  let reviews = savedReviews
  if (!reviews || reviews.length === 0) {
    const live = await getTrustpilotReviews()
    reviews = live.filter((r) => r.rating === 5 && r.body.length > 20)
  }
  return NextResponse.json(reviews, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
  })
}
