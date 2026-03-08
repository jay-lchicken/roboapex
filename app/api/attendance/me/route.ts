import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { loadUserAttendanceFromGoogleSheet } from "@/lib/google-sheets"

async function handleRequest() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await currentUser()
  const email =
    user?.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    ""

  if (!email) {
    return NextResponse.json({ error: "No user email found." }, { status: 400 })
  }

  try {
    const result = await loadUserAttendanceFromGoogleSheet({
      email,
    })

    if (!result.found) {
      return NextResponse.json(
        { error: "No attendance row found for your email address." },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load user attendance."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return handleRequest()
}

export async function POST() {
  return handleRequest()
}
