import { useEffect, useState } from 'react'
import { Plus, FolderTree } from 'lucide-react'
import { hr } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function DepartmentsList() {
  const [depts, setDepts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', code: '' })

  useEffect(() => {
    fetchDepartments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDepartments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await hr.departments.list()
      setDepts(res.data.data?.departments || [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await hr.departments.create(form)
      setForm({ name: '', code: '' })
      setShowForm(false)
      fetchDepartments()
    } catch (e) {
      setError(e)
      alert(getApiErrorMessage(e))
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
          <h1 className="text-2xl font-semibold">Departments</h1>
          <p className="text-[var(--secondary)]">Organize employees</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              placeholder="Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="px-3 py-2 border rounded-lg w-32"
              required
            />
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border rounded-lg flex-1"
              required
            />
            <button type="submit" className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg">
              Save
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <div className="text-[var(--secondary)]">Loading…</div>
        ) : (
          depts.map((d) => (
            <div key={d.id} className="bg-white rounded-lg border p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FolderTree size={20} className="text-[var(--secondary)]" />
              </div>
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-xs text-[var(--secondary)]">{d.code}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
