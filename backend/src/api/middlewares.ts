import { defineMiddlewares } from "@medusajs/framework/http"
import { authenticate } from "@medusajs/framework/http"
import multer from "multer"
import { syncVariantInventoryToKlaviyo } from "../utils/klaviyo-inventory-sync"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for profile images
})

// Middleware: after a successful inventory update, push the new inventory
// to Klaviyo. Triggers Klaviyo's "Back in Stock" flow when stock returns.
function klaviyoInventorySyncOnFinish(req: any, res: any, next: any) {
  res.on("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300) return
    const inventoryItemId = req.params?.id
    if (!inventoryItemId) return

    // Fire and forget — never block the admin response
    syncVariantInventoryToKlaviyo(req.scope, inventoryItemId).catch(() => {})
  })
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/*",
      bodyParser: { sizeLimit: "50mb" },
    },
    {
      matcher: "/store/*",
      bodyParser: { sizeLimit: "10mb" },
    },
    // ── Profile image upload ──
    {
      matcher: "/store/customers/me/profile-image",
      methods: ["POST"],
      bodyParser: false,
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        upload.single("file"),
      ],
    },
    {
      matcher: "/store/customers/me/profile-image",
      methods: ["DELETE"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
      ],
    },
    // ── Subscription endpoints: require customer auth ──
    {
      matcher: "/store/subscriptions",
      methods: ["GET", "POST"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
      ],
    },
    {
      matcher: "/store/subscriptions/:id/*",
      methods: ["POST"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
      ],
    },
    // ── Newsletter list: require admin auth ──
    {
      matcher: "/store/newsletter",
      methods: ["GET"],
      middlewares: [
        authenticate("user", ["session", "bearer"]),
      ],
    },
    // ── Subscriptions due: internal only (cron), verify secret header ──
    {
      matcher: "/store/subscriptions/due",
      methods: ["GET"],
      middlewares: [], // Handled by route-level secret check
    },
    // ── Klaviyo back-in-stock sync: fires after admin updates stock levels ──
    {
      matcher: "/admin/inventory-items/:id/location-levels/:slid",
      methods: ["POST", "PUT"],
      middlewares: [klaviyoInventorySyncOnFinish],
    },
    {
      matcher: "/admin/inventory-items/:id",
      methods: ["POST", "PUT"],
      middlewares: [klaviyoInventorySyncOnFinish],
    },
  ],
})
