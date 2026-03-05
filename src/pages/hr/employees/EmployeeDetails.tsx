import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, User, Mail, Phone, Calendar, Briefcase, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { hrEmployees } from '../../../lib/hr-employees'

function formatDate(date?: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700',
    leave: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
  }
  const icons: Record<string, any> = {
    present: CheckCircle,
    absent: XCircle,
    late: AlertCircle,
    leave: Clock,
  }
  const Icon = icons[status] || CheckCircle
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      <Icon size={12} /> {status}
    </span>
  )
}

export default function EmployeeDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await hrEmployees.get(id)
        setEmployee(res.data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load employee')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/hr/employees" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Employee</h1>
            <p className="text-[var(--text-secondary)]">Employee details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
          Loading...
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/hr/employees" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Employee</h1>
            <p className="text-[var(--text-secondary)]">Employee details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-red-600">
          {error || 'Employee not found'}
        </div>
      </div>
    )
  }

  const { attendance = [], attendanceStats = {} } = employee
  const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/hr/employees" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Employee</h1>
            <p className="text-[var(--text-secondary)]">Employee details</p>
          </div>
        </div>

        {id && (
          <Link
            to={`/hr/employees/${id}/edit`}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Edit size={18} />
            Edit
          </Link>
        )}
      </div>

      {/* Basic Info Card */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xl font-semibold">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-2xl font-semibold">{fullName}</div>
              <div className="text-[var(--text-secondary)] font-mono">{employee.employee_number}</div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs capitalize mt-1 ${employee.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {employee.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {/* Email */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Mail size={14} /> Email
            </div>
            <div className="font-medium mt-1">{employee.email ?? '-'}</div>
          </div>

          {/* Phone */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Phone size={14} /> Phone
            </div>
            <div className="font-medium mt-1">{employee.phone ?? '-'}</div>
          </div>

          {/* Department */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Briefcase size={14} /> Department
            </div>
            <div className="font-medium mt-1">{employee.department?.name ?? '-'}</div>
            <div className="text-xs text-[var(--text-secondary)]">{employee.department?.code ?? ''}</div>
          </div>

          {/* Designation */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <User size={14} /> Designation
            </div>
            <div className="font-medium mt-1">{employee.designation ?? '-'}</div>
          </div>

          {/* Join Date */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Calendar size={14} /> Join Date
            </div>
            <div className="font-medium mt-1">{formatDate(employee.join_date)}</div>
          </div>

          {/* Salary */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Briefcase size={14} /> Salary
            </div>
            <div className="font-medium mt-1">
              {employee.salary ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(employee.salary) : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Stats */}
      {attendanceStats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="text-[var(--text-secondary)] text-xs">Total Days</div>
            <div className="text-lg font-semibold mt-1">{attendanceStats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-green-600 text-xs">
              <CheckCircle size={14} /> Present
            </div>
            <div className="text-lg font-semibold mt-1 text-green-600">{attendanceStats.present}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-red-600 text-xs">
              <XCircle size={14} /> Absent
            </div>
            <div className="text-lg font-semibold mt-1 text-red-600">{attendanceStats.absent}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-yellow-600 text-xs">
              <AlertCircle size={14} /> Late
            </div>
            <div className="text-lg font-semibold mt-1 text-yellow-600">{attendanceStats.late}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-blue-600 text-xs">
              <Clock size={14} /> On Leave
            </div>
            <div className="text-lg font-semibold mt-1 text-blue-600">{attendanceStats.leave}</div>
          </div>
        </div>
      )}

      {/* Recent Attendance */}
      {attendance.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[var(--secondary)]" />
              <h2 className="font-semibold">Recent Attendance</h2>
            </div>
            <Link to="/hr/attendance" className="text-sm text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[var(--text-secondary)]">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Check In</th>
                  <th className="text-left px-4 py-2 font-medium">Check Out</th>
                  <th className="text-left px-4 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 15).map((record: any) => (
                  <tr key={record.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                    <td className="px-4 py-2">{formatDate(record.attendance_date)}</td>
                    <td className="px-4 py-2"><StatusBadge status={record.status} /></td>
                    <td className="px-4 py-2">{record.check_in ? new Date(record.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-4 py-2">{record.check_out ? new Date(record.check_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-4 py-2 text-[var(--text-secondary)]">{record.notes ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty Attendance State */}
      {attendance.length === 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--text-secondary)]">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p>No attendance records yet</p>
        </div>
      )}
    </div>
  )
}
