"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { isAdminAuthed, setAdminAuthed } from "@/lib/admin-auth"

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL 
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS 

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const sp = useSearchParams()
  const redirect = sp.get("redirect") || "/admin/dashboard"

  useEffect(() => {
    if (isAdminAuthed()) {
      router.replace(redirect)
    }
  }, [router, redirect])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ok = email.trim() === ADMIN_EMAIL && password === ADMIN_PASS
    if (ok) {
      setAdminAuthed(true)
      toast({ title: "Signed in", description: "Welcome back, Admin." })
      router.replace(redirect)
    } else {
      toast({ title: "Invalid credentials", description: "Please check your email/password.", variant: "destructive" })
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-sm rounded-xl bg-white border border-gray-200 p-6 md:p-8 shadow-sm">
      {/* subtle header row */}
      <div className="flex items-center gap-2">
        <div
          aria-hidden
          className="h-8 w-8 grid place-items-center rounded-md bg-blue-50 text-blue-900 border border-blue-100"
        >
          {/* simple lock icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
            <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.5" />
            <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="15" r="1.2" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-blue-900">Admin Sign in</h1>
          <p className="mt-1 text-sm text-gray-700">Access the dashboard and donors.</p>
        </div>
      </div>

      <div role="separator" aria-orientation="horizontal" className="my-5 h-px w-full bg-gray-200" />

      <form onSubmit={onSubmit} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-800">Email</span>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@domain.com"
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-800">Password</span>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>
        <button
          disabled={loading}
          className={cn(
            "rounded-lg bg-amber-500 text-white px-5 py-2.5 text-sm font-medium shadow hover:brightness-110",
            loading && "opacity-60 cursor-not-allowed",
          )}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {/* small helper */}
        <p className="text-xs text-gray-600 mt-1">Use the provided credentials to enter the admin dashboard.</p>
      </form>
    </section>
  )
}
