import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowRightLeft, RefreshCw } from 'lucide-react'
import { inventoryMovementsApi } from '../../lib/inventory-movements'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

function formatDate(value?: string) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-IN')
}

type TransferRow = {
  transfer_id: string
  created_at?: string
  item_name?: string
  item_sku?: string
  qty?: number
  unit_code?: string
  from_warehouse_name?: string
  to_warehouse_name?: string
  notes?: string
}

export default function TransfersList() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [rows, setRows] = useState<TransferRow[]>([])

  const fetchData = async () => {
    const res = await inventoryMovementsApi.transactions.list()
    const txns: any[] = res.data.data?.transactions || []

    // Backend creates two records (transfer_out + transfer_in) with the same reference_id
    const transfers = txns.filter((t) => t.reference_type === 'transfer' && t.reference_id)

    const byId = new Map<string, any[]>()
    for (const t of transfers) {
      const id = String(t.reference_id)
      byId.set(id, [...(byId.get(id) || []), t])
    }

    const grouped: TransferRow[] = Array.from(byId.entries()).map(([transfer_id, group]) => {
      const outTxn = group.find((t) => t.txn_type === 'transfer_out') || group.find((t) => Number(t.qty) < 0)
      const inTxn = group.find((t) => t.txn_type === 'transfer_in') || group.find((t) => Number(t.qty) > 0)
      const anyTxn = group[0]

      const qty = inTxn ? Number(inTxn.qty) : outTxn ? Math.abs(Number(outTxn.qty)) : undefined

      return {
        transfer_id,
        created_at: anyTxn.txn_date || anyTxn.created_at,
        item_name: anyTxn.item?.name,
        item_sku: anyTxn.item?.sku,
        qty,
        unit_code: anyTxn.unit?.code || anyTxn.unit?.name,
        from_warehouse_name: outTxn?.warehouse?.name,
        to_warehouse_name: inTxn?.warehouse?.name,
        notes: anyTxn.notes,
      }
    })

    grouped.sort((a, b) => (a.created_at && b.created_at ? (a.created_at < b.created_at ? 1 : -1) : 0))
    setRows(grouped)
  }

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      await fetchData()
    } catch (e) {
      console.error('Failed to load transfers', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = useMemo(() => rows.length, [rows.length])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Inventory" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transfers</h1>
          <p className="text-[var(--text-secondary)]">Recent stock transfers ({total})</p>
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
            to="/inventory/transfers/new"
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            New Transfer
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Transfer</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Item</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Route</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Qty</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-strong)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--secondary)]">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--secondary)]">
                  No transfers found.{' '}
                  <Link to="/inventory/transfers/new" className="text-[var(--primary)] hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.transfer_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ArrowRightLeft size={16} className="text-[var(--primary)]" />
                      </span>
                      <div>
                        <div className="font-medium">Transfer</div>
                        <div className="text-xs text-[var(--text-secondary)] font-mono">{r.transfer_id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.item_name || '-'}</div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono">{r.item_sku || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium">{r.from_warehouse_name || '-'} → {r.to_warehouse_name || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {r.qty !== undefined ? r.qty.toLocaleString('en-IN') : '-'} {r.unit_code || ''}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{r.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-[var(--text-secondary)]">
        Note: transfers are derived from the transactions log (grouped by reference_id).
      </div>
    </div>
  )
}
