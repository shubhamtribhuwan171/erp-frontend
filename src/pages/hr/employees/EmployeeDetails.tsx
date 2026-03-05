import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, User, Mail, Phone, Calendar, Briefcase, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { hrEmployees } from '../../../lib/hr-employees'

function formatDate(date?: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    present: 'bg-green-50 text-green-600 border border-green-100',
    absent: 'bg-red-50 text-red-600 border border-red-100',
    late: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
    leave: 'bg-blue-50 text-blue-600 border border-blue-100',
  }
  const icons: Record<string, any> = {
    present: CheckCircle,
    absent: XCircle,
    late: AlertCircle,
    leave: Clock,
  }
  const Icon = icons[status] || CheckCircle
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${colors[status] || 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
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
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/hr/employees" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="grid gap-6">
            <div className="h-40 bg-white rounded-2xl animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/hr/employees" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <span className="text-gray-500">Employee Details</span>
          </div>
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-gray-400">{error || 'Employee not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const { attendance = [], attendanceStats = {} } = employee
  const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim()

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/hr/employees" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Employee</h1>
              <p className="text-sm text-gray-400">Employee Details</p>
            </div>
          </div>

          {id && (
            <Link
              to={`/hr/employees/${id}/edit`}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Edit Employee
            </Link>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-semibold text-gray-300">{fullName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-semibold text-gray-900">{fullName}</div>
              <div className="text-gray-400 font-mono">{employee.employee_number}</div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium mt-2 ${
                employee.is_active 
                  ? 'bg-green-50 text-green-600 border border-green-100' 
                  : 'bg-gray-50 text-gray-600 border border-gray-100'
              }`}>
                {employee.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Mail size={14} /> Email
              </div>
              <div className="text-gray-700">{employee.email ?? '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Phone size={14} /> Phone
              </div>
              <div className="text-gray-700">{employee.phone ?? '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Briefcase size={14} /> Department
              </div>
              <div className="text-gray-700">{employee.department?.name ?? '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Calendar size={14} /> Join Date
              </div>
              <div className="text-gray-700">{formatDate(employee.join_date)}</div>
            </div>
          </div>

          {(employee.designation || employee.salary) && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              {employee.designation && (
                <div className="text-sm">
                  <span className="text-gray-400">Designation: </span>
                  <span className="text-gray-700">{employee.designation}</span>
                </div>
              )}
              {employee.salary && (
                <div className="text-sm">
                  <span className="text-gray-400">Salary: </span>
                  <span className="text-gray-700">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(employee.salary)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Attendance Stats */}
        {attendanceStats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="text-sm text-gray-400 mb-1">Total Days</div>
              <div className="text-2xl font-semibold text-gray-900">{attendanceStats.total}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                <CheckCircle size={16} /> Present
              </div>
              <div className="text-2xl font-semibold text-gray-900">{attendanceStats.present}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
                <XCircle size={16} /> Absent
              </div>
              <div className="text-2xl font-semibold text-gray-900">{attendanceStats.absent}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-yellow-500 text-sm mb-1">
                <AlertCircle size={16} /> Late
              </div>
              <div className="text-2xl font-semibold text-gray-900">{attendanceStats.late}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-blue-500 text-sm mb-1">
                <Clock size={16} /> On Leave
              </div>
              <div className="text-2xl font-semibold text-gray-900">{attendanceStats.leave}</div>
            </div>
          </div>
        )}

        {/* Recent Attendance */}
        {attendance.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              <h2 className="font-semibold text-gray-900">Recent Attendance</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Check In</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Check Out</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.slice(0, 15).map((record: any) => (
                  <tr key={record.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(record.attendance_date)}</td>
                    <td className="px-6 py-4"><StatusBadge status={record.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.check_in ? new Date(record.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.check_out ? new Date(record.check_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{record.notes ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       attendance.length ===  )}

        {0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <Clock size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400">No attendance records yet</p>
          </div>
        )}

      </div>
    </div>
  )
}
