import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const DonationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  message: z.string().optional().default(""),
  mode: z.enum(["bundles", "custom"]),
  bundles: z.number().int().min(1).optional(),
  total: z.number().min(0),
  visibility: z.enum(["public", "anonymous", "initials"]),
  createdAt: z.string().optional(),
  status: z.enum(["new", "read"]).optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = DonationSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const donation = { ...parsed.data, status: parsed.data.status ?? "new", createdAt: new Date().toISOString() }
    const db = await getDb()
    const result = await db.collection("donations").insertOne(donation)

    return NextResponse.json(
      { ok: true, id: result.insertedId.toString() },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get("limit") ?? 50)
    const visibility = searchParams.get("visibility")
    const db = await getDb()
    const query: Record<string, unknown> = {}
    if (visibility) {
      query.visibility = visibility
    }
    const docs = await db
      .collection("donations")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(Number.isFinite(limit) ? limit : 50)
      .toArray()

    const donations = docs.map((d) => ({ ...d, id: d._id?.toString(), _id: undefined }))
    return NextResponse.json({ donations })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    )
  }
}

const PatchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "read"]),
})

export async function PATCH(req: Request) {
  try {
    const json = await req.json()
    const parsed = PatchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const db = await getDb()
    const { id, status } = parsed.data
    const result = await db
      .collection("donations")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { status } }, { returnDocument: "after" })

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = result as unknown as { _id: ObjectId } & Record<string, unknown>
    return NextResponse.json({
      ok: true,
      donation: { ...updated, id: updated._id.toString(), _id: undefined },
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update donation" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const body = await (async () => {
      try {
        return await req.json()
      } catch {
        return null
      }
    })()
    const delId = id || body?.id
    if (!delId) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.collection("donations").deleteOne({ _id: new ObjectId(delId) })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete donation" },
      { status: 500 }
    )
  }
}


