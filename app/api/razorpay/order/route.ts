import { NextResponse } from "next/server"

// Creates a Razorpay order for the specified amount (in INR)
export async function POST(req: Request) {
  try {
    const { amount, currency = "INR", receipt, notes } = await req.json()

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay keys not configured" }, { status: 500 })
    }

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")

    // Razorpay expects amount in paise
    const body = {
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt ?? `rcpt_${Date.now()}`,
      notes: notes ?? {},
    }

    const resp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => "")
      return NextResponse.json(
        { error: "Failed to create order", details: text },
        { status: 500 }
      )
    }

    const order = await resp.json()
    return NextResponse.json({ order })
  } catch (err) {
    return NextResponse.json({ error: "Server error creating order" }, { status: 500 })
  }
}


