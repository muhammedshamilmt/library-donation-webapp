"use client"

import { useEffect, useState } from "react"

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
}

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/donations?visibility=public", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch donors")
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

  return (
    <section className="rounded-xl bg-white border border-gray-200 p-6 md:p-10">
      <h1 className="text-2xl md:text-3xl font-semibold text-blue-900">Recent Donors</h1>
      <p className="mt-2 text-gray-700">Thank you to everyone contributing to build brighter futures.</p>

      <div className="mt-6 max-h-[480px] overflow-y-auto pr-1">
        {loading ? (
          <p className="text-sm text-gray-600">Loading…</p>
        ) : donors.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid grid-cols-1 gap-4">
            {donors.map((d) => (
              <li key={d.id ?? d.createdAt}>
                <DonorCard
                  name={d.name}
                  bundles={d.bundles}
                  total={d.total}
                  createdAt={d.createdAt}
                  visibility={d.visibility}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function DonorCard({
  name,
  bundles,
  total,
  createdAt,
  visibility,
}: {
  name: string
  bundles?: number
  total: number
  createdAt: string
  visibility?: "public" | "anonymous" | "initials"
}) {
  const date = new Date(createdAt)

  const firstInitial = name?.trim()?.charAt(0)?.toUpperCase() || "?"
  const avatarText = visibility === "anonymous" ? "?" : firstInitial
  const displayName = visibility === "anonymous" ? "Anonymous" : visibility === "initials" ? `${firstInitial}.` : name

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div
        aria-hidden="true"
        className="h-10 w-10 shrink-0 rounded-full bg-blue-900 text-white grid place-items-center font-semibold"
      >
        {avatarText}
      </div>
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
          <p className="text-sm text-gray-900">
            <span className="font-medium">{displayName}</span>{" "}
            {typeof bundles === "number" && bundles > 0 ? (
              <>
                donated <span className="font-medium">{bundles}</span> bundle{bundles > 1 ? "s" : ""} of books
              </>
            ) : (
              <>made a custom donation</>
            )}
          </p>
          <p className="text-sm text-gray-600">
            {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <p className="mt-1 text-sm font-semibold text-emerald-700">Total: ₹{total.toLocaleString("en-IN")}</p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-gray-300 p-6 text-center">
      <p className="text-sm text-gray-600">
        No donations yet. Be the first to{" "}
        <a className="text-amber-500 font-medium hover:underline" href="/donate">
          donate
        </a>
        !
      </p>
    </div>
  )
}
