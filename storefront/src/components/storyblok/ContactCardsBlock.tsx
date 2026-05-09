import Image from "next/image"
import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc"

interface ContactCardItem {
  _uid?: string
  component?: string
  icon_name?: string
  title?: string
  description?: string
  link_text?: string
  link_url?: string
}

interface ContactCardsBlok extends SbBlokData {
  cards?: ContactCardItem[]
}

const iconMap: Record<string, string> = {
  email: "/icons/mail-01.svg",
  headset: "/icons/headset.svg",
  phone: "/icons/call-02.svg",
}

const defaults: ContactCardItem[] = [
  { icon_name: "email", title: "Support", description: "Our friendly team is here to help.", link_text: "support@peptidesfarma.com", link_url: "mailto:support@peptidesfarma.com" },
  { icon_name: "headset", title: "Sales", description: "Questions or queries? Get in touch!", link_text: "sales@peptidesfarma.com", link_url: "mailto:sales@peptidesfarma.com" },
  { icon_name: "phone", title: "Phone", description: "Mon-Fri from 8am to 5pm.", link_text: "+1 (555) 000-0000", link_url: "tel:+15550000000" },
]

export default function ContactCardsBlock({ blok }: { blok: ContactCardsBlok }) {
  const items = blok.cards?.length ? blok.cards : defaults
  const cards = items.map((item, i) => ({
    icon: iconMap[item.icon_name || ""] || Object.values(iconMap)[i] || "/icons/mail-01.svg",
    title: item.title || defaults[i]?.title || "Contact",
    description: item.description || defaults[i]?.description || "",
    linkText: item.link_text || defaults[i]?.link_text || "",
    linkUrl: item.link_url || defaults[i]?.link_url || "#",
  }))

  return (
    <section className="py-10 px-4 lg:px-20 bg-white" {...storyblokEditable(blok)}>
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row" style={{ gap: "16px" }}>
        {cards.map((card, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-start"
            style={{
              padding: "24px",
              gap: "12px",
              background:
                "linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF",
              borderRadius: "24px",
              minHeight: "212px",
            }}
          >
            <div className="flex flex-col items-start" style={{ gap: "12px" }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: "48px",
                  height: "48px",
                  padding: "8px",
                  background:
                    "linear-gradient(95.01deg, rgba(79, 138, 247, 0.16) 16.35%, rgba(122, 162, 255, 0.16) 68.78%)",
                  borderRadius: "12px",
                }}
              >
                <Image src={card.icon} alt="" width={32} height={32} />
              </div>

              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "24px",
                  lineHeight: "32px",
                  letterSpacing: "-0.02em",
                  color: "#14213D",
                }}
              >
                {card.title}
              </h3>

              <p
                style={{
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "#44516B",
                }}
              >
                {card.description}
              </p>
            </div>

            <a
              href={card.linkUrl}
              style={{
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                letterSpacing: "-0.02em",
                color: "#4F8AF7",
              }}
            >
              {card.linkText}
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
