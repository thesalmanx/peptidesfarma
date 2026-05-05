"use client"

import { useEffect, useRef } from "react"

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

interface Particle {
  x: number
  y: number
  alpha: number
  speed: number
  size: number
}

export default function ProductStarryHero({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let w = 0
    let h = 0
    let animId = 0

    const rand = seededRandom(42)

    const particles: Particle[] = []
    const starSize = () => rand() < 0.15 ? rand() * 1.0 + 1.8 : 1

    for (let i = 0; i < 50; i++) {
      const isFast = rand() < 0.2
      particles.push({
        x: rand(),
        y: rand(),
        alpha: rand() * 0.28 + 0.12,
        speed: isFast
          ? rand() * 0.0008 + 0.0006
          : rand() * 0.00045 + 0.00018,
        size: starSize(),
      })
    }
    for (let i = 0; i < 45; i++) {
      const isFast = rand() < 0.15
      particles.push({
        x: rand(),
        y: 0.45 + rand() * 0.55,
        alpha: rand() * 0.3 + 0.1,
        speed: isFast
          ? rand() * 0.0007 + 0.0005
          : rand() * 0.0004 + 0.00015,
        size: starSize(),
      })
    }
    for (let i = 0; i < 25; i++) {
      const isFast = rand() < 0.2
      particles.push({
        x: rand(),
        y: 0.7 + rand() * 0.3,
        alpha: rand() * 0.25 + 0.12,
        speed: isFast
          ? rand() * 0.0007 + 0.0005
          : rand() * 0.00035 + 0.00015,
        size: starSize(),
      })
    }

    function resize() {
      if (!canvas || !container) return
      const rect = container.getBoundingClientRect()
      w = rect.width * dpr
      h = rect.height * dpr
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    function frame() {
      if (!canvas || !ctx) return

      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, "#0C2840")
      sky.addColorStop(0.2, "#164B6E")
      sky.addColorStop(0.4, "#1E5F85")
      sky.addColorStop(0.55, "#267090")
      sky.addColorStop(0.68, "#3A8DB0")
      sky.addColorStop(0.78, "#4FA4C4")
      sky.addColorStop(0.86, "#7EC4D6")
      sky.addColorStop(0.92, "#B0DDE8")
      sky.addColorStop(0.96, "#D6EDF3")
      sky.addColorStop(1, "#FFFFFF")
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      const baseRadius = 1.2 * dpr

      for (const p of particles) {
        p.y -= p.speed
        if (p.y < -0.01) {
          p.y = 1.01
          p.x = rand()
        }

        const bottomFade = p.y > 0.80 ? 1 - (p.y - 0.80) / 0.20 : 1
        const finalAlpha = p.alpha * bottomFade

        if (finalAlpha > 0.01) {
          ctx.beginPath()
          ctx.arc(p.x * w, p.y * h, baseRadius * p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`
          ctx.fill()
        }
      }

      animId = requestAnimationFrame(frame)
    }

    resize()
    animId = requestAnimationFrame(frame)

    const onResize = () => resize()
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative overflow-hidden product-starry-hero">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}
