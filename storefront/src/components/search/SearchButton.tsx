"use client"

import { useState } from "react"
import SearchOverlay from "./SearchOverlay"

export default function SearchButton({ variant = "icon" }: { variant?: "icon" | "bar" }) {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === "bar") {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Search products"
          className="hover:border-[var(--pf-ink)] transition-colors cursor-pointer"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            width: "100%", height: 42,
            padding: "0 16px",
            border: "1px solid var(--pf-line)",
            borderRadius: 10,
            background: "#fff",
            fontFamily: "inherit",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--pf-text-3)"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
          <span style={{ fontSize: 14, color: "var(--pf-text-3)", opacity: 0.6 }}>Search products...</span>
        </button>
        {isOpen && <SearchOverlay onClose={() => setIsOpen(false)} />}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Search"
        className="hover:opacity-80 transition-opacity cursor-pointer"
        style={{ background: "none", border: "none", padding: 0 }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--pf-ink)"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
      </button>
      {isOpen && <SearchOverlay onClose={() => setIsOpen(false)} />}
    </>
  )
}
