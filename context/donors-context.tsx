"use client"

import type React from "react"

import { createContext, useContext, useMemo, useState } from "react"

export type DonorEntry = {
  name: string
  bundles?: number
  total: number
  createdAt: number
  email?: string
  phone?: string
  message?: string
  mode?: "bundles" | "custom"
  visibility?: "public" | "anonymous" | "initials"
}

type DonorContextValue = {
  donors: DonorEntry[]
  addDonor: (entry: Omit<DonorEntry, "createdAt">) => void
}

const DonorContext = createContext<DonorContextValue | null>(null)

export function DonorProvider({ children }: { children: React.ReactNode }) {
  const [donors, setDonors] = useState<DonorEntry[]>([])

  const addDonor = (entry: Omit<DonorEntry, "createdAt">) => {
    // new donors appear at the top
    setDonors((prev) => [{ ...entry, createdAt: Date.now() }, ...prev])
  }

  const value = useMemo(() => ({ donors, addDonor }), [donors])

  return <DonorContext.Provider value={value}>{children}</DonorContext.Provider>
}

export function useDonors() {
  const ctx = useContext(DonorContext)
  if (!ctx) throw new Error("useDonors must be used within DonorProvider")
  return ctx
}
