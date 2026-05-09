"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { Suspense, useEffect } from "react"
import { GA_MEASUREMENT_ID, trackPageView } from "@/lib/gtag"

function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  return null
}

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  )
}
