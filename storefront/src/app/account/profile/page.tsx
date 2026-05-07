"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { sdk } from "@/lib/medusa"
import Link from "next/link"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

function resizeImage(file: File, maxSize: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement("img")
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = maxSize
        canvas.height = maxSize
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("Canvas not supported"))

        const size = Math.min(img.width, img.height)
        const sx = (img.width - size) / 2
        const sy = (img.height - size) / 2
        ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize)

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Failed to process image"))
            resolve(blob)
          },
          "image/jpeg",
          quality
        )
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

export default function ProfilePage() {
  const { customer, refreshCustomer } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const metadata = (customer?.metadata as Record<string, unknown>) || {}
  const profileImage = metadata.profile_image as string | undefined
  const profileImageFileId = metadata.profile_image_file_id as string | undefined

  const [form, setForm] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    phone: customer?.phone || "",
    company_name: (customer as unknown as Record<string, unknown>)?.company_name as string || "",
    city: (metadata.city as string) || "",
    date_of_birth: (metadata.date_of_birth as string) || "",
    bio: (metadata.bio as string) || "",
  })

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new_password: "",
    confirm: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      setError("Please upload a JPG, PNG, GIF, or WebP image.")
      return
    }

    setError("")
    setSuccess("")
    setUploading(true)

    try {
      const blob = await resizeImage(file, 400, 0.85)

      const token = await sdk.client.getToken()
      const authHeaders: Record<string, string> = {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      }
      if (token) authHeaders["Authorization"] = `Bearer ${token}`

      const formData = new FormData()
      formData.append("file", blob, `profile-${Date.now()}.jpg`)

      const response = await fetch(`${BACKEND_URL}/store/customers/me/profile-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: authHeaders,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || "Upload failed")
      }

      const { url, file_id } = await response.json()

      if (profileImageFileId) {
        fetch(`${BACKEND_URL}/store/customers/me/profile-image`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ file_id: profileImageFileId }),
        }).catch(() => {})
      }

      await sdk.store.customer.update({
        metadata: { ...metadata, profile_image: url, profile_image_file_id: file_id },
      } as Record<string, unknown>)

      await refreshCustomer()
      setSuccess("Photo updated successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemovePhoto = async () => {
    setError("")
    setSuccess("")
    setUploading(true)
    try {
      if (profileImageFileId) {
        const token = await sdk.client.getToken()
        const authHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
        }
        if (token) authHeaders["Authorization"] = `Bearer ${token}`

        await fetch(`${BACKEND_URL}/store/customers/me/profile-image`, {
          method: "DELETE",
          credentials: "include",
          headers: authHeaders,
          body: JSON.stringify({ file_id: profileImageFileId }),
        })
      }

      await sdk.store.customer.update({
        metadata: { ...metadata, profile_image: null, profile_image_file_id: null },
      } as Record<string, unknown>)

      await refreshCustomer()
      setSuccess("Photo removed")
    } catch {
      setError("Failed to remove photo.")
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = () => {
    setForm({
      first_name: customer?.first_name || "",
      last_name: customer?.last_name || "",
      phone: customer?.phone || "",
      company_name: (customer as unknown as Record<string, unknown>)?.company_name as string || "",
      city: (metadata.city as string) || "",
      date_of_birth: (metadata.date_of_birth as string) || "",
      bio: (metadata.bio as string) || "",
    })
    setPasswordForm({ current: "", new_password: "", confirm: "" })
    setPasswordError("")
    setPasswordSuccess("")
    setEditing(true)
    setError("")
    setSuccess("")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      await sdk.store.customer.update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || undefined,
        company_name: form.company_name || undefined,
        metadata: {
          ...metadata,
          city: form.city || null,
          date_of_birth: form.date_of_birth || null,
          bio: form.bio || null,
        },
      } as Record<string, unknown>)
      await refreshCustomer()
      setEditing(false)
      setSuccess("Profile updated successfully")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile"
      )
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError("")
    setPasswordSuccess("")

    if (passwordForm.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters")
      return
    }
    if (passwordForm.new_password !== passwordForm.confirm) {
      setPasswordError("Passwords do not match")
      return
    }

    setSavingPassword(true)
    try {
      await sdk.auth.login("customer", "emailpass", {
        email: customer?.email,
        password: passwordForm.current,
      })

      await sdk.auth.resetPassword("customer", "emailpass", {
        identifier: customer?.email || "",
      })

      setPasswordSuccess("A password reset link has been sent to your email. Use it to set your new password.")
      setPasswordForm({ current: "", new_password: "", confirm: "" })
    } catch {
      setPasswordError("Current password is incorrect")
    } finally {
      setSavingPassword(false)
    }
  }

  const fullName = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "-"
  const initials = `${customer?.first_name?.[0]?.toUpperCase() || ""}${customer?.last_name?.[0]?.toUpperCase() || ""}`

  return (
    <div className="w-full max-w-[1280px] flex flex-col gap-4">
      <div className="flex items-center gap-1 text-[14px] font-medium leading-[22px] tracking-[0.02em] text-[var(--pf-ink)]">
        <Link href="/" className="hover:underline">Home</Link>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.67} stroke="currentColor" className="w-3.5 h-3.5 -rotate-90">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
        <span>Account</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.67} stroke="currentColor" className="w-3.5 h-3.5 -rotate-90">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
        <span>My profile</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
        <div className="flex flex-col gap-1 flex-1">
          <h1 className="text-[20px] lg:text-[24px] font-semibold leading-[30px] lg:leading-[36px] tracking-[-0.03em] text-[var(--pf-ink)]">
            My Profile
          </h1>
          <p className="text-[12px] lg:text-[14px] font-medium leading-[18px] lg:leading-[22px] tracking-[-0.02em] text-[var(--pf-text-2)]">
            Manage your personal information.
          </p>
        </div>
        {!editing && (
          <button
            onClick={handleEdit}
            className="inline-flex items-center justify-center self-stretch lg:self-start px-5 py-3 h-[48px] rounded-[110px] text-[16px] font-medium lg:font-bold leading-[24px] tracking-[-0.01em] text-[var(--pf-ink)] bg-[var(--pf-blue-tint)]"
          >
            Edit profile
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-[14px]">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-[12px] bg-green-50 border border-green-200 text-green-700 text-[14px]">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-[30px]">
        <div className="flex items-center gap-5">
          <div className="w-[120px] h-[120px] rounded-full border border-[var(--pf-line)] p-[3px] shrink-0">
            {profileImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border border-[var(--pf-line)]"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[var(--pf-blue)] border border-[var(--pf-line)] flex items-center justify-center text-white text-[36px] font-semibold">
                {initials || "U"}
              </div>
            )}
          </div>
          {editing && (
            <div className="flex flex-col gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center justify-center px-4 py-2 h-[40px] rounded-[110px] border border-black/[0.24] text-[14px] font-medium leading-[24px] tracking-[-0.01em] text-[var(--pf-ink)] bg-white self-start disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Change photo"}
                </button>
                {profileImage && !uploading && (
                  <button
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center justify-center px-4 py-2 h-[40px] rounded-[110px] text-[14px] font-medium leading-[24px] tracking-[-0.01em] text-red-500 hover:bg-red-50 transition self-start"
                  >
                    Remove
                  </button>
                )}
              </div>
              <span className="text-[14px] font-normal leading-[20px] tracking-[-0.02em] text-[var(--pf-text-2)]">
                JPG, GIF, PNG or WebP. Max 10MB.
              </span>
            </div>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-semibold leading-[22px] text-[var(--pf-ink)]">Full name</label>
              <input
                type="text"
                value={`${form.first_name}${form.last_name ? ` ${form.last_name}` : ""}`}
                onChange={(e) => {
                  const parts = e.target.value.split(" ")
                  updateField("first_name", parts[0] || "")
                  updateField("last_name", parts.slice(1).join(" "))
                }}
                required
                className="w-full h-[48px] px-4 py-3 rounded-[16px] bg-[var(--pf-paper)] border border-[var(--pf-line)] text-[16px] font-normal leading-[24px] text-[var(--pf-ink)] placeholder:text-[var(--pf-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-blue)] focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-semibold leading-[22px] text-[var(--pf-ink)]">Email</label>
              <input
                type="email"
                value={customer?.email || ""}
                disabled
                className="w-full h-[48px] px-4 py-3 rounded-[16px] bg-[var(--pf-paper)] border border-[var(--pf-line)] text-[16px] font-normal leading-[24px] text-[var(--pf-ink)]/50 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-semibold leading-[22px] text-[var(--pf-ink)]">Phone number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="Enter your phone number"
                className="w-full h-[48px] px-4 py-3 rounded-[16px] bg-[var(--pf-paper)] border border-[var(--pf-line)] text-[16px] font-normal leading-[24px] text-[var(--pf-ink)] placeholder:text-[var(--pf-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-blue)] focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-semibold leading-[22px] text-[var(--pf-ink)]">Company</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => updateField("company_name", e.target.value)}
                placeholder="Enter your company"
                className="w-full h-[48px] px-4 py-3 rounded-[16px] bg-[var(--pf-paper)] border border-[var(--pf-line)] text-[16px] font-normal leading-[24px] text-[var(--pf-ink)] placeholder:text-[var(--pf-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-blue)] focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-semibold leading-[22px] text-[var(--pf-ink)]">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Enter your city"
                className="w-full h-[48px] px-4 py-3 rounded-[16px] bg-[var(--pf-paper)] border border-[var(--pf-line)] text-[16px] font-normal leading-[24px] text-[var(--pf-ink)] placeholder:text-[var(--pf-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-blue)] focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-semibold leading-[22px] text-[var(--pf-ink)]">Date of Birth</label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => updateField("date_of_birth", e.target.value)}
                className="w-full h-[48px] px-4 py-3 rounded-[16px] bg-[var(--pf-paper)] border border-[var(--pf-line)] text-[16px] font-normal leading-[24px] text-[var(--pf-ink)] placeholder:text-[var(--pf-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-blue)] focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-semibold leading-[22px] text-[var(--pf-ink)]">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Tell us about yourself"
                rows={3}
                className="w-full px-4 py-3 rounded-[16px] bg-[var(--pf-paper)] border border-[var(--pf-line)] text-[16px] font-normal leading-[24px] text-[var(--pf-ink)] placeholder:text-[var(--pf-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-blue)] focus:border-transparent resize-none"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-[var(--pf-line)]">
              <h3 className="text-[16px] font-semibold leading-[24px] text-[var(--pf-ink)]">Change Password</h3>
              {passwordError && (
                <p className="text-red-600 text-[14px]">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-green-600 text-[14px]">{passwordSuccess}</p>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-semibold leading-[22px] text-[var(--pf-ink)]">Current password</label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                  placeholder="Enter current password"
                  className="w-full h-[48px] px-4 py-3 rounded-[16px] bg-[var(--pf-paper)] border border-[var(--pf-line)] text-[16px] font-normal leading-[24px] text-[var(--pf-ink)] placeholder:text-[var(--pf-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-blue)] focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-semibold leading-[22px] text-[var(--pf-ink)]">New password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                  placeholder="Enter new password"
                  className="w-full h-[48px] px-4 py-3 rounded-[16px] bg-[var(--pf-paper)] border border-[var(--pf-line)] text-[16px] font-normal leading-[24px] text-[var(--pf-ink)] placeholder:text-[var(--pf-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-blue)] focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-semibold leading-[22px] text-[var(--pf-ink)]">Confirm new password</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                  className="w-full h-[48px] px-4 py-3 rounded-[16px] bg-[var(--pf-paper)] border border-[var(--pf-line)] text-[16px] font-normal leading-[24px] text-[var(--pf-ink)] placeholder:text-[var(--pf-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-blue)] focus:border-transparent"
                />
              </div>
              <button
                type="button"
                disabled={savingPassword || !passwordForm.current || !passwordForm.new_password}
                onClick={handlePasswordChange}
                className="self-start h-[40px] px-5 rounded-[110px] text-[14px] font-medium text-[var(--pf-ink)] bg-[var(--pf-blue-tint)] hover:opacity-80 transition disabled:opacity-50"
              >
                {savingPassword ? "Updating..." : "Update password"}
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setEditing(false); setError("") }}
                className="flex-1 lg:flex-none h-[48px] px-6 rounded-[110px] text-[16px] font-medium text-[var(--pf-ink)] bg-[var(--pf-paper)] hover:bg-[var(--pf-blue-tint)] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 lg:flex-none h-[48px] px-6 rounded-[110px] text-[16px] font-bold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-5">
            <ProfileField label="Full Name" value={fullName} />
            <ProfileField label="Email" value={customer?.email || "-"} />
            <ProfileField label="Phone Number" value={customer?.phone || "-"} />
            <ProfileField label="Company" value={(customer as unknown as Record<string, unknown>)?.company_name as string || "-"} />
            <ProfileField label="City" value={(metadata.city as string) || "-"} />
            <ProfileField label="Password" value="••••••••" />
            <ProfileField label="Date of Birth" value={(metadata.date_of_birth as string) || "-"} />
            <ProfileField label="Bio" value={(metadata.bio as string) || "-"} />
          </div>
        )}
      </div>

    </div>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[2px]">
      <span className="text-[12px] lg:text-[14px] font-normal leading-[18px] lg:leading-[20px] tracking-[-0.02em] text-[var(--pf-text-2)]">
        {label}
      </span>
      <span className="text-[14px] lg:text-[16px] font-semibold leading-[22px] lg:leading-[24px] tracking-[-0.01em] text-[var(--pf-ink)]">
        {value}
      </span>
    </div>
  )
}
