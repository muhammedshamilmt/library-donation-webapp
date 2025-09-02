import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json({ ok: false, error: "Key not configured" }, { status: 500 })
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature
    return NextResponse.json({ ok: isAuthentic })
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}


