"use client"

import { useEffect, useRef, useState } from "react"
import { storyblokEditable, type SbBlokData } from "@storyblok/react"

interface StatItem extends SbBlokData {
  value: string
  unit: string
  label: string
  description: string
  percentage: string
}

interface StatsGridBlok extends SbBlokData {
  stats?: StatItem[]
}

function DonutChart({ percentage, animate }: { percentage: number; animate: boolean }) {
  const size = 144
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const trackLength = circumference * 0.75
  const gapLength = circumference * 0.25
  const filledLength = animate ? (percentage / 100) * trackLength : 0
  const remainingLength = circumference - filledLength

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#DDE9FF"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${trackLength} ${gapLength}`}
        style={{ transform: "rotate(135deg)", transformOrigin: "center" }}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#4F8AF7"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${filledLength} ${remainingLength}`}
        style={{
          transform: "rotate(135deg)",
          transformOrigin: "center",
          transition: "stroke-dasharray 1.2s ease-out",
        }}
      />
    </svg>
  )
}

export default function StatsGridBlock({ blok }: { blok: StatsGridBlok }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [animate, setAnimate] = useState(false)
  const stats = blok.stats || []

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="bg-white px-5 py-4 md:px-20 md:py-6" {...storyblokEditable(blok)}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5 mx-auto max-w-[1280px]">
        {stats.map((stat, i) => {
          const pct = parseInt(stat.percentage, 10) || 0
          return (
            <div
              key={stat._uid || i}
              className="card-hover flex flex-col items-start p-4 md:p-6 gap-3 rounded-[24px] md:h-[256px]"
              style={{
                background: "linear-gradient(95.01deg, rgba(79, 138, 247, 0.08) 16.35%, rgba(122, 162, 255, 0.08) 68.78%), #FFFFFF",
                border: "2px solid rgba(79, 138, 247, 0.08)",
              }}
            >
              <div className="relative w-[72px] h-[72px] md:w-[144px] md:h-[144px]">
                <DonutChart percentage={pct} animate={animate} />
                <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                  <span className="text-[16px] leading-[16px] md:text-[32px] md:leading-[32px] font-bold tracking-[-0.8px] text-[#14213D]">
                    {stat.value}
                  </span>
                  <span className="text-[9px] leading-[14px] md:text-[18px] md:leading-[28px] font-medium tracking-[-0.8px] text-[#14213D]">
                    {stat.unit}
                  </span>
                </div>
              </div>

              <span className="text-[12px] leading-[16px] font-semibold uppercase tracking-[0.6px] text-[#14213D]">
                {stat.label}
              </span>

              <span className="text-[14px] leading-[19px] font-normal text-[#4A5568]">
                {stat.description}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
