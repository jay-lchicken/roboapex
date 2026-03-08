import { StudentPhoto } from "./student-photo"
import type { AttendanceEditableFields, AttendanceStudent } from "./types"
import { normalizeAttendanceStatus, studentKey } from "./utils"

type AttendanceTableProps = {
  students: AttendanceStudent[]
  isLoading: boolean
  onUpdateStudent: (key: string, patch: Partial<AttendanceEditableFields>) => void
}

export function AttendanceTable({ students, isLoading, onUpdateStudent }: AttendanceTableProps) {
  return (
    <div className="h-full overflow-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="px-2 py-2">No.</th>
            <th className="px-2 py-2">Name</th>
            <th className="px-2 py-2">Photo</th>
            <th className="px-2 py-2">Absentee Form</th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td className="px-2 py-3 text-muted-foreground" colSpan={10}>
                Loading attendance...
              </td>
            </tr>
          ) : students.length === 0 ? (
            <tr>
              <td className="px-2 py-3 text-muted-foreground" colSpan={10}>
                No students found for this batch.
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={studentKey(student)} className="border-b">
                <td className="px-2 py-2">{student.memberId}</td>
                <td className="px-2 py-2 min-w-52">{student.memberName}</td>
                <td className="px-2 py-2 min-w-36">
                  {student.photo ? (
                    <StudentPhoto photo={student.photo} memberName={student.memberName} />
                  ) : (
                    <div className="size-28 rounded-sm bg-muted" />
                  )}
                </td>
                <td className="px-2 py-2">
                  {student.absenteeFormStatus || "-"}
                </td>
                <td className="px-2 py-2">
                  <select
                    value={normalizeAttendanceStatus(student.attendanceStatus)}
                    onChange={(event) =>
                      onUpdateStudent(studentKey(student), {
                        attendanceStatus: event.target.value,
                      })
                    }
                    className={`w-[140px] rounded-md border px-2 py-1 ${
                      normalizeAttendanceStatus(student.attendanceStatus) === "1"
                        ? "border-emerald-300 bg-emerald-50"
                        : normalizeAttendanceStatus(student.attendanceStatus) === "0"
                          ? "border-rose-300 bg-rose-50"
                          : "bg-background"
                    }`}
                  >
                    <option value="">-</option>
                    <option value="1">Present</option>
                    <option value="0">Absent</option>
                  </select>
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={student.remarks}
                    onChange={(event) =>
                      onUpdateStudent(studentKey(student), {
                        remarks: event.target.value,
                      })
                    }
                    className="w-[220px] rounded-md border bg-background px-2 py-1"
                    placeholder="Enter remarks"
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
