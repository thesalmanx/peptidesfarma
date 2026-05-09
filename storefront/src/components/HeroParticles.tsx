"use client"

import { useEffect, useRef } from "react"

export default function HeroParticles() {
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

    function seededRandom(seed: number) {
      let s = seed
      return () => {
        s = (s * 16807 + 0) % 2147483647
        return s / 2147483647
      }
    }

    const rand = seededRandom(77)

    interface Dot {
      x: number
      y: number
      alpha: number
      speed: number
      size: number
      drift: number
    }

    const dots: Dot[] = []

    // 180 particles with variable speeds
    for (let i = 0; i < 180; i++) {
      const isFast = rand() < 0.25
      const isSlow = rand() < 0.3
      dots.push({
        x: rand(),
        y: rand(),
        alpha: rand() * 0.4 + 0.06,
        speed: isFast ? rand() * 0.0008 + 0.0005 : isSlow ? rand() * 0.00012 + 0.00005 : rand() * 0.0004 + 0.00015,
        size: rand() < 0.15 ? rand() * 1.8 + 1.5 : rand() * 1.0 + 0.5,
        drift: (rand() - 0.5) * 0.0002,
      })
    }

    function resize() {
      if (!canvas) return
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      w = rect.width * dpr
      h = rect.height * dpr
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    function frame() {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)

      for (const d of dots) {
        d.y -= d.speed
        d.x += d.drift
        if (d.y < -0.02) { d.y = 1.02; d.x = rand() }
        if (d.x < -0.02) d.x = 1.02
        if (d.x > 1.02) d.x = -0.02

        ctx.beginPath()
        ctx.arc(d.x * w, d.y * h, d.size * dpr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(79, 138, 247, ${d.alpha})`
        ctx.fill()
      }

      animId = requestAnimationFrame(frame)
    }

    resize()
    animId = requestAnimationFrame(frame)

    let resizeTimer: ReturnType<typeof setTimeout>
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
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
