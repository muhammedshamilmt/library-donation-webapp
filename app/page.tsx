"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

function ImpactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-5 bg-gray-50">
      <div className="text-2xl md:text-3xl font-semibold text-blue-900">{value}</div>
      <div className="mt-1 text-sm text-gray-600">{label}</div>
    </div>
  )
}

const BUNDLE_PRICE = 1100

type Donation = {
  mode: "bundles" | "custom"
  bundles?: number
  total: number
}

export default function Page() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        const resp = await fetch("/api/donations?limit=500")
        if (!resp.ok) return
        const json = await resp.json()
        if (!cancelled) {
          const list: Donation[] = (json.donations || []).map((d: any) => ({
            mode: d.mode,
            bundles: d.bundles,
            total: d.total,
          }))
          setDonations(list)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const { totalFunds, bundlesDonated, studentsHelped } = useMemo(() => {
    const totalFundsLocal = donations.reduce((sum, d) => sum + (d.total || 0), 0)
    // Calculate total bundles purely from total funds
    const bundlesFromFunds = Math.floor(totalFundsLocal / BUNDLE_PRICE)
    // Apply minus-one adjustment as requested
    const bundlesAdj = Math.max(0, bundlesFromFunds - 1)
    const studentsTotal = bundlesFromFunds

    return {
      totalFunds: totalFundsLocal,
      bundlesDonated: bundlesAdj,
      studentsHelped: Math.max(0, studentsTotal - 1),
    }
  }, [donations])

  const totalFundsDisplay = `₹${totalFunds.toLocaleString("en-IN")}`

  return (
    <div className="space-y-12">
      <section className="rounded-xl bg-white p-8 md:p-12 border border-gray-200">
        <div className="max-w-3xl">
          <h1 className="text-balance text-3xl md:text-5xl font-semibold text-blue-900">Donate Books, Build Futures</h1>
          <p className="mt-4 text-pretty text-gray-700 leading-relaxed">
            Your contribution puts books into the hands of students who need them most. Together we can spark curiosity,
            open doors, and build brighter futures.
          </p>
          <div className="mt-6">
            <Link
              href="/donate"
              className="inline-flex items-center justify-center rounded-lg bg-amber-500 text-white px-5 py-3 text-sm font-medium shadow transition-colors hover:brightness-110"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="impact" className="rounded-xl bg-white p-6 md:p-8 border border-gray-200">
        <h2 id="impact" className="text-lg font-semibold text-gray-900">
          Our Impact
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <ImpactStat label="Total Funds Received" value={totalFundsDisplay} />
          <ImpactStat label="Bundles Donated" value={bundlesDonated.toLocaleString("en-IN")+"+"} />
          <ImpactStat label="Students Helped" value={studentsHelped.toLocaleString("en-IN") +"+"} />
        </div>
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-emerald-700">Every bundle you donate funds new library books. Thank you for your support!</p>
      </section>
    </div>
  )
}
