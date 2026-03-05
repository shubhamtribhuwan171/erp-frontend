import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Loader2, SlidersHorizontal } from 'lucide-react'
import { inventory } from '../../lib/api'
import { inventoryMovementsApi } from '../../lib/inventory-movements'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function AdjustmentCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  const [items, setItems] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])

  const [form, setForm] = useState({
    direction: 'in' as 'in' | 'out',
    item_id: '',
    warehouse_id: '',
    qty: '',
    unit_id: '',
    reason: '',
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
        console.error('Failed to load adjustment form data', e)
        setError(e)
      } finally {
        setPageLoading(false)
      }
    }
    fetchData()
  }, [])

  const canSubmit = useMemo(() => {
    return !!form.item_id && !!form.warehouse_id && !!form.unit_id && !!form.qty
  }, [form])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const qtyAbs = Number(form.qty)
      if (!Number.isFinite(qtyAbs) || qtyAbs <= 0) {
        alert('Quantity must be a positive number')
        return
      }

      const qty_change = form.direction === 'out' ? -Math.abs(qtyAbs) : Math.abs(qtyAbs)

      await inventoryMovementsApi.adjustments.create({
        item_id: form.item_id,
        warehouse_id: form.warehouse_id,
        qty_change,
        unit_id: form.unit_id,
        reason: form.reason || undefined,
      })

      navigate('/inventory/adjustments')
    } catch (e) {
      console.error('Failed to create adjustment', e)
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
        onClick={() => navigate('/inventory/adjustments')}
        className="flex items-center gap-2 text-[var(--secondary)] hover:text-[var(--text-primary)] mb-4"
      >
        <ArrowLeft size={18} />
        Back to Adjustments
      </button>

      <div className="bg-white rounded-lg border border-[var(--border)]">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <SlidersHorizontal className="text-[var(--primary)]" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">New Adjustment</h1>
              <p className="text-sm text-[var(--text-secondary)]">Record stock correction (damage, count, etc.)</p>
            </div>
          </div>
        </div>

        {pageLoading ? (
          <div className="p-6 text-[var(--text-secondary)]">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Direction *</label>
                <select
                  value={form.direction}
                  onChange={(e) => setForm({ ...form, direction: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="in">Increase (In)</option>
                  <option value="out">Decrease (Out)</option>
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
                <label className="block text-sm font-medium mb-1">Warehouse *</label>
                <select
                  value={form.warehouse_id}
                  onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
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
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  rows={3}
                  placeholder="Cycle count, damage, shrinkage, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => navigate('/inventory/adjustments')}
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
                {loading ? 'Saving...' : 'Record Adjustment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
