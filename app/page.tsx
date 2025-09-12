"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

function ImpactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative rounded-lg border border-gray-200 p-5 bg-gray-50 overflow-hidden">
      {/* Shimmer overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(90deg,transparent,black,transparent)]">
        <div className="h-full w-[200%] -translate-x-1/2 animate-[shine_3s_linear_infinite] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.7)_50%,transparent_100%)]" />
      </div>

      <div className="flex items-center gap-3">
        {/* Icon badge with gradient and glow */}
        <div className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 shadow-[0_0_0_2px_rgba(255,255,255,0.8)_inset]">
          <svg className="h-5 w-5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] animate-[pulseGlow_2.4s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2L9.5 8H3l5.25 3.81L5.75 18 12 13.9 18.25 18l-2.5-6.19L21 8h-6.5L12 2z" />
          </svg>
          <span className="pointer-events-none absolute -inset-1 rounded-full blur-md bg-gradient-to-br from-amber-400/40 via-orange-500/30 to-pink-500/40" />
        </div>

        <div>
          <div className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 bg-clip-text text-transparent">
            {value}
          </div>
          <div className="mt-1 text-sm text-gray-600">{label}</div>
        </div>
      </div>

      {/* Decorative gradient edge */}
      <div className="pointer-events-none absolute -bottom-[1px] left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500" />

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(50%); }
        }
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 0 rgba(255, 176, 0, 0.0)); }
          50% { filter: drop-shadow(0 0 8px rgba(255, 176, 0, 0.6)); }
        }
      `}</style>
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
  const [gpayAmount, setGpayAmount] = useState<number>(0)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        const resp = await fetch("/api/donations")
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

  // Fetch GPay amount (from settings)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const resp = await fetch("/api/gpay", { cache: "no-store" })
        if (!resp.ok) return
        const json = await resp.json()
        if (!cancelled) {
          const amt = typeof json.amount === "number" ? json.amount : 0
          setGpayAmount(amt)
        }
      } catch {
        if (!cancelled) setGpayAmount(0)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const { totalFunds, bundlesDonated, studentsHelped } = useMemo(() => {
    const donationFunds = donations.reduce((sum, d) => sum + (d.total || 0), 0)
    const totalFundsCombined = donationFunds + (Number.isFinite(gpayAmount) ? gpayAmount : 0)
    // Calculate total bundles as decimal using combined funds
    const bundlesFromFunds = +(totalFundsCombined / BUNDLE_PRICE).toFixed(2)
    // Apply minus-one adjustment as requested (if needed, but keep decimal)
    const bundlesAdj = Math.max(0, +(bundlesFromFunds - 1).toFixed(2))
    const studentsTotal = bundlesFromFunds

    return {
      totalFunds: totalFundsCombined,
      bundlesDonated: bundlesAdj,
      studentsHelped: Math.max(0, +(studentsTotal - 1).toFixed(2)),
    }
  }, [donations, gpayAmount])

  const totalFundsDisplay = `₹${totalFunds.toLocaleString("en-IN")}`
  // Goal: 25,00,000 (25 lakh)
  const GOAL = 2500000
  const remaining = Math.max(GOAL - totalFunds, 0)
  const remainingDisplay = `₹${remaining.toLocaleString("en-IN")}`
  const goalDisplay = `₹${GOAL.toLocaleString("en-IN")}`
  const progress = Math.max(0, Math.min(totalFunds / GOAL, 1))
  const progressPctExact = Math.max(0, Math.min(progress * 100, 100))
  const progressPctDisplay = progressPctExact.toFixed(2)
  // Campaign bundle target
  const TARGET_BUNDLES = 2500
  const remainingBundles = Math.max(TARGET_BUNDLES - bundlesDonated, 0).toFixed(2)

  return (
    <div className="space-y-12">
      {/* Bundle highlight with image (2-col on md+) */}
      <section aria-labelledby="bundle-highlight" className="rounded-xl bg-white border border-gray-200 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 id="bundle-highlight" className="text-xl md:text-2xl font-semibold text-blue-900">
              Library Book Shelf Campaign
            </h2>
            <p className="mt-2 text-gray-700 leading-relaxed">
              We’re raising funds to equip libraries with essential learning materials. Together, let’s deliver 2,500
              book bundles to students and classrooms that need them most.
            </p>

            {/* Campaign quick stats */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="text-xs text-gray-600">Target</div>
                <div className="text-sm font-medium text-blue-900">2,500 bundles</div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-xs text-emerald-700">Remaining</div>
                <div className="text-sm font-semibold text-emerald-800">{Number(remainingBundles).toLocaleString("en-IN")} bundles</div>
              </div>
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                <div className="text-xs text-amber-800">Price</div>
                <div className="text-sm font-semibold text-amber-900">₹1,001 per bundle</div>
              </div>
            </div>

            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <li className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">Textbooks</li>
              <li className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">Study Guides</li>
              <li className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">Reading Books</li>
              <li className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">Research Books</li>
              <li className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">Traditional Islamic Texts</li>
              <li className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">Conference Hall</li>
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
              src="/images/shelf.jpg"
              alt="Students reading books in a library"
              className="h-full w-full object-cover"
            />
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
          <ImpactStat label="Remaining" value={remainingDisplay} />
          {/* <ImpactStat label="Communities Reached" value="120+" /> */}
        </div>
        <p className="mt-3 text-xs text-gray-500">Calculated at ₹1,001 per book. Includes a minus-one adjustment.</p>
      </section>

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

      {/* Fundraising goal with gradient background like sample */}
      <section
        aria-labelledby="fund-goal"
        className="relative overflow-hidden rounded-xl border border-gray-200 p-6 md:p-10 animatedGradient"
      >
        {/* floating decorative icons */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-4 top-4 text-white/80 animate-[float_6s_ease-in-out_infinite]">★</div>
          <div className="absolute right-6 top-8 text-white/70 animate-[float_7s_ease-in-out_infinite]">✦</div>
          <div className="absolute left-10 bottom-10 text-white/70 animate-[float_5.5s_ease-in-out_infinite]">✧</div>
          <div className="absolute right-8 bottom-6 text-white/80 animate-[float_8s_ease-in-out_infinite]">✩</div>
        </div>

        <div className="relative z-[1] grid place-items-center text-center">
          <div className="mb-4 grid place-items-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-white/15 backdrop-blur-sm text-white shadow-inner">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7h16ZM4 10h16v2H4v-2Zm6-8a3 3 0 0 1 3 3v1H9V5a3 3 0 0 1 3-3Zm5 0a3 3 0 0 1 3 3v1h-4V5a3 3 0 0 1 3-3Z" />
              </svg>
            </div>
          </div>

          <h2 id="fund-goal" className="text-xl md:text-2xl font-semibold text-white/95">
            Fundraising Goal
          </h2>
          <div className="mt-2 text-4xl md:text-5xl font-extrabold text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.2)]">
            {totalFundsDisplay}
          </div>
          <div className="mt-2 text-sm text-white/90">
            raised of <span className="font-semibold">{goalDisplay}</span>
          </div>
        </div>

        {/* progress bar styled like sample */}
        <div className="relative z-[1] mt-8">
          <div
            className="relative h-3 w-full overflow-hidden rounded-full bg-white/30 backdrop-blur-[1px]"
            role="progressbar"
            aria-valuenow={Number(progressPctDisplay)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Donation progress toward goal"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-teal-200 shadow-[0_0_10px_2px_rgba(163,230,53,0.6)] transition-[width] duration-700"
              style={{ width: `${progressPctExact}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-white/90">
            <span>{progressPctDisplay}% Complete</span>
            <span>{remainingDisplay} remaining</span>
          </div>
        </div>

        {/* shine overlay */}
        <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(90deg,transparent,black,transparent)]">
          <div className="h-full w-[200%] -translate-x-1/2 animate-[shine_6s_linear_infinite] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.25)_50%,transparent_100%)]" />
        </div>

        <style jsx>{`
          @keyframes shine { 0% { transform: translateX(-50%); } 100% { transform: translateX(50%); } }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          /* animated gradient background */
          .animatedGradient {
            background-image: linear-gradient(135deg, #10b981, #059669, #0ea5e9);
            background-size: 200% 200%;
            animation: gradientMove 12s ease-in-out infinite;
          }
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </section>

      {/* Appreciation */}
      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-emerald-700">Every bundle you donate funds new library books. Thank you for your support!</p>
      </section>
    </div>
  )
}
