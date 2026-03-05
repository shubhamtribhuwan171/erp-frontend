import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, Phone, MapPin, Landmark, FileText, ShoppingCart, Receipt, TrendingUp, Clock } from 'lucide-react'
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
    sent: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-blue-100 text-blue-700',
    approved: 'bg-blue-100 text-blue-700',
    partial: 'bg-yellow-100 text-yellow-700',
    part_received: 'bg-yellow-100 text-yellow-700',
    received: 'bg-green-100 text-green-700',
    invoiced: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

export default function VendorDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [vendor, setVendor] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await purchases.vendors.get(id)
        setVendor(res.data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load vendor')
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
            <Link to="/purchases/vendors" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="grid gap-6">
            <div className="h-40 bg-white rounded-2xl animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/purchases/vendors" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <span className="text-gray-500">Vendor Details</span>
          </div>
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-gray-400">{error || 'Vendor not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const { stats = {}, purchaseOrders = [], vendorInvoices = [] } = vendor

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/purchases/vendors" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{vendor.name}</h1>
              <p className="text-sm text-gray-400">Vendor Details</p>
            </div>
          </div>

          {id && (
            <Link
              to={`/purchases/vendors/${id}/edit`}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Edit Vendor
            </Link>
          )}
        </div>

        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-300">{vendor.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div className="font-mono text-lg text-gray-700">{vendor.code || '-'}</div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium mt-1 ${
                  String(vendor.status ?? 'active').toLowerCase() === 'active' 
                    ? 'bg-green-50 text-green-600 border border-green-100' 
                    : 'bg-gray-50 text-gray-600 border border-gray-100'
                }`}>
                  {vendor.status ?? 'active'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Mail size={14} /> Email
              </div>
              <div className="text-gray-700">{vendor.email || '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Phone size={14} /> Phone
              </div>
              <div className="text-gray-700">{vendor.phone || '-'}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Landmark size={14} /> Payment Terms
              </div>
              <div className="text-gray-700">
                {vendor.payment_terms_days !== null && vendor.payment_terms_days !== undefined
                  ? `${vendor.payment_terms_days} days`
                  : '-'}
              </div>
              {vendor.default_lead_time_days && (
                <div className="text-xs text-gray-400 mt-1">Lead time: {vendor.default_lead_time_days} days</div>
              )}
            </div>
            {vendor.tax_id && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-gray-400 text-sm mb-1">Tax ID</div>
                <div className="text-gray-700 font-mono">{vendor.tax_id}</div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <TrendingUp size={16} /> Total Spend
              </div>
              <div className="text-xl font-semibold text-gray-900">{formatCurrency(stats.totalSpend)}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <ShoppingCart size={16} /> Orders
              </div>
              <div className="text-xl font-semibold text-gray-900">{stats.orderCount}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Receipt size={16} /> Invoices
              </div>
              <div className="text-xl font-semibold text-gray-900">{stats.invoiceCount}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Clock size={16} /> Pending
              </div>
              <div className="text-xl font-semibold text-gray-900">{stats.pendingOrdersCount}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="text-gray-400 text-sm mb-2">Pending Value</div>
              <div className="text-xl font-semibold text-gray-900">{formatCurrency(stats.pendingOrdersValue)}</div>
            </div>
          </div>
        )}

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vendor Invoices */}
          {vendorInvoices.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Receipt size={18} className="text-green-500" />
                <h3 className="font-semibold text-gray-900">Vendor Invoices</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {vendorInvoices.slice(0, 4).map((inv: any) => (
                  <Link key={inv.id} to={`/purchases/vendor-invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                    <div>
                      <div className="text-sm font-mono text-gray-700">{inv.invoice_no || inv.po_no}</div>
                      <div className="text-xs text-gray-400">{formatDate(inv.invoice_date || inv.order_date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(inv.amount_minor || inv.total_minor)}</div>
                      <StatusBadge status={inv.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Orders */}
          {purchaseOrders.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingCart size={18} className="text-blue-500" />
                <h3 className="font-semibold text-gray-900">Purchase Orders</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {purchaseOrders.slice(0, 4).map((po: any) => (
                  <Link key={po.id} to={`/purchases/orders/${po.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                    <div>
                      <div className="text-sm font-mono text-gray-700">{po.po_no}</div>
                      <div className="text-xs text-gray-400">{formatDate(po.order_date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(po.total_minor)}</div>
                      <StatusBadge status={po.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {purchaseOrders.length === 0 && vendorInvoices.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <FileText size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400">No orders or invoices yet</p>
          </div>
        )}

      </div>
    </div>
  )
}
