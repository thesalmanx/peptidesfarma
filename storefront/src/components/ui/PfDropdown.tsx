"use client"

import { useState, useRef, useEffect } from "react"

interface PfDropdownOption {
  value: string
  label: string
}

interface PfDropdownProps {
  value: string
  onChange: (value: string) => void
  options: PfDropdownOption[]
  placeholder?: string
  direction?: "down" | "up"
}

export default function PfDropdown({ value, onChange, options, placeholder, direction = "down" }: PfDropdownProps) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handleClose()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleOpen = () => {
    setOpen(true)
    requestAnimationFrame(() => setVisible(true))
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => setOpen(false), 180)
  }

  const handleToggle = () => {
    if (open) handleClose()
    else handleOpen()
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={handleToggle}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          border: open ? "2px solid var(--pf-ink)" : "2px solid var(--pf-ink)",
          borderRadius: 10,
          background: "#fff",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--pf-ink)",
          cursor: "pointer",
          whiteSpace: "nowrap",
          height: 44,
          transition: "border-color 0.2s ease",
        }}
      >
        {selected?.label || placeholder || "Select"}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--pf-ink)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "transform 0.2s ease", transform: open ? "rotate(180deg)" : "rotate(0)" }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            ...(direction === "up" ? { bottom: "calc(100% + 8px)" } : { top: "calc(100% + 8px)" }),
            right: 0,
            minWidth: "100%",
            background: "#fff",
            border: "1px solid var(--pf-line)",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
            zIndex: 100,
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translateY(0) scale(1)"
              : direction === "up"
                ? "translateY(8px) scale(0.97)"
                : "translateY(-8px) scale(0.97)",
            transition: "opacity 180ms ease, transform 180ms ease",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); handleClose() }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: opt.value === value ? "rgba(0, 28, 134, 0.06)" : "transparent",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: opt.value === value ? 600 : 400,
                color: opt.value === value ? "var(--pf-blue)" : "var(--pf-ink)",
                cursor: "pointer",
                textAlign: "left",
                whiteSpace: "nowrap",
                transition: "background 0.12s ease",
              }}
              onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = "rgba(0, 28, 134, 0.03)" }}
              onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.background = "transparent" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
