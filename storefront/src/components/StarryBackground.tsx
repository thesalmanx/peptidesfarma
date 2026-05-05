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
  fillStyle: string
}

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let animId = 0
    let cachedGradient: CanvasGradient | null = null

    const rand = seededRandom(42)

    const particles: Particle[] = []
    const starSize = () => rand() < 0.15 ? rand() * 1.0 + 1.8 : 1

    // Match product hero: 120 particles (50 + 45 + 25) with fast movers
    for (let i = 0; i < 50; i++) {
      const isFast = rand() < 0.2
      const alpha = rand() * 0.28 + 0.12
      particles.push({
        x: rand(),
        y: rand(),
        alpha,
        speed: isFast ? rand() * 0.0008 + 0.0006 : rand() * 0.00045 + 0.00018,
        size: starSize(),
        fillStyle: `rgba(255,255,255,${alpha})`,
      })
    }
    for (let i = 0; i < 45; i++) {
      const isFast = rand() < 0.15
      const alpha = rand() * 0.3 + 0.1
      particles.push({
        x: rand(),
        y: 0.45 + rand() * 0.55,
        alpha,
        speed: isFast ? rand() * 0.0007 + 0.0005 : rand() * 0.0004 + 0.00015,
        size: starSize(),
        fillStyle: `rgba(255,255,255,${alpha})`,
      })
    }
    for (let i = 0; i < 25; i++) {
      const isFast = rand() < 0.2
      const alpha = rand() * 0.25 + 0.12
      particles.push({
        x: rand(),
        y: 0.7 + rand() * 0.3,
        alpha,
        speed: isFast ? rand() * 0.0007 + 0.0005 : rand() * 0.00035 + 0.00015,
        size: starSize(),
        fillStyle: `rgba(255,255,255,${alpha})`,
      })
    }

    function buildGradient() {
      if (!ctx) return
      cachedGradient = ctx.createLinearGradient(0, 0, 0, h)
      cachedGradient.addColorStop(0, "#071D2B")
      cachedGradient.addColorStop(0.25, "#164B6E")
      cachedGradient.addColorStop(0.5, "#267090")
      cachedGradient.addColorStop(0.75, "#3A8DB0")
      cachedGradient.addColorStop(1, "#2E7089")
    }

    let resizeTimer: ReturnType<typeof setTimeout>
    function resize() {
      if (!canvas) return
      w = window.innerWidth * dpr
      h = window.innerHeight * dpr
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      buildGradient()
    }

    function frame() {
      if (!canvas || !ctx) return

      if (cachedGradient) {
        ctx.fillStyle = cachedGradient
      }
      ctx.fillRect(0, 0, w, h)

      const baseRadius = 1.2 * dpr

      for (const p of particles) {
        p.y -= p.speed
        if (p.y < -0.01) {
          p.y = 1.01
          p.x = rand()
        }
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, baseRadius * p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.fillStyle
        ctx.fill()
      }

      animId = requestAnimationFrame(frame)
    }

    resize()
    animId = requestAnimationFrame(frame)

    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 150)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
