"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home" },
  { href: "/donate", label: "Donate" },
  { href: "/donors", label: "Donors" },
]

export function Navbar() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-blue-900 font-semibold">
          Donate Books
          <span className="sr-only">, Build Futures</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-blue-900 text-white" : "text-gray-700 hover:text-blue-900 hover:bg-gray-100",
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
