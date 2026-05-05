"use client"

import { useState } from "react"
import SearchOverlay from "./SearchOverlay"

export default function SearchButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Search"
        className="hover:opacity-80 transition-opacity cursor-pointer"
      >
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <path
            d="M22.667 22.6667L28.0003 28"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25.3333 14.6667C25.3333 8.77563 20.5577 4 14.6667 4C8.77563 4 4 8.77563 4 14.6667C4 20.5577 8.77563 25.3333 14.6667 25.3333C20.5577 25.3333 25.3333 20.5577 25.3333 14.6667Z"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && <SearchOverlay onClose={() => setIsOpen(false)} />}
    </>
  )
}
