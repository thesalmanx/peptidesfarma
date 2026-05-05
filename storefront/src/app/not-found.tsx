import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for could not be found.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 bg-white">
      <h1
        className="text-[64px] md:text-[96px] font-bold leading-none tracking-tight"
        style={{
          background: "linear-gradient(90deg, #4F8AF7 0%, #36848E 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </h1>
      <h2
        className="mt-4 text-[24px] md:text-[32px] font-semibold text-[#242424]"
      >
        Page not found
      </h2>
      <p className="mt-2 text-[16px] text-[#595959] text-center max-w-[400px]">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 btn-primary inline-flex items-center justify-center rounded-[110px] h-12 px-8 text-base font-bold text-white hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </div>
  )
}
