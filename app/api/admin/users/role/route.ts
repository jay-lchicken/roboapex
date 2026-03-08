import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getRoleFromSessionClaims } from "@/lib/auth-role"

type RoleValue = "admin" | "taker" | ""

export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const actorRole = getRoleFromSessionClaims(sessionClaims)
  if (actorRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const parsed = body as { userId?: string; role?: RoleValue }
  if (!parsed.userId || !["admin", "taker", ""].includes(parsed.role || "")) {
    return NextResponse.json(
      { error: "userId and a valid role are required." },
      { status: 400 }
    )
  }

  try {
    const client = await clerkClient()
    const targetUser = await client.users.getUser(parsed.userId)
    const role = parsed.role || null

    await client.users.updateUserMetadata(parsed.userId, {
      publicMetadata: {
        ...targetUser.publicMetadata,
        role,
      },
    })

    return NextResponse.json({ ok: true, role: role ?? "" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update role."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
