"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import ProductCard from "./ProductCard"

interface Product {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  variants: Array<{
    id: string
    calculated_price?: {
      calculated_amount: number
      currency_code: string
    }
  }>
}

export default function ProductSlider({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef({ startX: 0, scrollLeft: 0, moved: false })

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => observer.disconnect()
  }, [updateScrollState, products.length])

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" })
  }

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current
    if (!el) return
    setIsDragging(true)
    dragState.current = { startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const el = scrollRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = x - dragState.current.startX
    if (Math.abs(walk) > 3) dragState.current.moved = true
    el.scrollLeft = dragState.current.scrollLeft - walk
  }

  const onMouseUp = () => {
    setIsDragging(false)
  }

  const fadeLeft = "transparent 0%, rgba(0,0,0,0.15) 3%, rgba(0,0,0,0.5) 6%, rgba(0,0,0,0.85) 10%, black 14%"
  const fadeRight = "black 86%, rgba(0,0,0,0.85) 90%, rgba(0,0,0,0.5) 94%, rgba(0,0,0,0.15) 97%, transparent 100%"

  const maskImage = canScrollLeft && canScrollRight
    ? `linear-gradient(to right, ${fadeLeft}, ${fadeRight})`
    : canScrollRight
      ? `linear-gradient(to right, black 0%, ${fadeRight})`
      : canScrollLeft
        ? `linear-gradient(to right, ${fadeLeft}, black 100%)`
        : "none"

  if (products.length === 0) return null

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className={`flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0 w-[calc(50%-8px)] md:w-[calc(25%-12px)] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-0 top-[35%] -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10 focus-visible:ring-2 focus-visible:ring-[#4F8AF7]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#141414" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-0 top-[35%] -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10 focus-visible:ring-2 focus-visible:ring-[#4F8AF7]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#141414" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  )
}
