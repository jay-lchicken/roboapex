"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DatePicker } from "@/components/date-picker"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AttendanceTable } from "./attendance-table"
import type { AttendanceEditableFields, AttendanceStudent } from "./types"
import {
  normalizeAttendanceStatus,
  parseJsonOrThrow,
  studentKey,
  toSheetDateLabel,
} from "./utils"
import { usePersistedBatch } from "./use-persisted-batch"
import {toast} from "sonner";

const batches = ["2023 Batch", "2024 Batch", "2025 Batch", "2026 Batch"] as const

export function AdminDashboardClient() {
  const { selectedBatch, setSelectedBatch } = usePersistedBatch(batches)
  const [students, setStudents] = useState<AttendanceStudent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [dateLabel, setDateLabel] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [saveMessage, setSaveMessage] = useState("")
  const [initialRows, setInitialRows] = useState<Record<string, AttendanceStudent>>({})

  function updateStudent(
    key: string,
    patch: Partial<AttendanceEditableFields>
  ) {
    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        studentKey(student) === key
          ? {
              ...student,
              ...patch,
            }
          : student
      )
    )
  }

  async function loadAttendance(batch: string, date?: Date) {
    setIsLoading(true)
    setError("")
    setSaveError("")
    setSaveMessage("")
    const requestedDateLabel = toSheetDateLabel(date ?? new Date())

    try {
      const response = await fetch("/api/attendance/load", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batchId: batch, dateLabel: requestedDateLabel }),
      })

      const data = (await parseJsonOrThrow(response)) as {
        error?: string
        students?: AttendanceStudent[]
        dateLabel?: string
      }

      if (!response.ok) {
        toast.error("Failed to load attendance.")

        throw new Error(data.error || "Failed to load attendance.")
      }

      const loadedStudents = (Array.isArray(data.students) ? data.students : []).map((student) => ({
        ...student,
        attendanceStatus: normalizeAttendanceStatus(student.attendanceStatus),
      }))
      setStudents(loadedStudents)
      setInitialRows(
        loadedStudents.reduce<Record<string, AttendanceStudent>>((acc, student) => {
          acc[studentKey(student)] = { ...student }
          return acc
        }, {})
      )
      setDateLabel(data.dateLabel?.trim() || "")
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load attendance."
      setError(message)
      toast.error(loadError instanceof Error ? loadError.message : "Failed to load attendance.")
      setStudents([])
      setInitialRows({})
      setDateLabel(requestedDateLabel)
    } finally {
      setIsLoading(false)
    }
  }

  const hasUnsavedChanges = students.some((student) => {
    const initial = initialRows[studentKey(student)]
    if (!initial) return false
    return (
      student.attendanceStatus.trim() !== initial.attendanceStatus.trim() ||
      student.remarks.trim() !== initial.remarks.trim()
    )
  })

  async function saveChanges() {
    setSaveError("")
    setSaveMessage("")

    const changedStudents = students.filter((student) => {
      const initial = initialRows[studentKey(student)]
      if (!initial) return false
      return (
        student.attendanceStatus.trim() !== initial.attendanceStatus.trim() ||
        student.remarks.trim() !== initial.remarks.trim()
      )
    })

    if (changedStudents.length === 0) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/attendance/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchId: selectedBatch,
          batchLevel: selectedBatch,
          dateLabel,
          records: changedStudents.map((student) => ({
            memberId: student.memberId,
            memberName: student.memberName,
            level: student.className,
            attendanceStatus: normalizeAttendanceStatus(student.attendanceStatus),
            excuseType: student.remarks.trim(),
          })),
        }),
      })

      const data = (await parseJsonOrThrow(response)) as {
        error?: string
        result?: { updated?: number }
      }
      if (!response.ok) {
        toast.error("failed to sync attendance")
        throw new Error(data.error || "Failed to sync attendance.")
      }

      setInitialRows(
        students.reduce<Record<string, AttendanceStudent>>((acc, student) => {
          acc[studentKey(student)] = { ...student }
          return acc
        }, {})
      )

      const updatedCount = data.result?.updated
      setSaveMessage(
        typeof updatedCount === "number"
          ? `Synced ${updatedCount} attendance update${updatedCount === 1 ? "" : "s"}.`
          : "Attendance synced."
      )
      toast.success(typeof updatedCount === "number"
          ? `Synced ${updatedCount} attendance update${updatedCount === 1 ? "" : "s"}.`
          : "Attendance synced.")

    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : "Failed to sync attendance."
      setSaveError(message)
      toast.error( syncError instanceof Error ? syncError.message : "Failed to sync attendance.")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    void loadAttendance(selectedBatch, selectedDate)
  }, [selectedBatch, selectedDate])

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar selectedBatch={selectedBatch} onBatchChange={setSelectedBatch} />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Attendance</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{selectedBatch}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
          <div className="flex min-h-0 flex-1 flex-col rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DatePicker date={selectedDate} onChange={setSelectedDate} />
                <span className="text-sm text-muted-foreground">
                  {dateLabel ? `Sheet date: ${dateLabel}` : "Sheet date unavailable"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadAttendance(selectedBatch, selectedDate)}
                  className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Refresh"}
                </button>
                {hasUnsavedChanges ? (
                  <button
                    type="button"
                    onClick={() => void saveChanges()}
                    className="rounded-md border bg-primary px-3 py-1 text-sm text-primary-foreground hover:opacity-90"
                    disabled={isSaving || isLoading}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                ) : null}
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
            {saveMessage ? <p className="text-sm text-green-600">{saveMessage}</p> : null}

            <div className="min-h-0 flex-1">
              <AttendanceTable
                students={students}
                isLoading={isLoading}
                onUpdateStudent={updateStudent}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
