"use client"

import { storyblokEditable } from "@storyblok/react/rsc"
import type { SbBlokData } from "@storyblok/react/rsc"
import Image from "next/image"
import { useEffect, useRef, useCallback, useState } from "react"

interface Testimonial {
  _uid?: string
  component?: string
  quote: string
  author: string
  role?: string
  rating?: string
  avatar?: { filename: string; alt?: string } | string
}

interface TestimonialsSectionBlok extends SbBlokData {
  heading?: string
  heading_highlight?: string
  testimonials?: Testimonial[]
}

const AVATAR_COLORS = [
  "linear-gradient(135deg, #4F8AF7 0%, #7AA2FF 100%)",
  "linear-gradient(135deg, #1B2A4A 0%, #3D5AAF 100%)",
  "linear-gradient(135deg, #4F8AF7 0%, #7AA2FF 100%)",
  "linear-gradient(135deg, #1B2A4A 0%, #7AA2FF 100%)",
  "linear-gradient(135deg, #7AA2FF 0%, #4F8AF7 100%)",
  "linear-gradient(135deg, #3D5AAF 0%, #4F8AF7 100%)",
]

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}

function FiveStars() {
  return (
    <div className="flex gap-[3px]">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#F5A623" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  const hasImage =
    (typeof testimonial.avatar === "object" && testimonial.avatar?.filename) ||
    (typeof testimonial.avatar === "string" && testimonial.avatar)

  return (
    <div
      className="card-hover-border flex flex-col justify-between p-5 sm:p-6 w-[320px] sm:w-[440px] lg:w-[580px] h-[156px] shrink-0 rounded-[24px] cursor-default"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      }}
    >
      <p className="text-[14px] sm:text-[16px] font-normal leading-[150%] tracking-[-0.01em] line-clamp-2 text-white/80">
        {testimonial.quote}
      </p>
      <FiveStars />
      <div className="flex items-center gap-3">
        {hasImage ? (
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
            <Image
              src={
                typeof testimonial.avatar === "object" && testimonial.avatar?.filename
                  ? testimonial.avatar.filename
                  : (testimonial.avatar as string)
              }
              alt={testimonial.author}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
            style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
          >
            <span className="text-[12px] font-bold text-white leading-none">
              {getInitials(testimonial.author)}
            </span>
          </div>
        )}
        <p className="m-0 text-[14px] sm:text-[16px] font-semibold leading-6 tracking-[-0.02em] text-[#7AA2FF]">
          @{testimonial.author}
        </p>
      </div>
    </div>
  )
}

function MarqueeRow({ items, direction, speed }: { items: Testimonial[]; direction: "left" | "right"; speed: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const posRef = useRef<number>(0)
  const setWidthRef = useRef<number>(0)
  const pausedRef = useRef(false)
  const itemCount = items.length

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const firstSet = track.children[0] as HTMLElement
    if (firstSet) {
      setWidthRef.current = firstSet.offsetWidth
    }
  }, [])

  useEffect(() => {
    if (itemCount === 0) return

    measure()
    window.addEventListener("resize", measure)

    posRef.current = 0
    let lastTime = 0

    const animate = (time: number) => {
      if (lastTime === 0) lastTime = time
      const delta = time - lastTime
      lastTime = time

      if (!pausedRef.current && setWidthRef.current > 0) {
        const pxPerMs = speed / 16.667
        const move = pxPerMs * delta

        if (direction === "left") {
          posRef.current -= move
          if (posRef.current <= -setWidthRef.current) {
            posRef.current += setWidthRef.current
          }
        } else {
          posRef.current += move
          if (posRef.current >= 0) {
            posRef.current -= setWidthRef.current
          }
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`
        }
      } else {
        lastTime = time
      }
      animRef.current = requestAnimationFrame(animate)
    }

    if (direction === "right") {
      requestAnimationFrame(() => {
        measure()
        posRef.current = -setWidthRef.current
      })
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", measure)
    }
  }, [direction, speed, measure, itemCount])

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div
        ref={trackRef}
        className="flex will-change-transform"
        style={{ backfaceVisibility: "hidden" }}
      >
        {[0, 1, 2, 3].map((setIdx) => (
          <div key={setIdx} className="flex gap-3 md:gap-6 shrink-0 pr-3 md:pr-6">
            {items.map((t, i) => (
              <TestimonialCard key={`${setIdx}-${i}`} testimonial={t} index={i} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TestimonialsSectionBlock({ blok }: { blok: TestimonialsSectionBlok }) {
  const heading = blok.heading || "What people say about"
  const headingHighlight = blok.heading_highlight || "our products"
  const storyblokTestimonials = blok.testimonials || []
  const [liveReviews, setLiveReviews] = useState<Testimonial[]>([])

  useEffect(() => {
    if (storyblokTestimonials.length > 0) return
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((reviews: { name: string; stars: number; text: string; title: string }[]) => {
        setLiveReviews(
          reviews
            .filter((r) => r.stars === 5 && r.text.length > 20)
            .map((r) => ({
              quote: r.text.replace(/\n/g, " ").trim(),
              author: r.name,
              rating: "5",
            }))
        )
      })
      .catch(() => {})
  }, [storyblokTestimonials.length])

  const testimonials = storyblokTestimonials.length > 0 ? storyblokTestimonials : liveReviews

  const half = Math.ceil(testimonials.length / 2)
  const row1 = testimonials.slice(0, half)
  const row2 = testimonials.slice(half)

  return (
    <section
      {...storyblokEditable(blok)}
      className="relative py-5 lg:py-6 overflow-hidden"
    >
      <div className="flex flex-col items-center px-4 lg:px-20 mb-6 max-w-[1280px] mx-auto">
        <h2 className="text-3xl md:text-[48px] font-bold md:leading-[56px] tracking-[-0.03em] text-white text-center max-w-[666px]">
          {heading}{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #4F8AF7 0%, #7AA2FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {headingHighlight}
            </span>
        </h2>
      </div>

      {testimonials.length > 0 && (
        <div className="flex flex-col gap-3 md:gap-6 max-w-[1280px] mx-auto">
          <MarqueeRow items={row1} direction="left" speed={1.2} />
          <MarqueeRow items={row2} direction="right" speed={1.2} />
        </div>
      )}
    </section>
  )
}
