// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getRoleFromSessionClaims } from "@/lib/auth-role"

const isProtectedRoute = createRouteMatcher(["/((?!$|login$|signup$|no-access$).*)"])
const isAttendanceRoute = createRouteMatcher(["/admin-dashboard(.*)"])
const isAttendanceApiRoute = createRouteMatcher(["/api/attendance/(.*)"])
const isRoleManagementRoute = createRouteMatcher([
  "/admin-dashboard/takers(.*)",
  "/api/admin/users/role(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()
  const role = getRoleFromSessionClaims(sessionClaims)
  const isAdmin = role === "admin"
  const isTaker = role === "taker"
  const canTakeAttendance = isAdmin || isTaker

  if (isProtectedRoute(req) && !userId) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  if (isRoleManagementRoute(req) && !isAdmin) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const noAccessUrl = new URL("/no-access", req.url)
    return NextResponse.redirect(noAccessUrl)
  }

  if ((isAttendanceRoute(req) || isAttendanceApiRoute(req)) && !canTakeAttendance) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const noAccessUrl = new URL("/no-access", req.url)
    return NextResponse.redirect(noAccessUrl)
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    "/(api|trpc)(.*)",
  ],
}
