"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface TrackingEvent {
  status: string
  status_details: string
  status_date: string
  location: string | null
}

interface TrackingData {
  tracking_number: string
  carrier: string
  tracking_status: string | null
  tracking_status_details: string | null
  tracking_history: TrackingEvent[]
  eta: string | null
  tracking_url: string
}

const trackingSteps = [
  { label: "Order placed", key: "placed" },
  { label: "Packing", key: "packing" },
  { label: "Shipped", key: "shipped" },
  { label: "Delivered", key: "delivered" },
]

function mapShippoStatusToStep(status: string | null): number {
  if (!status) return 0
  const upper = status.toUpperCase()
  if (upper === "DELIVERED") return 3
  if (upper === "TRANSIT") return 2
  if (upper === "PRE_TRANSIT") return 1
  return 0
}

export default function TrackingPage() {
  const params = useParams()
  const trackingNumber = params.trackingNumber as string
  const [data, setData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!trackingNumber) return

    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

    fetch(`${backendUrl}/store/tracking/${trackingNumber}`, {
      headers: {
        "x-publishable-api-key": publishableKey,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch tracking info")
        return res.json()
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [trackingNumber])

  const currentStep = data ? mapShippoStatusToStep(data.tracking_status) : 0

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[720px] mx-auto px-4 py-8 lg:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#4F8AF7] hover:underline mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to store
        </Link>

        <h1 className="text-[24px] lg:text-[28px] leading-[36px] font-semibold text-[#242424] mb-2">
          Track your shipment
        </h1>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F8AF7]" />
          </div>
        ) : error || !data ? (
          <div className="border border-[#E0E0E0] rounded-[24px] p-8 text-center mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-[#242424]/30 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25m0 0V5.625m0 8.625h12.75m0 0V5.625m0 8.625a1.125 1.125 0 0 1-1.125 1.125H5.25a1.125 1.125 0 0 1-1.125-1.125" />
            </svg>
            <p className="text-[16px] font-semibold text-[#242424] mb-1">
              Tracking information unavailable
            </p>
            <p className="text-[14px] text-[#242424]/72 mb-4">
              We couldn&apos;t find tracking details for <span className="font-mono font-medium">{trackingNumber}</span>. It may take a few hours for tracking to become available.
            </p>
            <a
              href={`https://www.ups.com/track?tracknum=${trackingNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#4F8AF7] hover:underline"
            >
              Try on carrier website
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        ) : (
          <>
            <div className="border border-[#E0E0E0] rounded-[24px] p-5 mb-6 mt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-[14px] text-[#242424]/72 font-normal">Tracking Number</p>
                  <p className="text-[18px] font-semibold text-[#242424] font-mono tracking-wide">
                    {data.tracking_number}
                  </p>
                </div>
                <div className="ml-auto">
                  <p className="text-[14px] text-[#242424]/72 font-normal">Carrier</p>
                  <p className="text-[16px] font-semibold text-[#242424] capitalize">
                    {data.carrier || "Shippo"}
                  </p>
                </div>
              </div>
              {data.eta && (
                <p className="text-[13px] text-[#4F8AF7] font-medium mt-2">
                  Estimated delivery: {new Date(data.eta).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-[18px] lg:text-[20px] leading-[28px] font-semibold text-[#242424] mb-6">
                Shipment status
              </h2>

              <div className="flex items-center w-full h-[64px]">
                {trackingSteps.map((step, i) => {
                  const isCompleted = i < currentStep
                  const isCurrent = i === currentStep
                  const isFuture = i > currentStep
                  const isLast = i === trackingSteps.length - 1
                  const lineCompleted = i < currentStep

                  return (
                    <div key={step.key} className="contents">
                      <div
                        className="flex items-center gap-4 py-2 px-3 rounded-[14px] shrink-0"
                        style={{ minHeight: 64 }}
                      >
                        {isCompleted ? (
                          <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[40px] h-[40px] shrink-0">
                            <g filter="url(#filter_track_completed)">
                              <circle cx="32" cy="22" r="20" fill="url(#grad_track_completed)" />
                            </g>
                            <path d="M40.3008 16L29.3008 27L24.3008 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                              <filter id="filter_track_completed" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                <feMorphology radius="2" operator="erode" in="SourceAlpha" result="effect1" />
                                <feOffset dy="4" />
                                <feGaussianBlur stdDeviation="3" />
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1" />
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect2" />
                                <feOffset dy="10" />
                                <feGaussianBlur stdDeviation="7.5" />
                                <feColorMatrix type="matrix" values="0 0 0 0 0.0647744 0 0 0 0 0.360647 0 0 0 0 0.434615 0 0 0 0.2 0" />
                                <feBlend mode="normal" in2="effect1" result="effect2" />
                                <feBlend mode="normal" in="SourceGraphic" in2="effect2" result="shape" />
                              </filter>
                              <linearGradient id="grad_track_completed" x1="14.3" y1="22" x2="46.7" y2="22" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#14213D" />
                                <stop offset="0.5" stopColor="#2A4A8C" />
                                <stop offset="1" stopColor="#4F8AF7" />
                              </linearGradient>
                            </defs>
                          </svg>
                        ) : (
                          <div
                            className="w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0"
                            style={{
                              border: `2px solid ${isCurrent ? "#4F8AF7" : "#71717A"}`,
                              opacity: isFuture ? 0.5 : 1,
                            }}
                          >
                            <span
                              className="text-[18px] leading-[28px] font-semibold"
                              style={{ color: isCurrent ? "#4F8AF7" : "#71717A" }}
                            >
                              {i + 1}
                            </span>
                          </div>
                        )}

                        <span
                          className="text-[18px] leading-[28px] font-medium whitespace-nowrap"
                          style={{
                            color: isFuture ? "#71717A" : "#000000",
                            opacity: isFuture ? 0.5 : 1,
                          }}
                        >
                          {step.label}
                        </span>
                      </div>

                      {!isLast && (
                        <div
                          className="flex-1 h-0"
                          style={{
                            borderTop: `2px solid ${lineCompleted ? "#4F8AF7" : "#E4E4E7"}`,
                            minWidth: 20,
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              {data.tracking_status_details && (
                <p className="text-[14px] text-[#242424]/72 mt-3">
                  {data.tracking_status_details}
                </p>
              )}
            </div>

            {data.tracking_history.length > 0 && (
              <div className="border border-[#E0E0E0] rounded-[24px] p-5 mb-6">
                <h2 className="text-[18px] lg:text-[20px] leading-[28px] font-semibold text-[#242424] mb-4">
                  Tracking history
                </h2>
                <div className="space-y-0">
                  {data.tracking_history.map((event, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 mt-1"
                          style={{
                            background: i === 0
                              ? "linear-gradient(90deg, #14213D, #2A4A8C, #4F8AF7)"
                              : "#E4E4E7",
                          }}
                        />
                        {i < data.tracking_history.length - 1 && (
                          <div className="w-px flex-1 bg-[#E4E4E7] min-h-[24px]" />
                        )}
                      </div>

                      <div className="pb-4">
                        <p className="text-[14px] font-semibold text-[#242424]">
                          {event.status_details || event.status}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          {event.status_date && (
                            <span className="text-[12px] text-[#242424]/60">
                              {new Date(event.status_date).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {event.location && (
                            <span className="text-[12px] text-[#242424]/60">
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <a
              href={data.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#4F8AF7] hover:underline"
            >
              View on {data.carrier || "carrier"} website
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </>
        )}
      </div>
    </div>
  )
}
