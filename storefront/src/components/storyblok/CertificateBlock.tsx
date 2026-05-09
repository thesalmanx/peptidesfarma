import { storyblokEditable } from "@storyblok/react/rsc"

interface CertificateBlok {
  title?: string
  subtitle?: string
  description?: string
  image?: { filename: string; alt?: string }
  _uid: string
  component: string
  [key: string]: any
}

export default function CertificateBlock({ blok }: { blok: CertificateBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-12 md:py-16 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {blok.image?.filename && (
          <div className="w-full md:w-1/2">
            <img
              src={blok.image.filename}
              alt={blok.image.alt || blok.title || "Certificate of Analysis"}
              className="w-full rounded-[16px] shadow-lg"
            />
          </div>
        )}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#141414] tracking-[-0.02em]">
            {blok.title || "Certificate of Analysis"}
          </h2>
          {blok.subtitle && (
            <p className="text-lg text-[#4F8AF7] font-semibold">{blok.subtitle}</p>
          )}
          <p className="text-[15px] leading-[24px] text-[#4A5568]">
            {blok.description ||
              "Every product ships with a certificate of analysis verifying purity, identity, and potency through independent third-party testing."}
          </p>
        </div>
      </div>
    </section>
  )
}
