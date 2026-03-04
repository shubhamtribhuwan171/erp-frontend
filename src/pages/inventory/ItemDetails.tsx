import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Boxes } from 'lucide-react'
import { inventory } from '../../lib/api'

function formatCurrency(minor?: number | null) {
  if (minor === null || minor === undefined) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(minor / 100)
}

export default function ItemDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await inventory.items.get(id)
        setItem(res.data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load item')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const totalStock = useMemo(() => {
    const rows: any[] = Array.isArray(item?.stock) ? item.stock : []
    return rows.reduce((sum, r) => sum + (Number(r.qty_on_hand ?? r.on_hand ?? 0) || 0), 0)
  }, [item?.stock])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/inventory/items" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Item</h1>
            <p className="text-[var(--text-secondary)]">Item details</p>
          </div>
        </div>

        {id && (
          <Link
            to={`/inventory/items/${id}/edit`}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Edit size={18} />
            Edit
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        {loading ? (
          <div className="py-8 text-center text-[var(--secondary)]">Loading…</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">{error}</div>
        ) : !item ? (
          <div className="py-8 text-center text-[var(--secondary)]">Item not found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[var(--text-secondary)]">Name</div>
              <div className="font-semibold text-base">{item.name ?? '-'}</div>
              <div className="text-[var(--text-secondary)] font-mono">{item.sku ?? ''}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Category</div>
              <div className="font-medium">{item.category?.name ?? '-'}</div>
              <div className="text-[var(--text-secondary)]">Unit</div>
              <div className="font-medium">{item.unit?.code ?? item.unit?.name ?? '-'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Pricing</div>
              <div className="font-medium">Cost: {formatCurrency(item.standard_cost_minor)}</div>
              <div className="font-medium">Price: {formatCurrency(item.sale_price_minor)}</div>
              <div className="text-[var(--text-secondary)] mt-2">On hand</div>
              <div className="font-semibold">{totalStock}</div>
            </div>
          </div>
        )}
      </div>

      {!loading && !error && item && (
        <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-strong)]">
            <div className="flex items-center gap-2">
              <Boxes size={18} className="text-[var(--secondary)]" />
              <h2 className="font-semibold">Stock by Warehouse</h2>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Warehouse</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">On hand</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Reserved</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-strong)]">
              {Array.isArray(item.stock) && item.stock.length ? (
                item.stock.map((row: any) => {
                  const onHand = Number(row.qty_on_hand ?? row.on_hand ?? 0) || 0
                  const reserved = Number(row.qty_reserved ?? row.reserved ?? 0) || 0
                  const available = onHand - reserved
                  return (
                    <tr key={row.id ?? row.warehouse_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{row.warehouse_code ?? row.warehouse?.code ?? row.warehouse_id ?? '-'}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">{onHand}</td>
                      <td className="px-4 py-3 text-right text-sm">{reserved}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">{available}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-[var(--text-secondary)]">
                    No stock records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
