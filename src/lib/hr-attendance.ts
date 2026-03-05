import api from './api'

export type AttendanceEmployeeRow = {
  id: string
  name?: string
  department_id?: string | null
  departments?: { name?: string } | null
}

export type AttendanceMark = {
  employee_id: string
  status: 'present' | 'absent' | 'leave'
}

export const hrAttendance = {
  // Backend currently returns active employees list (attendance sheet)
  list: () => api.get('/hr/attendance'),
  mark: (payload: { date: string; records: AttendanceMark[] }) => api.post('/hr/attendance', payload),
}
