import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Loader2, ArrowRightLeft } from 'lucide-react'
import { inventory } from '../../lib/api'
import { inventoryMovementsApi } from '../../lib/inventory-movements'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function TransferCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  const [items, setItems] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])

  const [form, setForm] = useState({
    from_warehouse_id: '',
    to_warehouse_id: '',
    item_id: '',
    qty: '',
    unit_id: '',
    notes: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true)
      setError(null)
      try {
        const [itemsRes, whRes, unitRes] = await Promise.all([
          inventory.items.list(),
          inventory.warehouses.list(),
          inventory.units.list(),
        ])
        setItems(itemsRes.data.data?.items || [])
        setWarehouses(whRes.data.data || [])
        setUnits(unitRes.data.data || [])
      } catch (e) {
        console.error('Failed to load transfer form data', e)
        setError(e)
      } finally {
        setPageLoading(false)
      }
    }
    fetchData()
  }, [])

  const canSubmit = useMemo(() => {
    return (
      !!form.from_warehouse_id &&
      !!form.to_warehouse_id &&
      !!form.item_id &&
      !!form.unit_id &&
      !!form.qty &&
      form.from_warehouse_id !== form.to_warehouse_id
    )
  }, [form])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const qty = Number(form.qty)
      if (!Number.isFinite(qty) || qty <= 0) {
        alert('Quantity must be a positive number')
        return
      }

      if (form.from_warehouse_id === form.to_warehouse_id) {
        alert('Source and destination warehouses must be different')
        return
      }

      await inventoryMovementsApi.transfers.create({
        from_warehouse_id: form.from_warehouse_id,
        to_warehouse_id: form.to_warehouse_id,
        item_id: form.item_id,
        qty,
        unit_id: form.unit_id,
        notes: form.notes || undefined,
      })

      navigate('/inventory/transfers')
    } catch (e) {
      console.error('Failed to create transfer', e)
      setError(e)
      alert(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Inventory" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/inventory/transfers')}
        className="flex items-center gap-2 text-[var(--secondary)] hover:text-[var(--text-primary)] mb-4"
      >
        <ArrowLeft size={18} />
        Back to Transfers
      </button>

      <div className="bg-white rounded-lg border border-[var(--border)]">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="text-[var(--primary)]" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">New Transfer</h1>
              <p className="text-sm text-[var(--text-secondary)]">Move stock between warehouses</p>
            </div>
          </div>
        </div>

        {pageLoading ? (
          <div className="p-6 text-[var(--text-secondary)]">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">From Warehouse *</label>
                <select
                  value={form.from_warehouse_id}
                  onChange={(e) => setForm({ ...form, from_warehouse_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code ? `${w.code} — ` : ''}{w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">To Warehouse *</label>
                <select
                  value={form.to_warehouse_id}
                  onChange={(e) => setForm({ ...form, to_warehouse_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code ? `${w.code} — ` : ''}{w.name}
                    </option>
                  ))}
                </select>
                {form.from_warehouse_id && form.to_warehouse_id && form.from_warehouse_id === form.to_warehouse_id ? (
                  <div className="text-xs text-[var(--danger)] mt-1">Must be different from the source warehouse.</div>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Item *</label>
                <select
                  value={form.item_id}
                  onChange={(e) => setForm({ ...form, item_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                >
                  <option value="">Select item</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.sku ? `${it.sku} — ` : ''}{it.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input
                  type="number"
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="1"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unit *</label>
                <select
                  value={form.unit_id}
                  onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                >
                  <option value="">Select unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  rows={3}
                  placeholder="Reason, reference, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => navigate('/inventory/transfers')}
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? 'Saving...' : 'Create Transfer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
