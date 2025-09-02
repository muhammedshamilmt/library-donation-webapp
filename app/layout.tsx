import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { DonorProvider } from "@/context/donors-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Library Donation – Islamic Dawa Academy",
  description: "Support Islamic Dawa Academy's mission by donating funds for student library book bundles.",
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <DonorProvider>
          <div className="min-h-dvh flex flex-col">
            <Navbar />
            <main className="flex-1">
              <div className="mx-auto w-full max-w-5xl px-4 py-8">{children}</div>
            </main>
            <Footer />
          </div>
        </DonorProvider>
        <Toaster />
      </body>
    </html>
  )
}
