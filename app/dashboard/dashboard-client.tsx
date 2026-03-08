"use client"

import { useEffect, useMemo, useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { parseJsonOrThrow } from "@/app/admin-dashboard/utils"

type SessionRow = {
  dateLabel: string
  attendanceStatus: string
  remarks: string
}

type UserAttendance = {
  memberId: string
  memberName: string
  className: string
  sessions: SessionRow[]
}

function renderAttendanceStatus(value: string) {
  if (value === "1") return "Present"
  if (value === "0") return "Absent"
  if (!value.trim()) return "Not marked"
  return value
}

export function DashboardClient() {
  const [dateLabel, setDateLabel] = useState("")
  const [student, setStudent] = useState<UserAttendance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadOwnAttendance() {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/attendance/me")

      const data = (await parseJsonOrThrow(response)) as {
        error?: string
        dateLabel?: string
        student?: UserAttendance
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to load attendance.")
      }

      setDateLabel(data.dateLabel?.trim() || "")
      setStudent(data.student ?? null)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load attendance."
      setError(message)
      setStudent(null)
      setDateLabel("")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOwnAttendance()
  }, [])

  const latestSessions = useMemo(() => {
    if (!student) return []
    return [...student.sessions].reverse()
  }, [student])

  const computedAttendance = useMemo(() => {
    if (!student) return { marked: 0, present: 0, percentage: "-" }

    const marked = student.sessions.filter(
      (session) => session.attendanceStatus === "1" || session.attendanceStatus === "0"
    ).length
    const present = student.sessions.filter((session) => session.attendanceStatus === "1").length

    if (marked === 0) return { marked, present, percentage: "-" }

    return {
      marked,
      present,
      percentage: `${((present / marked) * 100).toFixed(2)}%`,
    }
  }, [student])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">My Attendance</h1>
            <p className="text-sm text-muted-foreground">Robotics@APEX dashboard</p>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <div className="flex items-center justify-between rounded-xl border bg-card p-4">
          <span className="text-sm text-muted-foreground">
            {dateLabel ? `Latest sheet date: ${dateLabel}` : "Attendance history"}
          </span>
          <button
            type="button"
            onClick={() => void loadOwnAttendance()}
            className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        {student ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-semibold">{student.memberName}</p>
                <p className="text-sm text-muted-foreground">
                  ID {student.memberId} • {student.className}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">Attendance Percentage</p>
                <p className="font-semibold">{computedAttendance.percentage}</p>
                <p className="text-sm text-muted-foreground">
                  Present: {computedAttendance.present} / Marked: {computedAttendance.marked}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="border-b px-4 py-3">
                <h2 className="font-semibold">Attendance History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestSessions.map((session) => (
                      <tr key={session.dateLabel} className="border-t">
                        <td className="px-4 py-2">{session.dateLabel}</td>
                        <td className="px-4 py-2">
                          {renderAttendanceStatus(session.attendanceStatus)}
                        </td>
                        <td className="px-4 py-2">{session.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
