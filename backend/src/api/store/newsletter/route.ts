import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { email } = req.body as { email?: string }

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" })
  }

  const normalized = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return res.status(400).json({ error: "Invalid email address" })
  }

  try {
    const pgConnection = req.scope.resolve(
      ContainerRegistrationKeys.PG_CONNECTION
    )

    // Create table if it doesn't exist
    await pgConnection.raw(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        source VARCHAR(50) DEFAULT 'popup'
      )
    `)

    // Insert subscriber (ignore if already exists)
    const result = await pgConnection.raw(
      `INSERT INTO newsletter_subscribers (email, source)
       VALUES (?, ?)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [normalized, "popup"]
    )

    const isNew = result?.rows?.length > 0

    return res.json({ success: true, isNew })
  } catch (error: any) {
    // Error details returned in response; no console.error needed
    return res.status(500).json({ error: "Failed to save subscriber" })
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const pgConnection = req.scope.resolve(
      ContainerRegistrationKeys.PG_CONNECTION
    )

    const result = await pgConnection.raw(
      `SELECT email, subscribed_at, source
       FROM newsletter_subscribers
       ORDER BY subscribed_at DESC`
    )

    return res.json({
      subscribers: result?.rows || [],
      total: result?.rows?.length || 0,
    })
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch subscribers" })
  }
}
