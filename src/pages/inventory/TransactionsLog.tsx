import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, RefreshCw, ArrowRightLeft, SlidersHorizontal } from 'lucide-react'
import { inventory } from '../../lib/api'
import { inventoryMovementsApi } from '../../lib/inventory-movements'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

function formatDate(value?: string) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-IN')
}

function formatQty(qty: any) {
  if (qty === null || qty === undefined) return '-'
  const n = Number(qty)
  if (Number.isNaN(n)) return String(qty)
  return n.toLocaleString('en-IN')
}

export default function TransactionsLog() {
  const [items, setItems] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  const [filters, setFilters] = useState({
    item_id: '',
    warehouse_id: '',
  })

  const params = useMemo(
    () => ({
      item_id: filters.item_id || undefined,
      warehouse_id: filters.warehouse_id || undefined,
    }),
    [filters]
  )

  const [transactions, setTransactions] = useState<any[]>([])

  const fetchMasterData = async () => {
    const [itemsRes, whRes] = await Promise.all([inventory.items.list(), inventory.warehouses.list()])
    setItems(itemsRes.data.data?.items || [])
    setWarehouses(whRes.data.data || [])
  }

  const fetchTransactions = async () => {
    const res = await inventoryMovementsApi.transactions.list(params)
    setTransactions(res.data.data?.transactions || [])
  }

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      await fetchMasterData()
      await fetchTransactions()
    } catch (e) {
      console.error('Failed to load transactions', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        await fetchTransactions()
      } catch (e) {
        console.error('Failed to load transactions', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.item_id, params.warehouse_id])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Inventory" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-[var(--text-secondary)]">Stock movement log (latest 100)</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/inventory/transfers"
            className="px-3 py-2 border border-[var(--border)] rounded-lg hover:bg-gray-50 flex items-center gap-2"
            title="Transfers"
          >
            <ArrowRightLeft size={18} />
            Transfers
          </Link>
          <Link
            to="/inventory/adjustments"
            className="px-3 py-2 border border-[var(--border)] rounded-lg hover:bg-gray-50 flex items-center gap-2"
            title="Adjustments"
          >
            <SlidersHorizontal size={18} />
            Adjustments
          </Link>
          <button
            onClick={refresh}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Filter size={18} />
            <span className="text-sm">Filters</span>
          </div>

          <div className="min-w-[220px]">
            <select
              value={filters.item_id}
              onChange={(e) => setFilters({ ...filters, item_id: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="">All items</option>
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.sku ? `${it.sku} — ` : ''}{it.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[220px]">
            <select
              value={filters.warehouse_id}
              onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="">All warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code ? `${w.code} — ` : ''}{w.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setFilters({ item_id: '', warehouse_id: '' })}
            className="px-3 py-2 border border-[var(--border)] rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
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
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Qty</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Unit</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Reference</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-strong)]">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--secondary)]">
                  Loading…
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--secondary)]">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{formatDate(t.txn_date || t.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{t.txn_type || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{t.item?.name || '-'}</div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono">{t.item?.sku || t.item_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{t.warehouse?.name || '-'}</div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono">{t.warehouse?.code || t.warehouse_id}</div>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${Number(t.qty) < 0 ? 'text-[var(--danger)]' : 'text-green-700'}`}>
                    {formatQty(t.qty)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{t.unit?.code || t.unit?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {t.reference_type ? (
                      <span className="text-[var(--text-secondary)]">
                        {t.reference_type}
                        {t.reference_id ? <span className="font-mono"> #{String(t.reference_id).slice(0, 8)}</span> : null}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{t.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
