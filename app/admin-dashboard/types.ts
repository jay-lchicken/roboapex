export type AttendanceStudent = {
  memberId: string
  memberName: string
  className: string
  classRegNo: string
  gender: string
  email: string
  attendanceStatus: string
  remarks: string
  photo: string
}

export type AttendanceEditableFields = Pick<AttendanceStudent, "attendanceStatus" | "remarks">
