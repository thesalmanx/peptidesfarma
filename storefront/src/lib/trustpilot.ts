export interface TrustpilotReview {
  id: string
  author: string
  rating: number
  title: string
  body: string
  date: string
}

export async function getTrustpilotReviews(): Promise<TrustpilotReview[]> {
  // In the future, this could fetch from Trustpilot API
  // For now, return saved reviews from local data
  const reviews = await import("@/data/trustpilot-reviews.json")
  return reviews.default as TrustpilotReview[]
}
