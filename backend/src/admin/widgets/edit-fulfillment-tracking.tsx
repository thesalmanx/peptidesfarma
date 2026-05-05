import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { Container, Heading } from "@medusajs/ui"
import { useState } from "react"

const WEBHOOK_SECRET = "A7oent3-dcptXo9YD2FIq-OqYAO6BsUqTN4N08endlk"

const EditFulfillmentTracking = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const meta = (data as any).metadata || {}
  const trackingFromMeta = meta.shippo_tracking_number || ""
  const urlFromMeta = meta.shippo_tracking_url || ""
  const carrierFromMeta = meta.shippo_carrier || ""

  const [editing, setEditing] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState(trackingFromMeta)
  const [trackingUrl, setTrackingUrl] = useState(urlFromMeta)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  const handleSave = async () => {
    setSaving(true)
    setMsg("")
    try {
      const res = await fetch("/hooks/update-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: data.id,
          tracking_number: trackingNumber,
          tracking_url: trackingUrl,
          secret: WEBHOOK_SECRET,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        setMsg("Saved!")
        setEditing(false)
      } else {
        setMsg(`Error: ${result?.error || res.status}`)
      }
    } catch (err: any) {
      setMsg(`Network error: ${err?.message || "unknown"}`)
    }
    setSaving(false)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Tracking Info</Heading>
        {!editing && (
          <button
            onClick={() => { setEditing(true); setMsg("") }}
            style={{ fontSize: 13, color: "#6B7280", cursor: "pointer", background: "none", border: "1px solid #D1D5DB", borderRadius: 6, padding: "4px 12px" }}
          >
            Edit
          </button>
        )}
      </div>
      <div className="px-6 py-4">
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Tracking Number</label>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. 1Z1733BW0304160688"
                style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid #D1D5DB", borderRadius: 6, outline: "none" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 4 }}>Tracking URL</label>
              <input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://www.ups.com/track?tracknum=..."
                style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid #D1D5DB", borderRadius: 6, outline: "none" }}
              />
            </div>
            {msg && <div style={{ fontSize: 12, color: msg.startsWith("Saved") ? "#16a34a" : "#dc2626" }}>{msg}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#6366f1", border: "none", borderRadius: 6, padding: "6px 16px", cursor: "pointer", opacity: saving ? 0.5 : 1 }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setMsg("") }}
                style={{ fontSize: 13, color: "#6B7280", background: "none", border: "1px solid #D1D5DB", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13 }}>
            {trackingFromMeta ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div><span style={{ color: "#6B7280" }}>Carrier: </span><span style={{ fontWeight: 500 }}>{carrierFromMeta || "—"}</span></div>
                <div><span style={{ color: "#6B7280" }}>Tracking: </span><span style={{ fontWeight: 500, fontFamily: "monospace" }}>{trackingFromMeta}</span></div>
                {urlFromMeta && (
                  <a href={urlFromMeta} target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", fontSize: 12, marginTop: 2 }}>
                    Track on carrier website →
                  </a>
                )}
              </div>
            ) : (
              <span style={{ color: "#9CA3AF" }}>No tracking info yet. Click Edit to add.</span>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default EditFulfillmentTracking
