import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, ShoppingCart, Receipt, TrendingUp, Clock } from 'lucide-react'
import { sales } from '../../lib/api'
import { Card, PageHeader, StatusBadge, DataTable } from '../../components/ui'

function formatCurrency(minor?: number | null) {
  if (minor === null || minor === undefined) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(minor / 100)
}

function formatDate(date?: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-gray-100 rounded-2xl" />
            <div className="grid grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
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
          <Card><p className="text-center text-gray-400">{error || 'Customer not found'}</p></Card>
        </div>
      </div>
    )
  }

  const { stats, orders = [], quotations = [], invoices = [] } = customer

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <PageHeader
          backPath="/sales/customers"
          title={customer.name}
          subtitle="Customer Details"
          actions={
            id && (
              <Link to={`/sales/customers/${id}/edit`} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                Edit Customer
              </Link>
            )
          }
        />

        {/* Basic Info */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-300">{customer.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div className="font-mono text-lg text-gray-700">{customer.code || '-'}</div>
                <StatusBadge status={customer.status ?? 'active'} />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Mail size={14} /> Email</div>
              <div className="text-gray-700">{customer.email || '-'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Phone size={14} /> Phone</div>
              <div className="text-gray-700">{customer.phone || '-'}</div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-5 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2"><TrendingUp size={16} /> Revenue</div>
              <div className="text-xl font-semibold">{formatCurrency(stats.totalRevenue)}</div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2"><ShoppingCart size={16} /> Orders</div>
              <div className="text-xl font-semibold">{stats.orderCount}</div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 text-orange-500 text-sm mb-2"><FileText size={16} /> Quotations</div>
              <div className="text-xl font-semibold">{stats.quotationCount}</div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 text-green-500 text-sm mb-2"><Receipt size={16} /> Invoices</div>
              <div className="text-xl font-semibold">{stats.invoiceCount}</div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2"><Clock size={16} /> Pending</div>
              <div className="text-xl font-semibold">{stats.pendingOrdersCount}</div>
            </Card>
          </div>
        )}

        {/* Data Tables */}
        <div className="grid grid-cols-3 gap-6">
          {invoices.length > 0 && (
            <Card padding="none">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Receipt size={18} className="text-green-500" />
                <h3 className="font-semibold">Invoices</h3>
              </div>
              <DataTable
                columns={[
                  { key: 'order_no', header: '#', render: (i: any) => <Link to={`/sales/invoices/${i.id}`} className="font-mono text-sm">{i.order_no}</Link> },
                  { key: 'total_minor', header: 'Amt', align: 'right' as const, render: (i: any) => formatCurrency(i.total_minor) },
                  { key: 'status', header: 'Status', render: (i: any) => <StatusBadge status={i.status} /> },
                ]}
                data={invoices.slice(0, 4)}
                loading={false}
              />
            </Card>
          )}

          {orders.length > 0 && (
            <Card padding="none">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingCart size={18} className="text-blue-500" />
                <h3 className="font-semibold">Orders</h3>
              </div>
              <DataTable
                columns={[
                  { key: 'order_no', header: '#', render: (o: any) => <Link to={`/sales/orders/${o.id}`} className="font-mono text-sm">{o.order_no}</Link> },
                  { key: 'total_minor', header: 'Amt', align: 'right' as const, render: (o: any) => formatCurrency(o.total_minor) },
                  { key: 'status', header: 'Status', render: (o: any) => <StatusBadge status={o.status} /> },
                ]}
                data={orders.slice(0, 4)}
                loading={false}
              />
            </Card>
          )}

          {quotations.length > 0 && (
            <Card padding="none">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FileText size={18} className="text-orange-500" />
                <h3 className="font-semibold">Quotations</h3>
              </div>
              <DataTable
                columns={[
                  { key: 'order_no', header: '#', render: (q: any) => <Link to={`/sales/quotations/${q.id}`} className="font-mono text-sm">{q.order_no}</Link> },
                  { key: 'total_minor', header: 'Amt', align: 'right' as const, render: (q: any) => formatCurrency(q.total_minor) },
                  { key: 'status', header: 'Status', render: (q: any) => <StatusBadge status={q.status} /> },
                ]}
                data={quotations.slice(0, 4)}
                loading={false}
              />
            </Card>
          )}
        </div>

        {orders.length === 0 && quotations.length === 0 && invoices.length === 0 && (
          <Card><p className="text-center text-gray-400">No orders, quotations, or invoices yet</p></Card>
        )}

      </div>
    </div>
  )
}
