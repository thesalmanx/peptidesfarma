import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import jwt from "jsonwebtoken"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { email, auth_identity_id } = req.body as {
    email?: string
    auth_identity_id?: string
  }

  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }

  const logger = req.scope.resolve("logger")

  try {
    const query = req.scope.resolve("query")
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    // Find customer by email
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "email"],
      filters: { email },
    })

    if (!customers || customers.length === 0) {
      return res.status(404).json({ error: "No customer found" })
    }

    const customerId = customers[0].id
    logger.info(`Auth link: Customer ${customerId} for ${email}`)

    let linked = false

    if (auth_identity_id) {
      try {
        const result = await pgConnection.raw(
          `UPDATE auth_identity
           SET app_metadata = jsonb_set(
             COALESCE(app_metadata, '{}'),
             '{actor_id}',
             ?::jsonb
           ),
           updated_at = NOW()
           WHERE id = ?
           RETURNING id, app_metadata`,
          [JSON.stringify(customerId), auth_identity_id]
        )

        if (result?.rows?.length > 0) {
          logger.info(`Auth link: Linked! ${JSON.stringify(result.rows[0])}`)
          linked = true
        }
      } catch (err: any) {
        logger.error(`Auth link SQL error: ${err.message}`)
      }
    }

    // Generate a new JWT token with the actor_id included
    // This is the key fix — the refresh endpoint doesn't re-read the DB
    let newToken = ""
    if (linked && auth_identity_id) {
      try {
        const jwtSecret = process.env.JWT_SECRET || "supersecret"
        newToken = jwt.sign(
          {
            actor_id: customerId,
            actor_type: "customer",
            auth_identity_id: auth_identity_id,
            app_metadata: { actor_id: customerId },
          },
          jwtSecret,
          { expiresIn: "7d" }
        )
        logger.info(`Auth link: Generated new token for ${customerId}`)
      } catch (err: any) {
        logger.error(`Auth link JWT error: ${err.message}`)
      }
    }

    return res.json({
      success: true,
      customer_id: customerId,
      linked,
      token: newToken || undefined,
    })
  } catch (error: any) {
    logger.error(`Auth link error: ${error.message}`)
    return res.status(500).json({ error: "Failed to link account" })
  }
}
