import { storyblokEditable } from "@storyblok/react/rsc"

interface ResearchNoticeBlok {
  text?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function ResearchNoticeBlock({ blok }: { blok: ResearchNoticeBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-8 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <div
        className="rounded-[16px] p-6 text-center"
        style={{
          background: "rgba(79, 138, 247, 0.04)",
          border: "1px solid rgba(79, 138, 247, 0.1)",
        }}
      >
        <p className="text-[14px] leading-[22px] text-[#6B7280]">
          {blok.text ||
            "All products are strictly for laboratory research use only. Not for human consumption. By purchasing, you agree to use these products solely for legitimate research purposes."}
        </p>
      </div>
    </section>
  )
}
