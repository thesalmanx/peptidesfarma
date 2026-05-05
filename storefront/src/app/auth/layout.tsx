import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in to your Peptidesfarma account to manage orders, track shipments, and access your research peptide purchases.",
  robots: { index: false, follow: false },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-104px)] lg:min-h-0 lg:h-[calc(100vh-128px)]">
      <div className="hidden lg:block relative w-[45%] shrink-0 bg-black overflow-hidden">
        <Image
          src="/images/auth-vial.jpg"
          alt="Peptidesfarma research-grade peptide vial"
          fill
          className="object-cover"
          sizes="45vw"
          priority
        />
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 py-8 lg:px-10 lg:py-6 bg-white overflow-y-auto">
        <div className="w-full max-w-[480px] mx-auto lg:mx-0">
          {children}
        </div>
      </div>
    </div>
  )
}
