import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react'
import { hr } from '../../../lib/api'
import { hrEmployees, type Employee } from '../../../lib/hr-employees'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../../components/ui/RequestState'

type Dept = { id: string; name: string; code?: string }

const EMPTY: Partial<Employee> = {
  name: '',
  email: '',
  phone: '',
  job_title: '',
  status: 'active',
  department_id: null,
}

export default function EmployeeUpsertPage() {
  const params = useParams()
  const employeeId = params.id
  const isEdit = Boolean(employeeId)

  const navigate = useNavigate()

  const [employee, setEmployee] = useState<Partial<Employee>>(EMPTY)
  const [depts, setDepts] = useState<Dept[]>([])

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    fetchDeps()
    if (isEdit && employeeId) fetchEmployee(employeeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId])

  const fetchDeps = async () => {
    try {
      const res = await hr.departments.list()
      setDepts(res.data.data?.departments || [])
    } catch {
      // non-blocking
    }
  }

  const fetchEmployee = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await hrEmployees.get(id)
      setEmployee(res.data.data || {})
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = useMemo(() => {
    return Boolean(employee.name && String(employee.name).trim().length > 0)
  }, [employee.name])

  const handleSave = async () => {
    if (!canSubmit) return

    setSaving(true)
    setMessage('')
    setError(null)
    try {
      if (isEdit && employeeId) {
        await hrEmployees.update(employeeId, employee)
        setMessage('Employee updated')
      } else {
        await hr.employees.create(employee)
        setMessage('Employee created')
        navigate('/hr/employees')
      }
    } catch (e) {
      setError(e)
      setMessage(getApiErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!employeeId) return
    const ok = confirm('Delete this employee?')
    if (!ok) return

    setDeleting(true)
    setError(null)
    setMessage('')
    try {
      await hrEmployees.delete(employeeId)
      navigate('/hr/employees')
    } catch (e) {
      setError(e)
      setMessage(getApiErrorMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="HR" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  if (loading) {
    return <div className="text-[var(--secondary)]">Loading…</div>
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-[var(--secondary)]">
            <Link to="/hr/employees" className="inline-flex items-center gap-2 hover:underline">
              <ArrowLeft size={16} /> Employees
            </Link>
          </div>
          <h1 className="text-2xl font-semibold">{isEdit ? 'Employee' : 'New Employee'}</h1>
          <p className="text-[var(--secondary)]">{isEdit ? 'View and edit employee profile' : 'Create an employee profile'}</p>
        </div>

        <div className="flex items-center gap-2">
          {isEdit ? (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              className="px-4 py-2 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 flex items-center gap-2"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete
            </button>
          ) : null}
          <button
            onClick={handleSave}
            disabled={!canSubmit || saving || deleting}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {message ? (
        <div
          className={`p-4 rounded-lg border ${message.toLowerCase().includes('updated') || message.toLowerCase().includes('created') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
        >
          {message}
        </div>
      ) : null}

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              value={employee.name || ''}
              onChange={(e) => setEmployee((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Job Title</label>
            <input
              value={employee.job_title || ''}
              onChange={(e) => setEmployee((p) => ({ ...p, job_title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., Accountant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={employee.email || ''}
              onChange={(e) => setEmployee((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              value={employee.phone || ''}
              onChange={(e) => setEmployee((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="+91…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={employee.department_id || ''}
              onChange={(e) =>
                setEmployee((p) => ({ ...p, department_id: e.target.value ? e.target.value : null }))
              }
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Unassigned</option>
              {depts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={employee.status || 'active'}
              onChange={(e) => setEmployee((p) => ({ ...p, status: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isEdit && employeeId ? (
          <div className="pt-4 border-t text-sm text-[var(--secondary)]">
            Employee ID: <span className="font-mono">{employeeId}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
