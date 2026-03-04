import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Package } from 'lucide-react'
import { purchases } from '../../lib/api'

function formatCurrency(minor?: number | null) {
  if (minor === null || minor === undefined) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(minor / 100)
}

function formatDate(date?: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PurchaseOrderDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [po, setPo] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await purchases.orders.get(id)
        setPo(res.data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load purchase order')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const statusBadge = useMemo(() => {
    const s = String(po?.status ?? '').toLowerCase()
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      approved: 'bg-blue-100 text-blue-700',
      sent: 'bg-purple-100 text-purple-700',
      part_received: 'bg-yellow-100 text-yellow-700',
      closed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return map[s] ?? 'bg-gray-100 text-gray-700'
  }, [po?.status])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/purchases/orders" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Purchase Order</h1>
            <p className="text-[var(--text-secondary)]">PO details</p>
          </div>
        </div>

        {id && (
          <Link
            to={`/purchases/orders/${id}/edit`}
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
        ) : !po ? (
          <div className="py-8 text-center text-[var(--secondary)]">Purchase order not found</div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-[var(--text-secondary)]">PO #</div>
                <div className="font-mono text-lg">{po.po_no ?? po.order_no ?? po.id}</div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs capitalize ${statusBadge}`}>
                {po.status ?? 'draft'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-[var(--text-secondary)]">Vendor</div>
                <div className="font-medium">{po.vendor?.name ?? 'N/A'}</div>
                <div className="text-[var(--text-secondary)]">{po.vendor?.email ?? ''}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)]">Order Date</div>
                <div className="font-medium">{formatDate(po.order_date)}</div>
                <div className="text-[var(--text-secondary)]">Expected Receipt</div>
                <div className="font-medium">{formatDate(po.expected_receipt_date)}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)]">Total</div>
                <div className="font-semibold">{formatCurrency(po.total_minor)}</div>
                <div className="text-[var(--text-secondary)]">Items</div>
                <div className="font-medium">{Array.isArray(po.items) ? po.items.length : 0}</div>
              </div>
            </div>

            {po.notes && (
              <div className="text-sm">
                <div className="text-[var(--text-secondary)]">Notes</div>
                <div className="mt-1 whitespace-pre-wrap">{po.notes}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && !error && po && (
        <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-strong)]">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-[var(--secondary)]" />
              <h2 className="font-semibold">Line Items</h2>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Item</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">SKU</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Qty</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Rate</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-strong)]">
              {Array.isArray(po.items) && po.items.length ? (
                po.items.map((it: any) => (
                  <tr key={it.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{it.item?.name ?? '-'}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{it.unit?.code ?? it.unit?.name ?? ''}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)] font-mono">{it.item?.sku ?? '-'}</td>
                    <td className="px-4 py-3 text-right text-sm">{it.qty ?? it.quantity ?? '-'}</td>
                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(it.rate_minor ?? it.unit_price_minor)}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(it.amount_minor ?? it.line_total_minor)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[var(--text-secondary)]">
                    No items
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
