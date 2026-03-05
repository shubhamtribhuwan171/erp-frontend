import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Eye, Edit, Truck, XCircle, ShoppingCart } from 'lucide-react'
import { sales } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput, StatusBadge } from '../../components/ui'

const statusColors: Record<string, { bg: string; label: string }> = {
  draft: { bg: 'bg-gray-100 text-gray-700', label: 'Draft' },
  confirmed: { bg: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
  processing: { bg: 'bg-yellow-100 text-yellow-700', label: 'Processing' },
  shipped: { bg: 'bg-purple-100 text-purple-700', label: 'Shipped' },
  delivered: { bg: 'bg-green-100 text-green-700', label: 'Delivered' },
  invoiced: { bg: 'bg-green-100 text-green-700', label: 'Invoiced' },
  cancelled: { bg: 'bg-red-100 text-red-700', label: 'Cancelled' },
}

export default function OrdersList() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const params: Record<string, string> = {}
        if (statusFilter) params.status = statusFilter
        if (search) params.search = search

        const response = await sales.orders.list(params)
        setOrders(response.data.data?.orders || [])
      } catch (e) {
        console.error('Failed to fetch orders', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [statusFilter, search])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amount || 0) / 100)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Sales" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    {
      key: 'order_no',
      header: 'Order #',
      render: (order: any) => (
        <Link to={`/sales/orders/${order.id}`} className="font-mono text-sm text-gray-700 hover:text-gray-900">
          {order.order_no}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order: any) => order.customer?.name || 'N/A',
    },
    {
      key: 'order_date',
      header: 'Date',
      render: (order: any) => formatDate(order.order_date),
    },
    {
      key: 'total_minor',
      header: 'Amount',
      align: 'right' as const,
      render: (order: any) => formatCurrency(order.total_minor),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (order: any) => <StatusBadge status={order.status} map={statusColors} />,
    },
  ]

  const actions = [
    { icon: 'view' as const, path: (order: any) => `/sales/orders/${order.id}` },
    { icon: 'edit' as const, path: (order: any) => `/sales/orders/${order.id}/edit` },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <PageHeader
          icon={ShoppingCart}
          title="Sales Orders"
          subtitle="Manage your orders"
          actions={
            <Link
              to="/sales/orders/new"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              New Order
            </Link>
          }
        />

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search orders..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-gray-50 pl-4 pr-11 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyTitle="No orders found"
          emptyDescription="Create your first order to get started"
          emptyActionLabel="Create Order"
          emptyActionPath="/sales/orders/new"
          actions={actions}
        />

      </div>
    </div>
  )
}
