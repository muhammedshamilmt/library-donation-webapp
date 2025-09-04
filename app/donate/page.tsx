"use client"

import { useState, useMemo } from "react"
import type React from "react"
import { useDonors } from "@/context/donors-context"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const BUNDLE_PRICE = 1001 // INR

export default function DonatePage() {
  const { addDonor, donors } = useDonors()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [mode, setMode] = useState<"bundles" | "custom">("bundles")
  const [visibility, setVisibility] = useState<"public" | "anonymous" | "initials">("public")
  const [bundles, setBundles] = useState(1)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [viewAs, setViewAs] = useState<"public" | "admin">("public")

  const bundlesTotal = bundles * BUNDLE_PRICE
  const parsedCustom = Math.max(0, Number(customAmount || 0))
  const total = mode === "bundles" ? bundlesTotal : parsedCustom

  const isValid =
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    (mode === "bundles" ? bundles >= 1 : parsedCustom >= 1)

  // Helper to format phone with country code
  function formatPhone(phone: string, code: string) {
    const trimmed = phone.trim()
    if (trimmed.startsWith("+")) return trimmed
    // Remove leading zeros or spaces
    const cleaned = trimmed.replace(/^0+/, "")
    return code + cleaned
  }

  const students = useMemo(() => {
    if (mode === "bundles") return bundles
    if (parsedCustom < 1) return 0
    return +(parsedCustom / BUNDLE_PRICE).toFixed(2)
  }, [mode, bundles, parsedCustom])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) {
      toast({
        title: "Incomplete donation",
        description:
          mode === "bundles"
            ? "Please enter your details, phone and at least 1 bundle."
            : "Please enter your details, phone and at least ₹1.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      // Format phone with country code
      const formattedPhone = formatPhone(phone, countryCode)
      // 1) Create Razorpay order on server
      const orderResp = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, notes: { email, name, phone: formattedPhone } }),
      })
      if (!orderResp.ok) throw new Error("Failed to create order")
      const { order } = await orderResp.json()

      // 2) Ensure Razorpay script is loaded
      const ensureRzp = () =>
        new Promise<void>((resolve, reject) => {
          if (typeof window !== "undefined" && (window as any).Razorpay) {
            resolve()
            return
          }
          const script = document.createElement("script")
          script.src = "https://checkout.razorpay.com/v1/checkout.js"
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject(new Error("Failed to load Razorpay"))
          document.body.appendChild(script)
        })

      await ensureRzp()

      // 3) Open Razorpay checkout
      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount, // in paise
        currency: order.currency,
        name: "Library Donations",
        description: "Support student book bundles",
        order_id: order.id,
  prefill: { name, email, contact: formattedPhone },
        notes: { visibility, mode },
        theme: { color: "#1e3a8a" },
        handler: async (response: any) => {
          try {
            // 4) Verify payment signature server-side
            const verifyResp = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyJson = await verifyResp.json()
            if (!verifyResp.ok || !verifyJson.ok) {
              throw new Error("Payment verification failed")
            }

            const entry =
              mode === "bundles"
                ? {
                    name: name.trim(),
                    email: email.trim(),
                    phone: formattedPhone,
                    message: message.trim(),
                    mode,
                    bundles,
                    total,
                    visibility,
                  }
                : ({
                    name: name.trim(),
                    email: email.trim(),
                    phone: formattedPhone,
                    message: message.trim(),
                    mode,
                    total,
                    visibility,
                  } as const)

            const saveResp = await fetch("/api/donations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(entry),
            })
            if (!saveResp.ok) throw new Error("Failed to save donation")

            addDonor(entry)

            // Redirect to success screen with details
            window.location.href = `/donate/success?donorName=${encodeURIComponent(name.trim())}&amount=${encodeURIComponent(total)}&transactionId=${encodeURIComponent(response.razorpay_payment_id)}`;

            // Optionally, reset form state after redirect (not strictly necessary)
            setName("")
            setEmail("")
            setPhone("")
            setMessage("")
            setBundles(1)
            setCustomAmount("")
            setMode("bundles")
            setVisibility("public")
          } catch (err) {
            toast({
              title: "Payment verification failed",
              description: "We could not verify the payment. If money was deducted, it will be auto-refunded.",
              variant: "destructive",
            })
          } finally {
            setSubmitting(false)
          }
        },
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment cancelled",
              description: "You closed the checkout without completing the payment.",
            })
            setSubmitting(false)
          },
        },
      })

      rzp.open()
    } catch (_err) {
      toast({
        title: "Could not start payment",
        description: "Something went wrong while initiating the payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      // do not reset here; success/handler or modal dismiss manages it
    }
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl text-blue-900">Support Library Donations</CardTitle>
        <CardDescription>
          Choose bundles or enter a custom amount. Every rupee helps put books in students’ hands.
        </CardDescription>
      </CardHeader>
      <CardContent>
        
      {/* Subtle divider between the page intro and the donation sections */}
      <div role="separator" aria-orientation="horizontal" className="my-6 h-px w-full bg-gray-200" />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: donation form */}
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 max-w-xl lg:max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name" required>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                name="name"
                aria-label="Name"
              />
            </Field>
            <Field label="Phone" required>
              <div className="flex gap-2 w-full max-w-[400px] md:max-w-[420px] items-center">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-16 min-w-[4rem]" aria-label="Country code">
                    <span className="font-semibold">{countryCode}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+91"><span className="font-semibold">IN</span> +91 India</SelectItem>
                    <SelectItem value="+971"><span className="font-semibold">AE</span> +971 UAE</SelectItem>
                    <SelectItem value="+973"><span className="font-semibold">BH</span> +973 Bahrain</SelectItem>
                    <SelectItem value="+974"><span className="font-semibold">QA</span> +974 Qatar</SelectItem>
                    <SelectItem value="+968"><span className="font-semibold">OM</span> +968 Oman</SelectItem>
                    <SelectItem value="+965"><span className="font-semibold">KW</span> +965 Kuwait</SelectItem>
                    <SelectItem value="+966"><span className="font-semibold">SA</span> +966 Saudi Arabia</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  name="phone"
                  aria-label="Phone"
                  className="flex-1 min-w-0"
                  style={{ minWidth: "160px" }}
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                name="email"
                aria-label="Email"
              />
            </Field>
            <Field label="Message (optional)">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a note"
                name="message"
                aria-label="Message"
              />
            </Field>
          </div>

          <div className="grid gap-2">
            <label htmlFor="visibility" className="text-sm font-medium text-gray-800">
              Visibility Preference
            </label>
            <Select
              value={visibility}
              onValueChange={(v) => setVisibility(v as "public" | "anonymous" | "initials")}
            >
              <SelectTrigger aria-label="Visibility Preference" className="w-full">
                <SelectValue placeholder="Choose visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Show my name and message</SelectItem>
                <SelectItem value="anonymous">Anonymous - Hide my identity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium text-gray-800">Donation Type</span>
            <div
              role="tablist"
              aria-label="Donation type"
              className="flex rounded-md border border-gray-300 p-1 bg-gray-50"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "bundles"}
                onClick={() => setMode("bundles")}
                className={cn(
                  "flex-1 rounded-[6px] px-3 py-2 text-sm font-medium transition-colors",
                  mode === "bundles" ? "bg-blue-900 text-white" : "text-gray-700 hover:bg-gray-100",
                )}
              >
                Bundles
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "custom"}
                onClick={() => setMode("custom")}
                className={cn(
                  "flex-1 rounded-[6px] px-3 py-2 text-sm font-medium transition-colors",
                  mode === "custom" ? "bg-blue-900 text-white" : "text-gray-700 hover:bg-gray-100",
                )}
              >
                Custom amount
              </button>
            </div>
          </div>

          {mode === "bundles" ? (
            <>
              <div className="grid grid-cols-1 gap-3">
                <label className="text-sm font-medium text-gray-800">Bundles</label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    aria-label="Decrease bundles"
                    onClick={() => setBundles((b) => Math.max(1, b - 1))}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                  >
                    −
                  </Button>
                  <span className="min-w-10 text-center font-semibold">{bundles}</span>
                  <Button
                    type="button"
                    aria-label="Increase bundles"
                    onClick={() => setBundles((b) => b + 1)}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                  >
                    +
                  </Button>
                  <div className="ml-auto text-sm text-gray-700">
                    Price per bundle: <span className="font-medium">₹{BUNDLE_PRICE.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                  <span className="text-sm text-emerald-700">Total</span>
                  <span className="text-lg font-semibold text-emerald-700">
                    ₹{bundlesTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-800">Enter amount (INR)</label>
                <div className="flex gap-2">
                  {[500, 1001, 2002, 5000].map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      onClick={() => setCustomAmount(String(amt))}
                      variant="outline"
                      size="sm"
                      aria-label={`Set amount ₹${amt}`}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-0 bottom-0 flex items-center h-full text-gray-600">₹</span>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    type="number"
                    min={1}
                    step={1}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-7"
                    placeholder="e.g., 1500"
                    aria-label="Custom amount in rupees"
                  />
                  <p className="mt-1 text-xs text-gray-600">Minimum custom donation: ₹1</p>
                </div>

                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                  <span className="text-sm text-emerald-700">Total</span>
                  <span className="text-lg font-semibold text-emerald-700">
                    ₹{parsedCustom.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full md:w-auto bg-amber-500 text-white"
            size="lg"
          >
            {submitting ? "Processing…" : total > 0 ? `Donate ₹${total.toLocaleString("en-IN")}` : "Donate"}
          </Button>
        </form>

        {/* Right: benefits + total + impact (sticky on large screens) */}
        <aside className="lg:sticky lg:top-6">
          <BenefitsAndImpact total={total} students={students} showBenefits={true} />
        </aside>
      </div>
      </CardContent>
    </Card>
  )
}

function BenefitsAndImpact({
  total,
  students,
  showBenefits = false,
}: { total: number; students: number; showBenefits?: boolean }) {
  return (
    <div className="mt-4 grid gap-4">
      {showBenefits ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">What&apos;s in a Book Bundle?</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Essential textbooks for core subjects</li>
            <li>Reference materials and study guides</li>
            <li>Creative reading books for engagement</li>
            <li>Stationery and learning supplies</li>
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl bg-blue-900 text-white p-5">
        <div className="text-xs uppercase tracking-wide opacity-90">Total Donation</div>
        <div className="mt-1 text-2xl font-semibold">₹{total.toLocaleString("en-IN")}</div>
        {students > 0 ? (
          <div className="mt-1 text-sm opacity-95">
            Supporting {students} Bundle{students > 1 ?"s" : ""}
          </div>
        ) : null}
      </div>

      {students > 0 ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-emerald-700 text-sm font-medium">
            Your {students} bundle donation will impact in moulding a scholar.
          </p>
        </div>
      ) : null}
    </div>
  )
}


function Field({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-gray-800">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      {children}
    </label>
  )
}
