import { storyblokEditable } from "@storyblok/react/rsc"

interface Testimonial {
  name?: string
  role?: string
  text?: string
  rating?: number
  _uid: string
}

interface TestimonialsSectionBlok {
  title?: string
  testimonials?: Testimonial[]
  _uid: string
  component: string
  [key: string]: any
}

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#FBBF24">
          <path d="M8 1.5l1.85 3.75 4.15.6-3 2.93.71 4.12L8 10.77 4.29 12.9l.71-4.12-3-2.93 4.15-.6L8 1.5z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsSectionBlock({ blok }: { blok: TestimonialsSectionBlok }) {
  const testimonials = blok.testimonials || []

  return (
    <section
      {...storyblokEditable(blok)}
      className="py-16 md:py-20"
      style={{ background: "#FAFAFA" }}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-6 lg:px-20">
        <h2 className="text-2xl md:text-3xl font-bold text-[#141414] tracking-[-0.02em] mb-10 text-center">
          {blok.title || "What Researchers Say"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t._uid}
              className="flex flex-col p-6 rounded-[16px] bg-white"
              style={{ border: "1px solid rgba(0, 0, 0, 0.06)" }}
            >
              <StarRating count={t.rating || 5} />
              <p className="mt-4 text-[15px] leading-[24px] text-[#4A5568] flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
                <p className="font-semibold text-[14px] text-[#141414]">{t.name}</p>
                {t.role && (
                  <p className="text-[13px] text-[#9CA3AF]">{t.role}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
