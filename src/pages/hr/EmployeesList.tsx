import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, UserCheck } from 'lucide-react'
import { hr } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function EmployeesList() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchEmployees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await hr.employees.list()
      setEmployees(res.data.data?.employees || [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(e => 
    !search || 
    (e.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.email || '').toLowerCase().includes(search.toLowerCase())
  )

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="HR" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center">
              <UserCheck size={24} className="text-gray-300" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Employees</h1>
              <p className="text-sm text-gray-400">Manage your team</p>
            </div>
          </div>
          <Link
            to="/hr/employees/new"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Employee
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Employee #</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Department</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="text-center px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-300">
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <UserCheck size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400">No employees found.</p>
                    <Link to="/hr/employees/new" className="text-sm text-gray-900 hover:underline mt-2 inline-block">
                      Add your first employee
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/hr/employees/${employee.id}`} className="font-medium text-gray-900 hover:text-gray-700">
                        {employee.full_name || `${employee.first_name} ${employee.last_name}`.trim()}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">{employee.employee_number || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{employee.department?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {employee.email && (
                          <a href={`mailto:${employee.email}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Mail size={14} className="text-gray-400" />
                          </a>
                        )}
                        {employee.phone && (
                          <a href={`tel:${employee.phone}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Phone size={14} className="text-gray-400" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${
                        employee.is_active !== false 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {employee.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/hr/employees/${employee.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye size={16} className="text-gray-400" />
                        </Link>
                        <Link to={`/hr/employees/${employee.id}/edit`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                          <Edit size={16} className="text-gray-400" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
