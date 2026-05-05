import { revalidateTag, revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const WEBHOOK_SECRET = process.env.MEDUSA_WEBHOOK_SECRET

const EXPIRE_NOW = { expire: 0 }

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret")
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const event = body.event
    const handle = body.data?.handle

    //console.log(`[Medusa Webhook] event=${event} handle=${handle || "n/a"}`)

    revalidateTag("products", EXPIRE_NOW)

    if (handle) {
      revalidateTag(`product-${handle}`, EXPIRE_NOW)
      revalidatePath(`/product-page/${handle}`)
    }

    revalidatePath("/products")
    revalidatePath("/")

    return NextResponse.json({
      revalidated: true,
      event,
      handle: handle || null,
      timestamp: Date.now(),
    })
  } catch (err) {
    console.error("[Medusa Webhook] Error:", err)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}
