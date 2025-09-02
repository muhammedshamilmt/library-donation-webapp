"use client"

import { cn } from "@/lib/utils"
import { isAdminAuthed, setAdminAuthed } from "@/lib/admin-auth"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function AdminDonorsPage() {
  const router = useRouter()
  const [donors, setDonors] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Donation | null>(null)

  useEffect(() => {
    if (!isAdminAuthed()) {
      router.replace("/admin?redirect=/admin/donors")
    }
  }, [router])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/donations", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch donations")
        const data = await res.json()
        if (isMounted) setDonors(data.donations || [])
      } catch (_e) {
        if (isMounted) setDonors([])
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const rows = useMemo(() => donors, [donors])

  return (
    <section className="rounded-xl bg-white border border-gray-200 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-blue-900">Donors</h1>
          <p className="mt-1 text-gray-700">Click a donor to view details.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-100"
            onClick={() => exportCsv(donors)}
          >
            Export CSV
          </button>
          <button
            onClick={() => {
              setAdminAuthed(false)
              router.replace("/admin")
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Total (₹)</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <Td colSpan={5} className="text-center text-gray-600 py-6">Loading…</Td>
              </tr>
            ) : rows.map((d, i) => (
              <tr
                key={d.createdAt + "-" + i}
                onClick={() => setSelected(d)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <Td className="font-medium text-gray-900">{d.name}</Td>
                <Td>
                  {typeof d.bundles === "number" && d.bundles > 0
                    ? `${d.bundles} bundle${d.bundles > 1 ? "s" : ""}`
                    : "Custom"}
                </Td>
                <Td>₹{d.total.toLocaleString("en-IN")}</Td>
                <Td>
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
                    d.status === "read"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  )}>
                    {d.status === "read" ? "Read" : "New"}
                  </span>
                </Td>
                <Td>
                  {new Date(d.createdAt).toLocaleDateString()} {" "}
                  {new Date(d.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Td>
              </tr>
            ))}
            {!loading && rows.length === 0 ? (
              <tr>
                <Td colSpan={5} className="text-center text-gray-600 py-6">
                  No donors yet.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donor Details</DialogTitle>
            <DialogDescription>Donation and contact information.</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="grid gap-2 text-sm">
              <Row label="Name" value={selected.name} />
              <Row
                label="Type"
                value={
                  typeof selected.bundles === "number" && selected.bundles > 0
                    ? `Bundles (${selected.bundles})`
                    : "Custom"
                }
              />
              <Row label="Total" value={`₹${selected.total.toLocaleString("en-IN")}`} />
              <Row label="Email" value={selected.email || "—"} />
              <Row label="Phone" value={selected.phone || "—"} />
              <Row label="Message" value={selected.message || "—"} />
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-700">
                  Status: <span className="font-medium">{selected.status === "read" ? "Read" : "New"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-100"
                    onClick={async () => {
                      const next = selected.status === "read" ? "new" : "read"
                      const res = await fetch("/api/donations", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: selected.id, status: next }),
                      })
                      if (res.ok) {
                        setDonors((prev) => prev.map((d) => (d.id === selected.id ? { ...d, status: next } : d)))
                        setSelected((curr) => (curr ? { ...curr, status: next } : curr))
                      }
                    }}
                  >
                    Mark as {selected.status === "read" ? "New" : "Read"}
                  </button>
                </div>
              </div>
              <Row
                label="Date"
                value={`${new Date(selected.createdAt).toLocaleDateString()} ${new Date(selected.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-left font-semibold text-gray-700">{children}</th>
}
function Td({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cn("px-4 py-2 text-gray-700", className)}>
      {children}
    </td>
  )
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-28 shrink-0 text-gray-600">{label}</div>
      <div className="flex-1 text-gray-900">{value}</div>
    </div>
  )
}

type Donation = {
  id?: string
  name: string
  email: string
  phone?: string
  message?: string
  mode: "bundles" | "custom"
  bundles?: number
  total: number
  visibility: "public" | "anonymous" | "initials"
  createdAt: string
  status?: "new" | "read"
}

function exportCsv(rows: Donation[]) {
  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "message",
    "mode",
    "bundles",
    "total",
    "visibility",
    "status",
    "createdAt",
  ]
  const escape = (val: unknown) => {
    const s = String(val ?? "")
    if (s.includes("\n") || s.includes(",") || s.includes('"')) {
      return '"' + s.replaceAll('"', '""') + '"'
    }
    return s
  }
  const lines = [headers.join(",")]
  for (const d of rows) {
    lines.push([
      d.id ?? "",
      d.name,
      d.email,
      d.phone ?? "",
      d.message ?? "",
      d.mode,
      typeof d.bundles === "number" ? d.bundles : "",
      d.total,
      d.visibility,
      d.status ?? "",
      d.createdAt,
    ].map(escape).join(","))
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `donations-${new Date().toISOString()}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
