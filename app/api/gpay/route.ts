import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"

const PatchSchema = z.object({
  amount: z.number().min(0),
})

export async function GET() {
  try {
    const db = await getDb()
    const doc = await db.collection("settings").findOne({ _id: "gpay" })
    const amount = typeof doc?.amount === "number" ? doc.amount : 0
    return NextResponse.json({ amount })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch GPay amount" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 },
      )
    }
    const { amount } = parsed.data
    const db = await getDb()
    await db
      .collection("settings")
      .updateOne(
        { _id: "gpay" },
        { $set: { amount, updatedAt: new Date().toISOString() } },
        { upsert: true },
      )
    return NextResponse.json({ ok: true, amount })
  } catch (err) {
    return NextResponse.json({ error: "Failed to update GPay amount" }, { status: 500 })
  }
}


