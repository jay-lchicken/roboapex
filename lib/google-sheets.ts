type AttendanceRecord = {
  memberId: string
  memberName: string
  level: string
  attendanceStatus: string
  excuseType: string
}

export type GoogleSheetSyncPayload = {
  batchId: string
  batchLevel: string
  dateLabel?: string
  records: AttendanceRecord[]
}

export type AttendanceStudent = {
  memberId: string
  memberName: string
  className: string
  classRegNo: string
  gender: string
  email: string
  absenteeFormStatus: string
  attendanceStatus: string
  remarks: string
  photo: string
}

export type GoogleSheetLoadPayload = {
  batchId: string
  dateLabel?: string
}

export type UserAttendanceSession = {
  dateLabel: string
  attendanceStatus: string
  remarks: string
}

export type UserAttendance = {
  memberId: string
  memberName: string
  className: string
  classRegNo: string
  gender: string
  email: string
  absenteeFormStatus: string
  attendanceStatus: string
  remarks: string
  percentageTerm: string
  percentageTotal: string
  sessions: UserAttendanceSession[]
}

export type GoogleSheetUserLoadPayload = {
  email: string
  dateLabel?: string
}

export async function pushAttendanceToGoogleSheet(payload: GoogleSheetSyncPayload) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error("GOOGLE_SHEETS_WEBHOOK_URL is not configured.")
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET ?? "",
      ...payload,
      submittedAt: new Date().toISOString(),
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || "Google Sheets webhook request failed.")
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return response.json()
  }

  return { ok: true }
}

type LoadWebhookResponse = {
  students?: unknown[]
  rows?: Record<string, unknown>[]
  dateLabel?: string
  error?: unknown
  message?: unknown
}

function asString(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

function normalizeAttendanceStatus(value: unknown): string {
  const raw = asString(value)
  const normalized = raw.toLowerCase()

  if (!normalized) return "-"

  if (
    normalized === "1" ||
    normalized === "p" ||
    normalized === "present"
  ) {
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
    return "-"
  }

  return raw
}

export async function loadAttendanceFromGoogleSheet(payload: GoogleSheetLoadPayload) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error("GOOGLE_SHEETS_WEBHOOK_URL is not configured.")
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET ?? "",
      action: "loadAttendance",
      ...payload,
      submittedAt: new Date().toISOString(),
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || "Google Sheets load request failed.")
  }

  const data = (await response.json()) as LoadWebhookResponse
  const webhookError = asString(data.error ?? data.message)
  if (webhookError) {
    throw new Error(webhookError)
  }

  const rawRows = Array.isArray(data.students)
    ? data.students
    : Array.isArray(data.rows)
      ? data.rows
      : []

  const students: AttendanceStudent[] = rawRows
    .map((row) => {
      const item = row as Record<string, unknown>
      return {
        memberId: asString(item.memberId ?? item["No."] ?? item.no),
        memberName: asString(item.memberName ?? item.Name ?? item.name),
        className: asString(item.className ?? item.Class ?? item.class),
        classRegNo: asString(item.classRegNo ?? item["Class Reg. No"] ?? item.classRegNo),
        gender: asString(item.gender ?? item.Gender),
        email: asString(item.email ?? item.Email),
        absenteeFormStatus: asString(
          item.absenteeFormStatus ?? item.absenceFormStatus ?? item.absenceStatus ?? ""
        ),
        attendanceStatus: normalizeAttendanceStatus(
          item.attendanceStatus ?? item.status ?? item.currentAttendance ?? ""
        ),
        remarks: asString(item.remarks ?? item.Remarks ?? item.currentRemarks ?? ""),
        photo: asString(item.photo ?? item.Photo)
      }
    })
    .filter((student) => student.memberId.length > 0 && student.memberName.length > 0)

  return {
    dateLabel: asString(data.dateLabel),
    students,
  }
}

type UserLoadWebhookResponse = {
  ok?: unknown
  found?: unknown
  dateLabel?: unknown
  student?: unknown
  error?: unknown
  message?: unknown
}

export async function loadUserAttendanceFromGoogleSheet(payload: GoogleSheetUserLoadPayload) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error("GOOGLE_SHEETS_WEBHOOK_URL is not configured.")
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET ?? "",
      action: "loadUserAttendance",
      ...payload,
      submittedAt: new Date().toISOString(),
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || "Google Sheets user load request failed.")
  }

  const data = (await response.json()) as UserLoadWebhookResponse
  const webhookError = asString(data.error ?? data.message)
  if (webhookError) {
    throw new Error(webhookError)
  }

  const found = Boolean(data.found)
  if (!found) {
    return {
      found: false,
      dateLabel: asString(data.dateLabel),
      student: null,
    }
  }

  const raw = (data.student ?? {}) as Record<string, unknown>
  const rawSessions = Array.isArray(raw.sessions) ? raw.sessions : []

  const sessions: UserAttendanceSession[] = rawSessions.map((entry) => {
    const item = entry as Record<string, unknown>
    return {
      dateLabel: asString(item.dateLabel),
      attendanceStatus: normalizeAttendanceStatus(item.attendanceStatus),
      remarks: asString(item.remarks),
    }
  })

  const student: UserAttendance = {
    memberId: asString(raw.memberId ?? raw["No."] ?? raw.no),
    memberName: asString(raw.memberName ?? raw.Name ?? raw.name),
    className: asString(raw.className ?? raw.Class ?? raw.class),
    classRegNo: asString(raw.classRegNo ?? raw["Class Reg. No"] ?? raw.classRegNo),
    gender: asString(raw.gender ?? raw.Gender),
    email: asString(raw.email ?? raw.Email),
    absenteeFormStatus: asString(
      raw.absenteeFormStatus ?? raw.absenceFormStatus ?? raw.absenceStatus ?? ""
    ),
    attendanceStatus: normalizeAttendanceStatus(
      raw.attendanceStatus ?? raw.status ?? raw.currentAttendance ?? ""
    ),
    remarks: asString(raw.remarks ?? raw.Remarks ?? raw.currentRemarks ?? ""),
    percentageTerm: asString(raw.percentageTerm ?? raw["Percentage (Term)"]),
    percentageTotal: asString(raw.percentageTotal ?? raw["Percentage (Total)"]),
    sessions,
  }

  return {
    found: true,
    dateLabel: asString(data.dateLabel),
    student,
  }
}
