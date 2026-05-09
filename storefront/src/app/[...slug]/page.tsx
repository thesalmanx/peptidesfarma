import { getStoryblokApi } from "@/lib/storyblok"
import { StoryblokStory } from "@storyblok/react/rsc"
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import type { ISbResult } from "@storyblok/react/rsc"
import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

interface PageProps {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function fetchStory(slug: string[]) {
  const path = slug.length ? slug.join("/") : "home"

  if (
    path.startsWith("products") ||
    path.startsWith("product") ||
    path.startsWith("auth") ||
    path.startsWith("account") ||
    path.startsWith("cart") ||
    path.startsWith("checkout")
  ) {
    return Promise.resolve(null)
  }

  return unstable_cache(
    async () => {
      // Try Storyblok SDK (EU region) first, then fall back to global API
      try {
        const storyblokApi = getStoryblokApi()
        const response: ISbResult = await storyblokApi.get(`cdn/stories/${path}`, {
          version: "draft",
        })
        return response.data
      } catch {
        // Fallback: direct fetch to global Storyblok API if EU fails
        try {
          const token = process.env.NEXT_PUBLIC_STORYBLOK_TOKEN
          const res = await fetch(
            `https://api.storyblok.com/v2/cdn/stories/${path}?version=draft&token=${token}`,
            { cache: "no-store" }
          )
          if (res.ok) return await res.json()
        } catch {
          // Both failed
        }
        return null
      }
    },
    ["storyblok-story-v5", path],
    { revalidate: 3600, tags: ["storyblok", `storyblok-${path}`] }
  )()
}

// Titles should NOT include "| Peptidesfarma" -- the root layout template appends it automatically.
// Exception: homepage uses { absolute: title } to bypass the template.
const PAGE_SEO: Record<string, { title: string; description: string }> = {
  home: {
    title: "Peptidesfarma | Research-Grade Peptides, Verified Before They Ship",
    description:
      "Peptidesfarma offers high-purity research peptides and compounds for laboratory use. 99%+ purity, same-day shipping, certificates of analysis included.",
  },
  contact: {
    title: "Contact Us",
    description:
      "Get in touch with Peptidesfarma. We are available for questions about our research peptides, orders, and laboratory compounds.",
  },
  about: {
    title: "About Peptidesfarma | Research-Grade Peptides",
    description:
      "Learn about Peptidesfarma, our commitment to 99%+ purity research peptides, quality control processes, and dedication to advancing laboratory research.",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    description:
      "Learn how Peptidesfarma collects, uses, and protects your personal information. Read our full privacy policy.",
  },
  "terms-of-service": {
    title: "Terms of Service",
    description:
      "Read the Terms of Service for Peptidesfarma. Understand your rights and obligations when using our website and purchasing research peptides.",
  },
  "shipping-and-returns": {
    title: "Shipping & Returns",
    description:
      "Learn about Peptidesfarma shipping options, delivery times, secure packaging, return policy, and refund process for research peptides.",
  },
  faq: {
    title: "FAQ | Frequently Asked Questions",
    description:
      "Find answers to common questions about Peptidesfarma research peptides, ordering, shipping, returns, storage, and more.",
  },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const path = slug.length ? slug.join("/") : "home"
  const data = await fetchStory(slug)

  if (!data?.story) {
    return {
      title: "Page Not Found",
      robots: { index: false, follow: false },
    }
  }

  const story = data.story
  const content = story.content || {}

  const pageSeo = PAGE_SEO[path]
  // Strip trailing "| Peptidesfarma" from CMS titles to avoid duplication with layout template
  const rawTitle = content.seo_title || pageSeo?.title || story.name
  const title = (path !== "home" && typeof rawTitle === "string")
    ? rawTitle.replace(/\s*\|\s*Peptidesfarma\s*$/i, "")
    : rawTitle
  const description =
    content.seo_description || pageSeo?.description || content.subtitle || ""
  const ogImage = content.og_image?.filename || `${SITE_URL}/icons/peptidesfarma-logo.png`
  const canonical = `${SITE_URL}${slug.length ? `/${slug.join("/")}` : ""}`

  return {
    title: path === "home" ? { absolute: title } : title,
    description: description || undefined,
    openGraph: {
      title,
      description: description || undefined,
      url: canonical,
      siteName: "Peptidesfarma",
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || undefined,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    alternates: { canonical },
  }
}

export const revalidate = 3600

function getStructuredData(path: string, title: string, description: string, canonical: string) {
  const schemas: Record<string, unknown>[] = []

  if (path === "home") {
    schemas.push({
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
    })
  } else {
    // BreadcrumbList for all non-home pages
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: title, item: canonical },
      ],
    })
  }

  // Page-type specific schemas
  if (path === "contact") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: title,
      description,
      url: canonical,
      mainEntity: {
        "@type": "Organization",
        name: "Peptidesfarma",
        email: "support@peptidesfarma.com",
      },
    })
  } else if (path === "about") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: title,
      description,
      url: canonical,
      mainEntity: {
        "@type": "Organization",
        name: "Peptidesfarma",
        url: SITE_URL,
      },
    })
  } else if (["privacy-policy", "terms-of-service", "shipping-and-returns"].includes(path)) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: "Peptidesfarma", url: SITE_URL },
    })
  }

  return schemas
}

export default async function StoryblokPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  const isInsideEditor = typeof sp._storyblok !== "undefined"

  const data = await fetchStory(slug)

  if (!data?.story) {
    notFound()
  }

  const path = slug.length ? slug.join("/") : "home"
  const pageSeo = PAGE_SEO[path]
  const story = data.story
  const content = story.content || {}
  const title = content.seo_title || pageSeo?.title || story.name || "Peptidesfarma"
  const description = content.seo_description || pageSeo?.description || content.subtitle || ""
  const canonical = `${SITE_URL}${slug.length ? `/${slug.join("/")}` : ""}`

  const schemas = getStructuredData(path, title, description, canonical)

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <StoryblokStory
        story={data.story}
        bridgeOptions={{
          resolveRelations: [],
        }}
      />
    </>
  )
}
