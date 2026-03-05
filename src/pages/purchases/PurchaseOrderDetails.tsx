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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/purchases/orders" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="grid gap-6">
            <div className="h-40 bg-white rounded-2xl animate-pulse" />
            <div className="h-64 bg-white rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !po) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/purchases/orders" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <span className="text-gray-500">PO Details</span>
          </div>
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-gray-400">{error || 'Purchase order not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const { items = [], receipts = [], vendorInvoices = [] } = po
  const itemCount = items.length
  const totalQty = items.reduce((sum: number, it: any) => sum + (it.qty || it.quantity || 0), 0)

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/purchases/orders" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">PO {po.po_no || po.order_no}</h1>
              <p className="text-sm text-gray-400">Purchase Order Details</p>
            </div>
          </div>
          <StatusBadge status={po.status ?? 'draft'} />
        </div>

        {/* PO Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Vendor */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <User size={14} /> Vendor
              </div>
              <div className="font-medium text-gray-900">{po.vendor?.name ?? 'N/A'}</div>
              <div className="text-xs text-gray-400">{po.vendor?.code ?? ''}</div>
            </div>

            {/* Dates */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Calendar size={14} /> Order Date
              </div>
              <div className="font-medium text-gray-900">{formatDate(po.order_date)}</div>
              <div className="text-xs text-gray-400">Expected: {formatDate(po.expected_receipt_date)}</div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <DollarSign size={14} /> Total
              </div>
              <div className="text-2xl font-semibold text-gray-900">{formatCurrency(po.total_minor)}</div>
              <div className="text-xs text-gray-400">{itemCount} items · {totalQty} units</div>
            </div>

            {/* Created */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Calendar size={14} /> Created
              </div>
              <div className="font-medium text-gray-900">{formatDate(po.created_at)}</div>
              {po.created_by_user_id && (
                <div className="text-xs text-gray-400">User: {po.created_by_user_id.slice(0, 8)}</div>
              )}
            </div>
          </div>

          {/* Notes */}
          {po.notes && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-gray-400 text-sm mb-1">Notes</div>
              <div className="text-gray-700">{po.notes}</div>
            </div>
          )}
        </div>

        {/* Related Documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Receipts (GRN) */}
          {receipts && receipts.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-4">
                <ReceiptIcon size={18} className="text-green-500" />
                <h3 className="font-semibold text-gray-900">Goods Receipts (GRN)</h3>
              </div>
              <div className="space-y-2">
                {receipts.map((grn: any) => (
                  <Link key={grn.id} to={`/purchases/receipts/${grn.id}`} className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <div>
                      <div className="font-mono font-medium text-gray-900">{grn.receipt_no}</div>
                      <div className="text-xs text-gray-500">{formatDate(grn.receipt_date)} · {grn.received_qty || 0} units</div>
                    </div>
                    <StatusBadge status={grn.status} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Vendor Invoices */}
          {vendorInvoices && vendorInvoices.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-blue-500" />
                <h3 className="font-semibold text-gray-900">Vendor Invoices</h3>
              </div>
              <div className="space-y-2">
                {vendorInvoices.map((inv: any) => (
                  <Link key={inv.id} to={`/purchases/vendor-invoices/${inv.id}`} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                    <div>
                      <div className="font-mono font-medium text-gray-900">{inv.invoice_no}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(inv.amount_minor)}</div>
                    </div>
                    <StatusBadge status={inv.status} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-gray-400" />
              <h2 className="font-semibold text-gray-900">Line Items</h2>
            </div>
            <div className="text-sm text-gray-400">{itemCount} items · {totalQty} units</div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">#</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Item</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">SKU</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Qty</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Rate</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items && items.length ? (
                items.map((it: any, idx: number) => (
                  <tr key={it.id || idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{it.item?.name ?? it.description ?? '-'}</div>
                      <div className="text-xs text-gray-400">{it.unit?.code ?? it.unit?.name ?? ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">{it.item?.sku ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{it.qty ?? it.quantity ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(it.rate_minor ?? it.unit_price_minor)}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(it.amount_minor ?? it.line_total_minor)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    No items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
