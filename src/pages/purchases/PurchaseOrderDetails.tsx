import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Package, Receipt as ReceiptIcon, FileText, User, Calendar, MapPin, DollarSign } from 'lucide-react'
import { purchases } from '../../lib/api'

function formatCurrency(minor?: number | null) {
  if (minor === null || minor === undefined) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(minor / 100)
}

function formatDate(date?: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    approved: 'bg-blue-100 text-blue-700',
    sent: 'bg-purple-100 text-purple-700',
    confirmed: 'bg-blue-100 text-blue-700',
    partial: 'bg-yellow-100 text-yellow-700',
    part_received: 'bg-yellow-100 text-yellow-700',
    received: 'bg-green-100 text-green-700',
    closed: 'bg-green-100 text-green-700',
    invoiced: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/purchases/orders" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Purchase Order</h1>
            <p className="text-[var(--text-secondary)]">PO details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
          Loading...
        </div>
      </div>
    )
  }

  if (error || !po) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/purchases/orders" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Purchase Order</h1>
            <p className="text-[var(--text-secondary)]">PO details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-red-600">
          {error || 'Purchase order not found'}
        </div>
      </div>
    )
  }

  const { items = [], receipts = [], vendorInvoices = [] } = po
  const itemCount = items.length
  const totalQty = items.reduce((sum: number, it: any) => sum + (it.qty || it.quantity || 0), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
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

        {id && po.status === 'draft' && (
          <Link
            to={`/purchases/orders/${id}/edit`}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Edit size={18} />
            Edit
          </Link>
        )}
      </div>

      {/* PO Info Card */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">PO #</div>
            <div className="font-mono text-lg">{po.po_no ?? po.order_no ?? po.id}</div>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs capitalize ${statusBadge}`}>
            {po.status ?? 'draft'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {/* Vendor */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <User size={14} /> Vendor
            </div>
            <div className="font-medium mt-1">{po.vendor?.name ?? 'N/A'}</div>
            <div className="text-xs text-[var(--text-secondary)]">{po.vendor?.code ?? ''}</div>
          </div>

          {/* Dates */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Calendar size={14} /> Dates
            </div>
            <div className="font-medium mt-1">Ordered: {formatDate(po.order_date)}</div>
            <div className="text-xs text-[var(--text-secondary)]">Expected: {formatDate(po.expected_receipt_date)}</div>
          </div>

          {/* Summary */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <DollarSign size={14} /> Summary
            </div>
            <div className="font-medium mt-1">{formatCurrency(po.total_minor)}</div>
            <div className="text-xs text-[var(--text-secondary)]">{itemCount} items · {totalQty} units</div>
          </div>

          {/* Created */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Calendar size={14} /> Created
            </div>
            <div className="font-medium mt-1">{formatDate(po.created_at)}</div>
            {po.created_by_user_id && (
              <div className="text-xs text-[var(--text-secondary)]">User: {po.created_by_user_id.slice(0, 8)}</div>
            )}
          </div>
        </div>

        {/* Notes */}
        {po.notes && (
          <div className="mt-4 text-sm">
            <div className="text-[var(--text-secondary)]">Notes</div>
            <div className="mt-1 whitespace-pre-wrap">{po.notes}</div>
          </div>
        )}
      </div>

      {/* Related Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Receipts (GRN) */}
        {receipts && receipts.length > 0 && (
          <div className="bg-white rounded-lg border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <ReceiptIcon size={18} className="text-green-500" />
              <h3 className="font-semibold">Goods Receipts (GRN)</h3>
            </div>
            <div className="space-y-2">
              {receipts.map((grn: any) => (
                <Link
                  key={grn.id}
                  to={`/purchases/receipts/${grn.id}`}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100"
                >
                  <div>
                    <div className="font-mono font-medium">{grn.receipt_no}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{formatDate(grn.receipt_date)} · {grn.received_qty || 0} units</div>
                  </div>
                  <StatusBadge status={grn.status} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Vendor Invoices */}
        {vendorInvoices && vendorInvoices.length > 0 && (
          <div className="bg-white rounded-lg border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-blue-500" />
              <h3 className="font-semibold">Vendor Invoices</h3>
            </div>
            <div className="space-y-2">
              {vendorInvoices.map((inv: any) => (
                <Link
                  key={inv.id}
                  to={`/purchases/vendor-invoices/${inv.id}`}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <div>
                    <div className="font-mono font-medium">{inv.invoice_no}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{formatCurrency(inv.amount_minor)}</div>
                  </div>
                  <StatusBadge status={inv.status} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No related docs */}
        {(!receipts || receipts.length === 0) && (!vendorInvoices || vendorInvoices.length === 0) && (
          <div className="bg-white rounded-lg border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-[var(--secondary)]" />
              <h3 className="font-semibold text-[var(--text-secondary)]">Related Documents</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">No receipts or invoices yet</p>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-strong)]">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-[var(--secondary)]" />
            <h2 className="font-semibold">Line Items</h2>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            {itemCount} items · {totalQty} units
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">#</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Item</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">SKU</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Qty</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Rate</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-strong)]">
            {items && items.length ? (
              items.map((it: any, idx: number) => (
                <tr key={it.id || idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{it.item?.name ?? it.description ?? '-'}</div>
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
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--text-secondary)]">
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
