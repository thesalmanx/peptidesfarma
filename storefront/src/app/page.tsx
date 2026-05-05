import Link from "next/link"
import { getFeaturedProducts } from "@/lib/data"
import HomepageClient from "@/components/sections/HomepageClient"

export const revalidate = 3600

export default async function HomePage() {
  const products = await getFeaturedProducts()
  return <HomepageClient products={products} />
}
