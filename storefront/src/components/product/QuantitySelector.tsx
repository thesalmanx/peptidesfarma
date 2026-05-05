"use client"

interface QuantitySelectorProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
}

export default function QuantitySelector({ quantity, onQuantityChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-2 h-10">
      <button
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
        className="w-7 h-7 flex items-center justify-center border border-white rounded-lg"
        aria-label="Decrease quantity"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <line x1="3.33" y1="8" x2="12.67" y2="8" stroke="white" strokeWidth="1.67" strokeLinecap="round" />
        </svg>
      </button>

      <span className="w-[33px] h-10 flex items-center justify-center font-semibold text-[18px] leading-7 text-white text-center">
        {quantity}
      </span>

      <button
        onClick={() => onQuantityChange(quantity + 1)}
        className="w-7 h-7 flex items-center justify-center border border-white rounded-lg"
        aria-label="Increase quantity"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <line x1="3.33" y1="8" x2="12.67" y2="8" stroke="white" strokeWidth="1.67" strokeLinecap="round" />
          <line x1="8" y1="3.33" x2="8" y2="12.67" stroke="white" strokeWidth="1.67" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
