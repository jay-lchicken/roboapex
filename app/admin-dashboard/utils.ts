import type { AttendanceStudent } from "./types"

export function studentKey(student: Pick<AttendanceStudent, "memberId" | "memberName">): string {
  return `${student.memberId}::${student.memberName}`
}

export async function parseJsonOrThrow(response: Response) {
  const raw = await response.text()
  try {
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
  } catch {
    const snippet = raw.slice(0, 120).replace(/\s+/g, " ").trim()
    throw new Error(snippet || "Server returned a non-JSON response.")
  }
}

export function toSheetDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    day: "numeric",
    month: "long",
  }).format(date)
}

export function appendCacheBust(url: string, attempt: number): string {
  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}retry=${attempt}`
}

export function normalizePhotoUrl(rawPhotoUrl: string): string {
  const photoUrl = rawPhotoUrl.trim()
  if (!photoUrl) return ""

  if (photoUrl.startsWith("//")) {
    return `https:${photoUrl}`
  }

  if (photoUrl.startsWith("http://")) {
    return `https://${photoUrl.slice(7)}`
  }

  const driveFileMatch = photoUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (driveFileMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w200`
  }

  const driveOpenMatch = photoUrl.match(/[?&]id=([^&]+)/)
  if (photoUrl.includes("drive.google.com") && driveOpenMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${driveOpenMatch[1]}&sz=w200`
  }

  return photoUrl
}

export function normalizeAttendanceStatus(value: string): string {
  const normalized = value.trim().toLowerCase()

  if (!normalized) return ""

  if (normalized === "1" || normalized === "p" || normalized === "present") {
    return "1"
  }

  if (
    normalized === "0" ||
    normalized === "a" ||
    normalized === "absent"
  ) {
    return "0"
  }

  if (normalized === "-" || normalized === "–" || normalized === "—" || normalized === "−") {
    return ""
  }

  return value.trim()
}
