import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

interface MulterFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const file = (req as AuthenticatedMedusaRequest & { file?: MulterFile }).file
  if (!file) {
    res.status(400).json({ message: "No file provided" })
    return
  }

  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    res.status(401).json({ message: "Not authenticated" })
    return
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.mimetype)) {
    res.status(400).json({ message: "Invalid file type. Use JPG, PNG, GIF, or WebP." })
    return
  }

  try {
    const fileModuleService = req.scope.resolve(Modules.FILE)
    const ext = file.originalname.split(".").pop() || "jpg"

    const uploadedFile = await fileModuleService.createFiles({
      filename: `profile-${customerId}-${Date.now()}.${ext}`,
      mimeType: file.mimetype,
      content: file.buffer.toString("base64"),
      access: "public",
    })

    res.json({ url: uploadedFile.url, file_id: uploadedFile.id })
  } catch (error) {
    console.error("Profile image upload error:", error)
    res.status(500).json({ message: "Failed to upload image" })
  }
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    res.status(401).json({ message: "Not authenticated" })
    return
  }

  const { file_id } = req.body as { file_id?: string }
  if (!file_id) {
    res.status(400).json({ message: "file_id is required" })
    return
  }

  try {
    const fileModuleService = req.scope.resolve(Modules.FILE)
    await fileModuleService.deleteFiles(file_id)
    res.json({ success: true })
  } catch (error) {
    console.error("Profile image delete error:", error)
    res.status(500).json({ message: "Failed to delete image" })
  }
}
