import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, Phone, Landmark, MapPin, FileText, ShoppingCart, Receipt, Truck, Clock, TrendingUp } from 'lucide-react'
import { purchases } from '../../lib/api'

function formatCurrency(minor?: number | null) {
  if (minor === null || minor === undefined) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(minor / 100)
}

function formatDate(date?: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatAddress(addr: any): string {
  if (!addr) return '-'
  if (typeof addr === 'string') return addr
  if (typeof addr === 'object') {
    const parts = [addr.line1, addr.line2, addr.area, addr.city, addr.state, addr.pincode, addr.country]
      .filter(Boolean)
      .map(String)
    return parts.length ? parts.join(', ') : JSON.stringify(addr)
  }
  return String(addr)
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
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

  const statusBadge = useMemo(() => {
    const s = String(vendor?.status ?? 'active').toLowerCase()
    return s === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
  }, [vendor?.status])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/purchases/vendors" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Vendor</h1>
            <p className="text-[var(--text-secondary)]">Vendor details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
          Loading...
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/purchases/vendors" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Vendor</h1>
            <p className="text-[var(--text-secondary)]">Vendor details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-red-600">
          {error || 'Vendor not found'}
        </div>
      </div>
    )
  }

  const { stats = {}, purchaseOrders = [], vendorInvoices = [] } = vendor

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/purchases/vendors" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Vendor</h1>
            <p className="text-[var(--text-secondary)]">Vendor details</p>
          </div>
        </div>

        {id && (
          <Link
            to={`/purchases/vendors/${id}/edit`}
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
            <div className="text-lg font-semibold">{vendor.name ?? '-'}</div>
            <div className="text-sm text-[var(--text-secondary)] font-mono">{vendor.code ?? ''}</div>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs capitalize ${statusBadge}`}>
            {vendor.status ?? 'active'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Mail size={14} /> Email
            </div>
            <div className="mt-1 font-medium">{vendor.email ?? '-'}</div>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Phone size={14} /> Phone
            </div>
            <div className="mt-1 font-medium">{vendor.phone ?? '-'}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <MapPin size={14} /> Address
            </div>
            <div className="mt-1 whitespace-pre-wrap">{formatAddress(vendor.address)}</div>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Landmark size={14} /> Payment Terms
            </div>
            <div className="mt-1 font-medium">
              {vendor.payment_terms_days !== null && vendor.payment_terms_days !== undefined
                ? `${vendor.payment_terms_days} days`
                : '-'}
            </div>
            {vendor.default_lead_time_days && (
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Lead time: {vendor.default_lead_time_days} days
              </div>
            )}
          </div>
        </div>

        {/* Tax ID */}
        {vendor.tax_id && (
          <div className="mt-4 text-sm">
            <span className="text-[var(--text-secondary)]">Tax ID: </span>
            <span className="font-mono">{vendor.tax_id}</span>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <TrendingUp size={14} /> Total Spend
            </div>
            <div className="text-lg font-semibold mt-1">{formatCurrency(stats.totalSpend)}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <ShoppingCart size={14} /> Orders
            </div>
            <div className="text-lg font-semibold mt-1">{stats.orderCount}</div>
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

      {/* Vendor Invoices */}
      {vendorInvoices.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-green-500" />
              <h2 className="font-semibold">Vendor Invoices</h2>
            </div>
            <Link to="/purchases/vendor-invoices" className="text-sm text-[var(--primary)] hover:underline">
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
                {vendorInvoices.slice(0, 5).map((inv: any) => (
                  <tr key={inv.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{inv.invoice_no || inv.po_no}</td>
                    <td className="px-4 py-2">{formatDate(inv.invoice_date || inv.order_date)}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(inv.amount_minor || inv.total_minor)}</td>
                    <td className="px-4 py-2 text-center"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Orders */}
      {purchaseOrders.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-blue-500" />
              <h2 className="font-semibold">Purchase Orders</h2>
            </div>
            <Link to="/purchases/orders" className="text-sm text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[var(--text-secondary)]">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">PO #</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.slice(0, 5).map((po: any) => (
                  <tr key={po.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{po.po_no}</td>
                    <td className="px-4 py-2">{formatDate(po.order_date)}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(po.total_minor)}</td>
                    <td className="px-4 py-2 text-center"><StatusBadge status={po.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {purchaseOrders.length === 0 && vendorInvoices.length === 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--text-secondary)]">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
          <p>No orders or invoices yet</p>
        </div>
      )}
    </div>
  )
}
