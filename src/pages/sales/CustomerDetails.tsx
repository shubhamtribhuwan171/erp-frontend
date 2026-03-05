import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, ShoppingCart, Receipt, TrendingUp, Clock } from 'lucide-react'
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
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
    return s === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
  }, [customer?.status])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/sales/customers" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="grid gap-6">
            <div className="h-48 bg-white rounded-2xl animate-pulse" />
            <div className="grid grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/sales/customers" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <span className="text-gray-500">Customer Details</span>
          </div>
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-gray-400">{error || 'Customer not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const { stats, orders = [], quotations = [], invoices = [] } = customer

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/sales/customers" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{customer.name}</h1>
              <p className="text-sm text-gray-400">Customer Details</p>
            </div>
          </div>

          {id && (
            <Link
              to={`/sales/customers/${id}/edit`}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Edit Customer
            </Link>
          )}
        </div>

        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-300">{customer.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div className="font-mono text-lg text-gray-700">{customer.code || '-'}</div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusBadge}`}>
                  {customer.status ?? 'active'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Mail size={14} /> Email
              </div>
              <div className="text-gray-700">{customer.email || '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Phone size={14} /> Phone
              </div>
              <div className="text-gray-700">{customer.phone || '-'}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <MapPin size={14} /> Billing Address
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">{customer.billing_address || '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <MapPin size={14} /> Shipping Address
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">{customer.shipping_address || '-'}</div>
            </div>
          </div>

          {(customer.payment_terms_days || customer.credit_limit_minor) && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              {customer.payment_terms_days && (
                <div className="text-sm">
                  <span className="text-gray-400">Payment Terms: </span>
                  <span className="text-gray-700">{customer.payment_terms_days} days</span>
                </div>
              )}
              {customer.credit_limit_minor && (
                <div className="text-sm">
                  <span className="text-gray-400">Credit Limit: </span>
                  <span className="text-gray-700">{formatCurrency(customer.credit_limit_minor)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <TrendingUp size={16} />
                Total Revenue
              </div>
              <div className="text-xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <ShoppingCart size={16} />
                Orders
              </div>
              <div className="text-xl font-semibold text-gray-900">{stats.orderCount}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-orange-500 text-sm mb-2">
                <FileText size={16} />
                Quotations
              </div>
              <div className="text-xl font-semibold text-gray-900">{stats.quotationCount}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-green-500 text-sm mb-2">
                <Receipt size={16} />
                Invoices
              </div>
              <div className="text-xl font-semibold text-gray-900">{stats.invoiceCount}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Clock size={16} />
                Pending
              </div>
              <div className="text-xl font-semibold text-gray-900">{stats.pendingOrdersCount}</div>
              <div className="text-xs text-gray-400">{formatCurrency(stats.pendingOrdersValue)}</div>
            </div>
          </div>
        )}

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Invoices */}
          {invoices.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Receipt size={18} className="text-green-500" />
                <h3 className="font-semibold text-gray-900">Invoices</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {invoices.slice(0, 4).map((inv: any) => (
                  <Link key={inv.id} to={`/sales/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                    <div>
                      <div className="text-sm font-mono text-gray-700">{inv.order_no}</div>
                      <div className="text-xs text-gray-400">{formatDate(inv.order_date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(inv.total_minor)}</div>
                      <StatusBadge status={inv.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {orders.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingCart size={18} className="text-blue-500" />
                <h3 className="font-semibold text-gray-900">Orders</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {orders.slice(0, 4).map((order: any) => (
                  <Link key={order.id} to={`/sales/orders/${order.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                    <div>
                      <div className="text-sm font-mono text-gray-700">{order.order_no}</div>
                      <div className="text-xs text-gray-400">{formatDate(order.order_date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(order.total_minor)}</div>
                      <StatusBadge status={order.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quotations */}
          {quotations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FileText size={18} className="text-orange-500" />
                <h3 className="font-semibold text-gray-900">Quotations</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {quotations.slice(0, 4).map((quo: any) => (
                  <Link key={quo.id} to={`/sales/quotations/${quo.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                    <div>
                      <div className="text-sm font-mono text-gray-700">{quo.order_no}</div>
                      <div className="text-xs text-gray-400">{formatDate(quo.order_date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(quo.total_minor)}</div>
                      <StatusBadge status={quo.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {orders.length === 0 && quotations.length === 0 && invoices.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <FileText size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400">No orders, quotations, or invoices yet</p>
          </div>
        )}

      </div>
    </div>
  )
}
