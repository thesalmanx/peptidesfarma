import { storyblokEditable } from "@storyblok/react/rsc"

interface DisclaimerBlok {
  text?: string
  _uid: string
  component: string
  [key: string]: any
}

export default function DisclaimerBlock({ blok }: { blok: DisclaimerBlok }) {
  return (
    <section
      {...storyblokEditable(blok)}
      className="py-8 max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20"
    >
      <div className="rounded-[12px] bg-[#F9FAFB] p-6 text-center">
        <p className="text-[13px] leading-[20px] text-[#9CA3AF]">
          {blok.text ||
            "Disclaimer: All products sold by Peptidesfarma are intended for laboratory research use only. They are not intended for human consumption or any clinical, therapeutic, or diagnostic use. By purchasing, you agree to use these products solely for legitimate research purposes."}
        </p>
      </div>
    </section>
  )
}
