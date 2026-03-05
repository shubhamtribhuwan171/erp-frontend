import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react'
import { hrAttendance, type AttendanceEmployeeRow, type AttendanceMark } from '../../lib/hr-attendance'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function AttendancePage() {
  const [date, setDate] = useState<string>(todayISO())
  const [rows, setRows] = useState<AttendanceEmployeeRow[]>([])
  const [marks, setMarks] = useState<Record<string, AttendanceMark['status']>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    fetchSheet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSheet = async () => {
    setLoading(true)
    setError(null)
    setMessage('')
    try {
      const res = await hrAttendance.list()
      const list: AttendanceEmployeeRow[] = res.data.data?.employees || []
      setRows(list)
      const initial: Record<string, AttendanceMark['status']> = {}
      for (const e of list) initial[e.id] = 'present'
      setMarks(initial)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const recordCount = useMemo(() => Object.keys(marks).length, [marks])

  const handleSubmit = async () => {
    setSubmitting(true)
    setMessage('')
    setError(null)
    try {
      const records: AttendanceMark[] = Object.entries(marks).map(([employee_id, status]) => ({
        employee_id,
        status,
      }))
      await hrAttendance.mark({ date, records })
      setMessage('Attendance recorded')
    } catch (e) {
      setError(e)
      setMessage(getApiErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="HR" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="text-[var(--secondary)]">Daily attendance sheet</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg bg-white"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading || rows.length === 0}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {message ? (
        <div
          className={`p-4 rounded-lg border ${message.toLowerCase().includes('recorded') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
        >
          {message}
        </div>
      ) : null}

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="text-sm text-[var(--secondary)]">
            {loading ? 'Loading…' : `${rows.length} employees • ${recordCount} records`}
          </div>
          <div className="text-xs text-[var(--secondary)]">Default: Present</div>
        </div>

        {loading ? (
          <div className="p-4 text-[var(--secondary)]">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-[var(--secondary)]">No active employees</div>
        ) : (
          <div className="divide-y">
            {rows.map((e) => {
              const status = marks[e.id] || 'present'
              return (
                <div key={e.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{e.name || 'Employee'}</div>
                    <div className="text-sm text-[var(--secondary)]">
                      {e.departments?.name ? e.departments.name : 'No department'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMarks((m) => ({ ...m, [e.id]: 'present' }))}
                      className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                        status === 'present'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-white border-[var(--border)] text-[var(--secondary)]'
                      }`}
                      title="Present"
                    >
                      <CheckCircle2 size={16} /> Present
                    </button>
                    <button
                      onClick={() => setMarks((m) => ({ ...m, [e.id]: 'absent' }))}
                      className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                        status === 'absent'
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-white border-[var(--border)] text-[var(--secondary)]'
                      }`}
                      title="Absent"
                    >
                      <XCircle size={16} /> Absent
                    </button>
                    <select
                      value={status}
                      onChange={(ev) => setMarks((m) => ({ ...m, [e.id]: ev.target.value as any }))}
                      className="px-3 py-2 rounded-lg border bg-white text-sm"
                      aria-label="Status"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="leave">Leave</option>
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
