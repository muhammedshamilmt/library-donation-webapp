"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export function Footer() {
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeString = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} Donate Books, Build Futures</p>
          <nav aria-label="Footer navigation" className="flex items-center gap-4">
            <Link className="text-sm text-gray-700 hover:text-amber-500" href="/">
              Home
            </Link>
            <Link className="text-sm text-gray-700 hover:text-amber-500" href="/donate">
              Donate
            </Link>
            <Link className="text-sm text-gray-700 hover:text-amber-500" href="/donors">
              Donors
            </Link>
          </nav>
          <time aria-label="Current time" className="text-sm text-gray-600 tabular-nums">
            {timeString}
          </time>
        </div>
      </div>
    </footer>
  )
}
