export type UserRole = "admin" | "taker"

export function getRoleFromSessionClaims(sessionClaims: unknown): UserRole | undefined {
  if (!sessionClaims || typeof sessionClaims !== "object") {
    return undefined
  }

  const metadata = (sessionClaims as { metadata?: unknown }).metadata
  if (!metadata || typeof metadata !== "object") {
    return undefined
  }

  const role = (metadata as { role?: unknown }).role
  return role === "admin" || role === "taker" ? role : undefined
}
