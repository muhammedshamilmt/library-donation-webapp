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

const BUNDLE_PRICE = 1001

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
  // Goal: 25,00,000 (25 lakh)
  const GOAL = 2500000
  const remaining = Math.max(GOAL - totalFunds, 0)
  const remainingDisplay = `₹${remaining.toLocaleString("en-IN")}`
  const goalDisplay = `₹${GOAL.toLocaleString("en-IN")}`
  const progress = Math.max(0, Math.min(totalFunds / GOAL, 1))
  const progressPct = Math.round(progress * 100)

  return (
    <div className="space-y-12">
      {/* Hero */}
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

      {/* Our Impact */}
      <section aria-labelledby="impact" className="rounded-xl bg-white p-6 md:p-8 border border-gray-200">
        <h2 id="impact" className="text-lg font-semibold text-gray-900">
          Our Impact
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <ImpactStat label="Total Funds Received" value={totalFundsDisplay} />
          <ImpactStat label="Books Donated" value={bundlesDonated.toLocaleString("en-IN") + "+"} />
          <ImpactStat label="Students Helped" value={studentsHelped.toLocaleString("en-IN") + "+"} />
          {/* <ImpactStat label="Communities Reached" value="120+" /> */}
        </div>
        <p className="mt-3 text-xs text-gray-500">Calculated at ₹1,001 per book. Includes a minus-one adjustment.</p>
      </section>

      {/* Bundle highlight with image (2-col on md+) */}
      <section aria-labelledby="bundle-highlight" className="rounded-xl bg-white border border-gray-200 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 id="bundle-highlight" className="text-xl md:text-2xl font-semibold text-blue-900">
              1 Bundle Needed — ₹1,001
            </h2>
            <p className="mt-2 text-gray-700 leading-relaxed">
              Help us place essential learning materials into students’ hands. Every bundle moves us one step closer to
              a brighter classroom experience.
            </p>

            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <li className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">Textbooks</li>
              <li className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">Study Guides</li>
              <li className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">Reading Books</li>
              <li className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">Stationery</li>
            </ul>

            <div className="mt-5">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center rounded-lg bg-amber-500 text-white px-5 py-2.5 text-sm font-medium shadow transition-colors hover:brightness-110"
              >
                Donate a Bundle
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-gray-200">
            {/* Use the existing library image asset */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/students-reading-in-a-library.png"
              alt="Students reading books in a library"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Fundraising goal with progress bar */}
      <section aria-labelledby="fund-goal" className="rounded-xl bg-white border border-gray-200 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="fund-goal" className="text-lg md:text-xl font-semibold text-blue-900">
            Fundraising Goal
          </h2>
          <span className="text-sm text-gray-600">Target: {goalDisplay}</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ImpactStat label="Total Funds Received" value={totalFundsDisplay} />
          <ImpactStat label="Remaining" value={remainingDisplay} />
          <ImpactStat label="Progress" value={`${progressPct}%`} />
        </div>

        <div className="mt-6">
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Donation progress toward goal"
          >
            <div className="h-full bg-blue-900 transition-[width] duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-3 text-sm text-gray-600">
            {progressPct >= 100
              ? "Goal reached! Thank you for your incredible support."
              : "Every contribution brings us closer. Thank you for helping us build brighter futures."}
          </p>
        </div>
      </section>

      {/* Appreciation */}
      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-emerald-700">Every bundle you donate funds new library books. Thank you for your support!</p>
      </section>
    </div>
  )
}
