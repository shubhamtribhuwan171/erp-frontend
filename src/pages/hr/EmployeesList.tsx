import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Mail, Phone } from 'lucide-react'
import { hr } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function EmployeesList() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

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

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="HR" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-[var(--secondary)]">Manage employees</p>
        </div>
        <Link
          to="/hr/employees/new"
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Employee
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-[var(--secondary)]">Loading…</div>
        ) : employees.length === 0 ? (
          <div className="col-span-full text-center py-8 text-[var(--secondary)]">
            No employees yet
          </div>
        ) : (
          employees.map((emp) => (
            <div key={emp.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                  {emp.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <h3 className="font-semibold">{emp.name}</h3>
                  <p className="text-sm text-[var(--secondary)]">
                    {emp.job_title || 'Employee'}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-[var(--secondary)]">
                {emp.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    {emp.email}
                  </div>
                )}
                {emp.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    {emp.phone}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
