import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getRoleFromSessionClaims } from "@/lib/auth-role"
import { loadAttendanceFromGoogleSheet } from "@/lib/google-sheets"

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
    dateLabel?: string
  }
  console.log(parsed.dateLabel)

  if (!parsed.batchId) {
    return NextResponse.json({ error: "batchId is required." }, { status: 400 })
  }

  try {
    const result = await loadAttendanceFromGoogleSheet({
      batchId: parsed.batchId,
      dateLabel: parsed.dateLabel,
    })
    console.log(result)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load attendance."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
