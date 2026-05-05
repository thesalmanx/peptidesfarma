import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getCarrierTrackingUrl, getCarrierName } from "../../../../utils/carrier-tracking-url"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const trackingNumber = req.params.tracking_number

  if (!trackingNumber) {
    return res.status(400).json({ message: "Tracking number is required" })
  }

  const apiKey = process.env.SHIPPO_API_KEY
  if (!apiKey) {
    return res.status(500).json({ message: "Shippo API key not configured" })
  }

  try {
    const response = await fetch(
      `https://api.goshippo.com/tracks/shippo/${trackingNumber}`,
      {
        headers: {
          Authorization: `ShippoToken ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      return res.status(response.status).json({
        message: `Shippo tracking error: ${errorBody}`,
      })
    }

    const data = await response.json()

    const carrier = data.carrier || ""
    const resolvedCarrier = getCarrierName(trackingNumber, carrier)

    return res.json({
      tracking_number: data.tracking_number || trackingNumber,
      carrier: resolvedCarrier,
      tracking_status: data.tracking_status?.status || null,
      tracking_status_details: data.tracking_status?.status_details || null,
      tracking_history: (data.tracking_history || []).map((event: any) => ({
        status: event.status,
        status_details: event.status_details,
        status_date: event.status_date,
        location: event.location
          ? `${event.location.city || ""}${event.location.state ? ", " + event.location.state : ""}${event.location.country ? " " + event.location.country : ""}`.trim()
          : null,
      })),
      eta: data.eta || null,
      tracking_url: getCarrierTrackingUrl(trackingNumber, carrier),
    })
  } catch (error: any) {
    return res.status(500).json({
      message: `Failed to fetch tracking info: ${error.message}`,
    })
  }
}
