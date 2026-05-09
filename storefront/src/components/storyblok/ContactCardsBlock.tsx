import { storyblokEditable } from "@storyblok/react/rsc"

interface ContactCard {
  title?: string
  description?: string
  icon?: string
  link?: string
  _uid: string
}

interface ContactCardsBlok {
  cards?: ContactCard[]
  _uid: string
  component: string
  [key: string]: any
}

export default function ContactCardsBlock({ blok }: { blok: ContactCardsBlok }) {
  const defaultCards = [
    {
      title: "Email Us",
      description: "support@peptidesfarma.com",
      link: "mailto:support@peptidesfarma.com",
    },
    {
      title: "Live Chat",
      description: "Available Mon-Fri, 9am-5pm EST",
      link: "#",
    },
  ]

  const cards = blok.cards?.length
    ? blok.cards.map((c) => ({
        title: c.title || "",
        description: c.description || "",
        link: c.link || "#",
      }))
    : defaultCards

  return (
    <section
      {...storyblokEditable(blok)}
      className="py-12 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <a
            key={i}
            href={card.link}
            className="flex flex-col p-6 rounded-[16px] transition-all hover:shadow-md"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(79, 138, 247, 0.12)",
            }}
          >
            <h3 className="font-bold text-lg text-[#141414] mb-2">{card.title}</h3>
            <p className="text-[15px] text-[#4A5568]">{card.description}</p>
          </a>
        ))}
      </div>
    </section>
  )
}
