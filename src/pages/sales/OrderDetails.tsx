import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Package, FileText, Receipt, User, Calendar, MapPin, DollarSign } from 'lucide-react'
import { sales } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

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
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    invoiced: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    quotation: 'bg-orange-100 text-orange-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

export default function OrderDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await sales.orders.get(id)
        setOrder(res.data.data)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const statusBadge = useMemo(() => {
    const s = String(order?.status ?? '').toLowerCase()
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      confirmed: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      invoiced: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return map[s] ?? 'bg-gray-100 text-gray-700'
  }, [order?.status])

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Sales" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/sales/orders" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Sales Order</h1>
            <p className="text-[var(--text-secondary)]">Order details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
          Loading...
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/sales/orders" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Sales Order</h1>
            <p className="text-[var(--text-secondary)]">Order details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--text-secondary)]">
          Order not found
        </div>
      </div>
    )
  }

  const { totals = {}, relatedQuotation, relatedInvoices = [], items = [] } = order
  const itemCount = items.length
  const totalQty = items.reduce((sum: number, it: any) => sum + (it.qty || it.quantity || 0), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/sales/orders" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Sales Order</h1>
            <p className="text-[var(--text-secondary)]">Order details</p>
          </div>
        </div>

        {id && order.status === 'draft' && (
          <Link
            to={`/sales/orders/${id}/edit`}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Edit size={18} />
            Edit
          </Link>
        )}
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Order #</div>
            <div className="font-mono text-lg">{order.order_no ?? order.id}</div>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs capitalize ${statusBadge}`}>
            {order.status ?? 'draft'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {/* Customer */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <User size={14} /> Customer
            </div>
            <div className="font-medium mt-1">{order.customer?.name ?? 'N/A'}</div>
            <div className="text-xs text-[var(--text-secondary)]">{order.customer?.code ?? ''}</div>
          </div>

          {/* Dates */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Calendar size={14} /> Dates
            </div>
            <div className="font-medium mt-1">Ordered: {formatDate(order.order_date)}</div>
            <div className="text-xs text-[var(--text-secondary)]">Ship by: {formatDate(order.expected_ship_date || order.delivery_date)}</div>
          </div>

          {/* Summary */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <DollarSign size={14} /> Summary
            </div>
            <div className="font-medium mt-1">{formatCurrency(order.total_minor || totals.total_minor)}</div>
            <div className="text-xs text-[var(--text-secondary)]">{itemCount} items · {totalQty} units</div>
          </div>

          {/* Created */}
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Calendar size={14} /> Created
            </div>
            <div className="font-medium mt-1">{formatDate(order.created_at)}</div>
            {order.created_by_user_id && (
              <div className="text-xs text-[var(--text-secondary)]">User ID: {order.created_by_user_id.slice(0, 8)}</div>
            )}
          </div>
        </div>

        {/* Addresses */}
        {(order.billing_address || order.shipping_address) && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border border-[var(--border)] rounded-lg p-3">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                <MapPin size={14} /> Billing Address
              </div>
              <div className="mt-1 whitespace-pre-wrap">{order.billing_address ?? '-'}</div>
            </div>
            <div className="border border-[var(--border)] rounded-lg p-3">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                <MapPin size={14} /> Shipping Address
              </div>
              <div className="mt-1 whitespace-pre-wrap">{order.shipping_address ?? '-'}</div>
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="mt-4 text-sm">
            <div className="text-[var(--text-secondary)]">Notes</div>
            <div className="mt-1 whitespace-pre-wrap">{order.notes}</div>
          </div>
        )}
      </div>

      {/* Related Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Related Quotation */}
        {relatedQuotation && (
          <div className="bg-white rounded-lg border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-orange-500" />
              <h3 className="font-semibold">Converted from Quotation</h3>
            </div>
            <Link
              to={`/sales/quotations/${relatedQuotation.id}`}
              className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100"
            >
              <div>
                <div className="font-mono font-medium">{relatedQuotation.order_no}</div>
                <div className="text-xs text-[var(--text-secondary)]">{formatDate(relatedQuotation.order_date)}</div>
              </div>
              <StatusBadge status={relatedQuotation.status} />
            </Link>
          </div>
        )}

        {/* Related Invoices */}
        {relatedInvoices && relatedInvoices.length > 0 && (
          <div className="bg-white rounded-lg border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Receipt size={18} className="text-green-500" />
              <h3 className="font-semibold">Invoices</h3>
            </div>
            <div className="space-y-2">
              {relatedInvoices.map((inv: any) => (
                <Link
                  key={inv.id}
                  to={`/sales/invoices/${inv.id}`}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100"
                >
                  <div>
                    <div className="font-mono font-medium">{inv.order_no}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{formatCurrency(inv.total_minor)}</div>
                  </div>
                  <StatusBadge status={inv.status} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No related docs */}
        {!relatedQuotation && (!relatedInvoices || relatedInvoices.length === 0) && order.status !== 'invoiced' && (
          <div className="bg-white rounded-lg border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-[var(--secondary)]" />
              <h3 className="font-semibold text-[var(--text-secondary)]">Related Documents</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">No related quotations or invoices</p>
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
          {/* Totals */}
          {items && items.length > 0 && (
            <tfoot className="bg-gray-50 border-t border-[var(--border-strong)]">
              <tr>
                <td colSpan={5} className="px-4 py-2 text-right text-sm text-[var(--text-secondary)]">Subtotal</td>
                <td className="px-4 py-2 text-right text-sm font-medium">{formatCurrency(totals.subtotal_minor || order.subtotal_minor)}</td>
              </tr>
              {(totals.discount_minor || order.discount_minor) > 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-right text-sm text-[var(--text-secondary)]">Discount</td>
                  <td className="px-4 py-2 text-right text-sm font-medium">-{formatCurrency(totals.discount_minor || order.discount_minor)}</td>
                </tr>
              )}
              {(totals.tax_minor || order.tax_minor) > 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-right text-sm text-[var(--text-secondary)]">Tax</td>
                  <td className="px-4 py-2 text-right text-sm font-medium">{formatCurrency(totals.tax_minor || order.tax_minor)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={5} className="px-4 py-2 text-right font-semibold">Total</td>
                <td className="px-4 py-2 text-right font-semibold">{formatCurrency(totals.total_minor || order.total_minor)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
