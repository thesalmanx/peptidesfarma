"use client"

import { Fragment } from "react"

interface StepDef {
  key: string
  label: string
  description?: string
}

interface OrderStatusStepperProps {
  steps: StepDef[]
  /** Index of the currently active step. Steps before it are marked completed. */
  currentStep: number
  title?: string
  className?: string
}

export default function OrderStatusStepper({
  steps,
  currentStep,
  title = "Order Status",
  className,
}: OrderStatusStepperProps) {
  return (
    <div className={className}>
      <h2 className="text-[16px] md:text-[18px] leading-[24px] md:leading-[26px] font-semibold text-[#242424] mb-5">
        {title}
      </h2>

      <ol className="flex flex-col">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          // const isFuture = i > currentStep
          const isLast = i === steps.length - 1
          const lineCompleted = i < currentStep

          return (
            <Fragment key={step.key}>
              <li className="flex items-start gap-4">
                <div className="flex flex-col items-center self-stretch shrink-0">
                  {isCompleted ? (
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 64 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-[32px] h-[32px] shrink-0"
                      aria-hidden="true"
                    >
                      <circle cx="32" cy="22" r="20" fill="url(#step_grad_done)" />
                      <path
                        d="M40.3008 16L29.3008 27L24.3008 22"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient
                          id="step_grad_done"
                          x1="14.3"
                          y1="22"
                          x2="46.7"
                          y2="22"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#14213D" />
                          <stop offset="0.5" stopColor="#2A4A8C" />
                          <stop offset="1" stopColor="#4F8AF7" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ) : (
                    <div
                      className="w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 bg-white"
                      style={{
                        border: `2px solid ${isCurrent ? "#4F8AF7" : "#D1D5DB"}`,
                      }}
                      aria-hidden="true"
                    >
                      <span
                        className="text-[13px] leading-[18px] font-semibold"
                        style={{ color: isCurrent ? "#4F8AF7" : "#9CA3AF" }}
                      >
                        {i + 1}
                      </span>
                    </div>
                  )}

                  {!isLast && (
                    <div
                      className="flex-1 w-0 my-1"
                      style={{
                        borderLeft: `2px solid ${lineCompleted ? "#4F8AF7" : "#E4E4E7"}`,
                        minHeight: 24,
                      }}
                    />
                  )}
                </div>

                <div className={`flex-1 ${isLast ? "pb-1" : "pb-6"}`}>
                  <div
                    className="text-[15px] md:text-[16px] leading-[22px] md:leading-[24px]"
                    style={{
                      color: isCompleted ? "#4F8AF7" : isCurrent ? "#4F8AF7" : "#71717A",
                      fontWeight: isCompleted || isCurrent ? 600 : 500,
                    }}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] text-[#71717A] mt-0.5">
                      {step.description}
                    </div>
                  )}
                </div>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </div>
  )
}

export const ORDER_PLACED_STEPS: StepDef[] = [
  { key: "payment_confirmed", label: "Payment Confirmed" },
  { key: "order_received", label: "Order Received" },
  { key: "preparing_shipment", label: "Preparing Shipment" },
  { key: "tracking_email_sent", label: "Tracking Email Sent" },
]
