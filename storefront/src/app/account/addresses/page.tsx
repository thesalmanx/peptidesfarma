"use client"

import { useEffect, useState, useCallback } from "react"
import { sdk } from "@/lib/medusa"
import Link from "next/link"

interface Address {
  id: string
  first_name: string | null
  last_name: string | null
  company: string | null
  address_1: string | null
  address_2: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country_code: string | null
  phone: string | null
  is_default_shipping: boolean
}

const emptyForm = {
  first_name: "",
  last_name: "",
  company: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "us",
  phone: "",
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const fetchAddresses = useCallback(async () => {
    try {
      const { addresses: addrs } = await sdk.store.customer.listAddress({
        limit: 50,
      })
      setAddresses(addrs as unknown as Address[])
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError("")
    setShowModal(true)
  }

  const openEdit = (addr: Address) => {
    setEditingId(addr.id)
    setForm({
      first_name: addr.first_name || "",
      last_name: addr.last_name || "",
      company: addr.company || "",
      address_1: addr.address_1 || "",
      address_2: addr.address_2 || "",
      city: addr.city || "",
      province: addr.province || "",
      postal_code: addr.postal_code || "",
      country_code: addr.country_code || "us",
      phone: addr.phone || "",
    })
    setError("")
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return
    try {
      await sdk.store.customer.deleteAddress(id)
      await fetchAddresses()
    } catch {
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      if (editingId) {
        await sdk.store.customer.updateAddress(editingId, form)
      } else {
        await sdk.store.customer.createAddress(form)
      }
      setShowModal(false)
      await fetchAddresses()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save address"
      )
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const formatAddress = (addr: Address) => {
    const parts = [addr.address_1, addr.address_2, addr.city, addr.province, addr.postal_code].filter(Boolean)
    return parts.join(", ")
  }

  return (
    <div className="w-full max-w-[1280px] flex flex-col gap-4">
      <div className="flex items-center gap-1 text-[14px] font-medium leading-[22px] tracking-[0.02em] text-[#242424]">
        <Link href="/" className="hover:underline">Home</Link>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.67} stroke="currentColor" className="w-3.5 h-3.5 -rotate-90">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
        <span>Account</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.67} stroke="currentColor" className="w-3.5 h-3.5 -rotate-90">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
        <span>My addresses</span>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
        <div className="flex flex-col gap-1 flex-1">
          <h1 className="text-[20px] lg:text-[24px] font-semibold leading-[30px] lg:leading-[36px] tracking-[-0.03em] text-[#242424]">
            My Addresses
          </h1>
          <p className="text-[12px] lg:text-[14px] font-medium leading-[18px] lg:leading-[22px] tracking-[-0.02em] text-[#595959]">
            Manage your shipping and billing addresses.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center self-stretch lg:self-start px-5 py-3 h-[48px] rounded-[110px] text-[16px] font-medium lg:font-bold leading-[24px] tracking-[-0.01em] text-[#242424] bg-[#4F8AF7]/20"
        >
          Add new address
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#4F8AF7] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 border border-[#E0E0E0] rounded-[24px]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#D4D4D8] mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <p className="text-[16px] font-semibold text-[#242424] mb-1">No addresses saved</p>
          <p className="text-[14px] text-[#595959]">Add a shipping address to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {addresses.map((addr, idx) => (
            <AddressCard
              key={addr.id}
              addr={addr}
              index={idx + 1}
              onEdit={() => openEdit(addr)}
              onDelete={() => handleDelete(addr.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white w-full max-w-[640px] h-full border-l border-black/12 flex flex-col animate-[slideInRight_0.3s_ease-out]"
            style={{ boxShadow: "-20px 0px 74px rgba(0,0,0,0.12)" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
              <h3 className="text-[24px] font-semibold leading-[36px] tracking-[-0.03em] text-[#242424]">
                {editingId ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F4F4F5] transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#383637]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-[14px]">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
                <FormField label="Full name" placeholder="Enter your full name" value={`${form.first_name}${form.last_name ? ` ${form.last_name}` : ""}`} onChange={(v) => {
                  const parts = v.split(" ")
                  updateField("first_name", parts[0] || "")
                  updateField("last_name", parts.slice(1).join(" "))
                }} required />
                <FormField label="Phone number" placeholder="Enter your phone number" value={form.phone} onChange={(v) => updateField("phone", v)} type="tel" />
                <FormField label="Company" placeholder="Enter your company name" value={form.company} onChange={(v) => updateField("company", v)} />
                <FormField label="Address #01" placeholder="Enter your address" value={form.address_1} onChange={(v) => updateField("address_1", v)} required />
                <FormField label="Address #02" placeholder="Apartment, suite, etc. (optional)" value={form.address_2} onChange={(v) => updateField("address_2", v)} />
                <FormField label="City" placeholder="Enter your city" value={form.city} onChange={(v) => updateField("city", v)} required />
                <FormField label="Postal Code" placeholder="Enter your postal code" value={form.postal_code} onChange={(v) => updateField("postal_code", v)} required />
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-semibold leading-[22px] text-[#383637]">
                    Country
                  </label>
                  <select
                    value={form.country_code}
                    onChange={(e) => updateField("country_code", e.target.value)}
                    className="w-full h-[48px] px-4 py-3 rounded-[16px] bg-[#242424]/[0.04] border border-[#242424]/[0.08] text-[16px] font-normal leading-[24px] text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#4F8AF7] focus:border-transparent"
                  >
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="gb">United Kingdom</option>
                    <option value="au">Australia</option>
                    <option value="de">Germany</option>
                    <option value="fr">France</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-black/8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-[48px] rounded-[110px] text-[16px] font-medium text-[#242424] bg-[#4F8AF7]/8 hover:bg-[#4F8AF7]/12 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 h-[48px] rounded-[110px] text-[16px] font-bold text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update address" : "Save address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, placeholder, value, onChange, required, type = "text" }: {
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[14px] font-semibold leading-[22px] text-[#383637]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full h-[48px] px-4 py-3 rounded-[16px] bg-[#242424]/[0.04] border border-[#242424]/[0.08] text-[16px] font-normal leading-[24px] text-[#242424] placeholder:text-[#383637]/[0.72] focus:outline-none focus:ring-2 focus:ring-[#4F8AF7] focus:border-transparent"
      />
    </div>
  )
}

function AddressCard({ addr, index, onEdit, onDelete }: {
  addr: Address
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  const fullName = [addr.first_name, addr.last_name].filter(Boolean).join(" ")
  const phone = addr.phone || ""
  const company = addr.company || ""
  const addressLine = [addr.address_1, addr.address_2, addr.city, addr.province, addr.postal_code, addr.country_code?.toUpperCase()].filter(Boolean).join(", ")

  return (
    <div className="flex flex-col gap-5 p-5 px-6 lg:p-5 lg:px-6 pb-6 bg-white border border-[#E0E0E0] rounded-[24px]">
      <div className="flex items-center justify-between">
        <h3 className="text-[20px] lg:text-[24px] font-semibold leading-[30px] lg:leading-[36px] tracking-[-0.03em] text-[#242424]">
          Address {index}
        </h3>
        <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-[8px] transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="#D32F2F" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {fullName && (
          <div className="flex flex-col gap-[2px]">
            <span className="text-[12px] lg:text-[14px] font-normal leading-[18px] lg:leading-[20px] tracking-[-0.02em] text-[#595959]">Full name</span>
            <span className="text-[14px] lg:text-[16px] font-semibold leading-[22px] lg:leading-[24px] tracking-[-0.01em] text-[#242424]">{fullName}</span>
          </div>
        )}
        {phone && (
          <div className="flex flex-col gap-[2px]">
            <span className="text-[12px] lg:text-[14px] font-normal leading-[18px] lg:leading-[20px] tracking-[-0.02em] text-[#595959]">Phone number</span>
            <span className="text-[14px] lg:text-[16px] font-semibold leading-[22px] lg:leading-[24px] tracking-[-0.01em] text-[#242424]">{phone}</span>
          </div>
        )}
        {company && (
          <div className="flex flex-col gap-[2px]">
            <span className="text-[12px] lg:text-[14px] font-normal leading-[18px] lg:leading-[20px] tracking-[-0.02em] text-[#595959]">Company</span>
            <span className="text-[14px] lg:text-[16px] font-semibold leading-[22px] lg:leading-[24px] tracking-[-0.01em] text-[#242424]">{company}</span>
          </div>
        )}
        <div className="flex flex-col gap-[2px]">
          <span className="text-[12px] lg:text-[14px] font-normal leading-[18px] lg:leading-[20px] tracking-[-0.02em] text-[#595959]">Address</span>
          <span className="text-[14px] lg:text-[16px] font-semibold leading-[22px] lg:leading-[24px] tracking-[-0.01em] text-[#242424]">{addressLine}</span>
        </div>
      </div>

      <button
        onClick={onEdit}
        className="inline-flex items-center justify-center self-stretch lg:self-start px-5 py-3 h-[48px] rounded-[110px] text-[16px] font-medium leading-[24px] tracking-[-0.01em] text-[#242424] bg-[#4F8AF7]/8"
      >
        Edit address
      </button>
    </div>
  )
}
