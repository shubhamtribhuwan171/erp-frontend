import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { inventory } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function UnitsList() {
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', code: '' })

  useEffect(() => {
    fetchUnits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUnits = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await inventory.units.list()
      setUnits(res.data.data || [])
    } catch (e) {
      console.error(e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await inventory.units.create(form)
      setForm({ name: '', code: '' })
      setShowForm(false)
      fetchUnits()
    } catch (e) {
      setError(e)
      alert(getApiErrorMessage(e))
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Inventory" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Units</h1>
          <p className="text-[var(--text-secondary)]">Manage units of measure</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Unit
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              placeholder="Code (e.g., PCS)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Name (e.g., Pieces)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border rounded-lg flex-1"
              required
            />
            <button type="submit" className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg">
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <div className="text-[var(--text-secondary)]">Loading…</div>
        ) : (
          units.map((u) => (
            <div key={u.id} className="bg-white rounded-lg border p-4">
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-[var(--secondary)]">{u.code}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
