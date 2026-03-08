import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getRoleFromSessionClaims } from "@/lib/auth-role"
import { pushAttendanceToGoogleSheet } from "@/lib/google-sheets"

export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const role = getRoleFromSessionClaims(sessionClaims)
  if (role !== "admin" && role !== "taker") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const parsed = body as {
    batchId?: string
    batchLevel?: string
    dateLabel?: string
    records?: unknown[]
  }

  if (!parsed.batchId || !parsed.batchLevel || !Array.isArray(parsed.records)) {
    return NextResponse.json(
      { error: "batchId, batchLevel and records are required." },
      { status: 400 }
    )
  }

  try {
    const result = await pushAttendanceToGoogleSheet({
      batchId: parsed.batchId,
      batchLevel: parsed.batchLevel,
      dateLabel: parsed.dateLabel,
      records: parsed.records as {
        memberId: string
        memberName: string
        level: string
        attendanceStatus: string
        excuseType: string
      }[],
    })

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sync attendance."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
