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
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          border: "1px solid var(--pf-line)",
          borderRadius: 999,
          background: "#fff",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--pf-ink)",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "border-color 0.18s ease",
          ...(open ? { borderColor: "var(--pf-blue)" } : {}),
        }}
      >
        {selected?.label || placeholder || "Select"}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--pf-text-3)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "transform 0.18s ease", transform: open ? "rotate(180deg)" : "rotate(0)" }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            ...(direction === "up" ? { bottom: "calc(100% + 6px)" } : { top: "calc(100% + 6px)" }),
            right: 0,
            minWidth: "100%",
            background: "#fff",
            border: "1px solid var(--pf-line)",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
            overflow: "hidden",
            zIndex: 100,
            animation: "pf-fade 150ms ease",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
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
