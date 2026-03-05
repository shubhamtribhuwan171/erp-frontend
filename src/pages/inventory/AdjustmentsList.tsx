import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw, SlidersHorizontal } from 'lucide-react'
import { inventoryMovementsApi } from '../../lib/inventory-movements'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

function formatDate(value?: string) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-IN')
}

export default function AdjustmentsList() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [adjustments, setAdjustments] = useState<any[]>([])

  const fetchData = async () => {
    const res = await inventoryMovementsApi.transactions.list()
    const txns: any[] = res.data.data?.transactions || []
    const adj = txns.filter((t) => String(t.txn_type || '').startsWith('adjustment_'))
    setAdjustments(adj)
  }

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      await fetchData()
    } catch (e) {
      console.error('Failed to load adjustments', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = useMemo(() => adjustments.length, [adjustments.length])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Inventory" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Adjustments</h1>
          <p className="text-[var(--text-secondary)]">Recent stock adjustments ({total})</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="px-3 py-2 border border-[var(--border)] rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <Link
            to="/inventory/adjustments/new"
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            New Adjustment
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Item</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Warehouse</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Qty Change</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-strong)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--secondary)]">
                  Loading…
                </td>
              </tr>
            ) : adjustments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--secondary)]">
                  No adjustments found.{' '}
                  <Link to="/inventory/adjustments/new" className="text-[var(--primary)] hover:underline">
                    Record one
                  </Link>
                </td>
              </tr>
            ) : (
              adjustments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{formatDate(a.txn_date || a.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{a.txn_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.item?.name || '-'}</div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono">{a.item?.sku || a.item_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.warehouse?.name || '-'}</div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono">{a.warehouse?.code || a.warehouse_id}</div>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${Number(a.qty) < 0 ? 'text-[var(--danger)]' : 'text-green-700'}`}>
                    {Number(a.qty).toLocaleString('en-IN')} {a.unit?.code || a.unit?.name || ''}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{a.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-[var(--text-secondary)]">Note: adjustments are derived from the transactions log (txn_type = adjustment_in/adjustment_out).</div>
    </div>
  )
}
