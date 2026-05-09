import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"

interface CtaBannerBlok extends SbBlokData {
  heading?: string
  subtitle?: string
  primary_text?: string
  primary_url?: string
  secondary_text?: string
  secondary_url?: string
}

export default function CtaBannerBlock({ blok }: { blok: CtaBannerBlok }) {
  const heading = blok.heading || "Still have questions?"
  const subtitle =
    blok.subtitle ||
    "Can't find what you're looking for? Our support team is ready to help with any questions about your research needs."
  const primaryText = blok.primary_text || "Email support"
  const primaryUrl = blok.primary_url || "mailto:support@peptidesfarma.com"
  const secondaryText = blok.secondary_text || "Join community"
  const secondaryUrl = blok.secondary_url || "#"

  return (
    <section className="py-5 lg:py-8 px-4 md:px-20 bg-white" {...storyblokEditable(blok)}>
      <div
        className="w-full max-w-[720px] mx-auto flex flex-col justify-center items-center"
        style={{
          padding: "40px",
          gap: "20px",
          background:
            "linear-gradient(95.01deg, rgba(79, 138, 247, 0.16) 16.35%, rgba(122, 162, 255, 0.16) 68.78%), rgba(79, 138, 247, 0.08)",
          border: "1px solid rgba(79, 138, 247, 0.2)",
          borderRadius: "24px",
        }}
      >
        <h2
          style={{
            fontWeight: 600,
            fontSize: "48px",
            lineHeight: "56px",
            textAlign: "center",
            letterSpacing: "-0.8px",
            color: "#131315",
          }}
          className="text-[32px] leading-[40px] md:text-[48px] md:leading-[56px]"
        >
          {heading}
        </h2>

        <p
          style={{
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: "30px",
            textAlign: "center",
            color: "#383637",
          }}
        >
          {subtitle}
        </p>

        <div
          className="flex flex-row items-start"
          style={{ gap: "8px", width: "100%", maxWidth: "400px" }}
        >
          <a
            href={primaryUrl}
            className="btn-primary flex items-center justify-center hover:opacity-90 transition-opacity"
            style={{
              padding: "8px 24px",
              gap: "8px",
              height: "40px",
              flex: "1",
              borderRadius: "110px",
              fontWeight: 700,
              fontSize: "14px",
              lineHeight: "24px",
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
            }}
          >
            {primaryText}
          </a>
          <a
            href={secondaryUrl}
            className="flex items-center justify-center hover:opacity-90 transition-opacity"
            style={{
              padding: "8px 24px",
              gap: "8px",
              height: "40px",
              flex: "1",
              background: "#14213D",
              borderRadius: "110px",
              fontWeight: 700,
              fontSize: "14px",
              lineHeight: "24px",
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
            }}
          >
            {secondaryText}
          </a>
        </div>
      </div>
    </section>
  )
}
