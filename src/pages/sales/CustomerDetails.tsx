import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, ShoppingCart, Receipt, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { sales } from '../../lib/api'

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
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

export default function CustomerDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await sales.customers.get(id)
        setCustomer(res.data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load customer')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const statusBadge = useMemo(() => {
    const s = String(customer?.status ?? 'active').toLowerCase()
    return s === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
  }, [customer?.status])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/sales/customers" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Customer</h1>
            <p className="text-[var(--text-secondary)]">Customer details</p>
          </div>
        </div>
        <div className-lg border border-[="bg-white roundedvar(--border)] p-8 text-center text-[var(--secondary)]">
          Loading...
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/sales/customers" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Customer</h1>
            <p className="text-[var(--text-secondary)]">Customer details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-red-600">
          {error || 'Customer not found'}
        </div>
      </div>
    )
  }

  const { stats, orders = [], quotations = [], invoices = [] } = customer

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/sales/customers" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Customer</h1>
            <p className="text-[var(--text-secondary)]">Customer details</p>
          </div>
        </div>

        {id && (
          <Link
            to={`/sales/customers/${id}/edit`}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Edit size={18} />
            Edit
          </Link>
        )}
      </div>

      {/* Basic Info Card */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Name</div>
            <div className="text-lg font-semibold">{customer.name ?? '-'}</div>
            <div className="text-sm text-[var(--text-secondary)] font-mono">{customer.code ?? ''}</div>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs capitalize ${statusBadge}`}>
            {customer.status ?? 'active'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Mail size={14} /> Email
            </div>
            <div className="mt-1 font-medium">{customer.email ?? '-'}</div>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Phone size={14} /> Phone
            </div>
            <div className="mt-1 font-medium">{customer.phone ?? '-'}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <MapPin size={14} /> Billing Address
            </div>
            <div className="mt-1 whitespace-pre-wrap">{customer.billing_address ?? '-'}</div>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <MapPin size={14} /> Shipping Address
            </div>
            <div className="mt-1 whitespace-pre-wrap">{customer.shipping_address ?? '-'}</div>
          </div>
        </div>

        {/* Payment Terms */}
        {(customer.payment_terms_days || customer.credit_limit_minor) && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {customer.payment_terms_days && (
              <div className="border border-[var(--border)] rounded-lg p-3">
                <div className="text-[var(--text-secondary)] text-xs">Payment Terms</div>
                <div className="mt-1 font-medium">{customer.payment_terms_days} days</div>
              </div>
            )}
            {customer.credit_limit_minor && (
              <div className="border border-[var(--border)] rounded-lg p-3">
                <div className="text-[var(--text-secondary)] text-xs">Credit Limit</div>
                <div className="mt-1 font-medium">{formatCurrency(customer.credit_limit_minor)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <TrendingUp size={14} /> Total Revenue
            </div>
            <div className="text-lg font-semibold mt-1">{formatCurrency(stats.totalRevenue)}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <ShoppingCart size={14} /> Orders
            </div>
            <div className="text-lg font-semibold mt-1">{stats.orderCount}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <FileText size={14} /> Quotations
            </div>
            <div className="text-lg font-semibold mt-1">{stats.quotationCount}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Receipt size={14} /> Invoices
            </div>
            <div className="text-lg font-semibold mt-1">{stats.invoiceCount}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Clock size={14} /> Pending
            </div>
            <div className="text-lg font-semibold mt-1">{stats.pendingOrdersCount}</div>
            <div className="text-xs text-[var(--text-secondary)]">{formatCurrency(stats.pendingOrdersValue)}</div>
          </div>
        </div>
      )}

      {/* Recent Invoices */}
      {invoices.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-[var(--secondary)]" />
              <h2 className="font-semibold">Recent Invoices</h2>
            </div>
            <Link to="/sales/invoices" className="text-sm text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[var(--text-secondary)]">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Invoice #</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((inv: any) => (
                  <tr key={inv.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{inv.order_no}</td>
                    <td className="px-4 py-2">{formatDate(inv.order_date)}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(inv.total_minor)}</td>
                    <td className="px-4 py-2 text-center"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-[var(--secondary)]" />
              <h2 className="font-semibold">Recent Orders</h2>
            </div>
            <Link to="/sales/orders" className="text-sm text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[var(--text-secondary)]">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Order #</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order: any) => (
                  <tr key={order.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{order.order_no}</td>
                    <td className="px-4 py-2">{formatDate(order.order_date)}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(order.total_minor)}</td>
                    <td className="px-4 py-2 text-center"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Quotations */}
      {quotations.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[var(--secondary)]" />
              <h2 className="font-semibold">Recent Quotations</h2>
            </div>
            <Link to="/sales/quotations" className="text-sm text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[var(--text-secondary)]">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Quotation #</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {quotations.slice(0, 5).map((quo: any) => (
                  <tr key={quo.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{quo.order_no}</td>
                    <td className="px-4 py-2">{formatDate(quo.order_date)}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(quo.total_minor)}</td>
                    <td className="px-4 py-2 text-center"><StatusBadge status={quo.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && quotations.length === 0 && invoices.length === 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--text-secondary)]">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
          <p>No orders, quotations, or invoices yet</p>
        </div>
      )}
    </div>
  )
}
