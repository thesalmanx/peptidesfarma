// POST /store/klaviyo/viewed-product
// Storefront calls this when an identified user views a product page.
// Fires Klaviyo "Viewed Product" event → triggers Browse Abandonment flow.
//
// Body:
//   {
//     email: string,            // required — visitor's email (from auth or stored cookie)
//     first_name?: string,
//     last_name?: string,
//     product_id: string,       // required
//     product_name: string,     // required
//     variant_id?: string,
//     variant_name?: string,
//     sku?: string,
//     price?: number,
//     currency?: string,
//     url: string,              // required — full product page URL
//     image_url?: string,
//   }

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { fireViewedProduct } from "../../../../utils/klaviyo-events"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = (req.body || {}) as any
  const { email, product_id, product_name, url } = body

  if (!email || !product_id || !product_name || !url) {
    res.status(400).json({ error: "email, product_id, product_name, and url are required" })
    return
  }

  const logger = req.scope.resolve("logger")

  try {
    await fireViewedProduct(logger, {
      profile: {
        email,
        first_name: body.first_name || undefined,
        last_name: body.last_name || undefined,
      },
      productId: String(product_id),
      productName: String(product_name),
      variantId: body.variant_id ? String(body.variant_id) : undefined,
      variantName: body.variant_name ? String(body.variant_name) : undefined,
      sku: body.sku ? String(body.sku) : undefined,
      price: body.price != null ? Number(body.price) : undefined,
      currency: body.currency ? String(body.currency) : undefined,
      url: String(url),
      imageUrl: body.image_url ? String(body.image_url) : undefined,
    })

    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fire viewed product event" })
  }
}
