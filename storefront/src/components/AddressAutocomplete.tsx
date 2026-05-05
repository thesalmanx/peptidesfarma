"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (address: {
    address_1: string
    city: string
    province: string
    postal_code: string
    country_code: string
  }) => void
  placeholder?: string
  className?: string
  countryCode?: string
}

let googleLoaded = false
let googleLoadPromise: Promise<void> | null = null

function loadGoogleMaps(): Promise<void> {
  if (googleLoaded && (window as any).google?.maps?.places) return Promise.resolve()
  if (googleLoadPromise) return googleLoadPromise

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.warn("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set — address autocomplete disabled")
    return Promise.reject(new Error("No API key"))
  }

  googleLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.onload = () => {
      googleLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error("Failed to load Google Maps"))
    document.head.appendChild(script)
  })

  return googleLoadPromise
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing your address...",
  className = "",
  countryCode = "us",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setReady(true))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return

    const google = (window as any).google
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: countryCode },
      fields: ["address_components", "formatted_address"],
    })

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      if (!place.address_components) return

      const get = (type: string) =>
        place.address_components?.find((c: any) => c.types.includes(type))

      const streetNumber = get("street_number")?.long_name || ""
      const route = get("route")?.long_name || ""
      const city =
        get("locality")?.long_name ||
        get("sublocality_level_1")?.long_name ||
        get("administrative_area_level_2")?.long_name ||
        ""
      const state = get("administrative_area_level_1")?.short_name || ""
      const postalCode = get("postal_code")?.long_name || ""
      const country = (get("country")?.short_name || "us").toLowerCase()

      const address1 = [streetNumber, route].filter(Boolean).join(" ")

      onChange(address1)
      onSelect({
        address_1: address1,
        city,
        province: state,
        postal_code: postalCode,
        country_code: country,
      })
    })

    autocompleteRef.current = autocomplete
  }, [ready, countryCode, onChange, onSelect])

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className={className}
    />
  )
}
