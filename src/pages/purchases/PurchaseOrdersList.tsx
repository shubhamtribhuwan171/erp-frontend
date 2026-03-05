import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ShoppingCart } from 'lucide-react'
import { purchases } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput, StatusBadge } from '../../components/ui'

export default function PurchaseOrdersList() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await purchases.orders.list({ search })
        setOrders(response.data.data?.orders || [])
      } catch (e) {
        console.error('Failed to fetch orders', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [search])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amount || 0) / 100)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Purchases" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  const columns = [
    { key: 'po_no', header: 'PO #', render: (o: any) => (
      <Link to={`/purchases/orders/${o.id}`} className="font-mono text-sm text-gray-700 hover:text-gray-900">{o.po_no}</Link>
    )},
    { key: 'vendor', header: 'Vendor', render: (o: any) => o.vendor?.name || 'N/A' },
    { key: 'order_date', header: 'Date', render: (o: any) => formatDate(o.order_date) },
    { key: 'total_minor', header: 'Amount', align: 'right' as const, render: (o: any) => formatCurrency(o.total_minor) },
    { key: 'status', header: 'Status', align: 'center' as const, render: (o: any) => (
      <StatusBadge status={o.status} map={{
        draft: { bg: 'bg-gray-100 text-gray-700', label: 'Draft' },
        approved: { bg: 'bg-blue-100 text-blue-700', label: 'Approved' },
        sent: { bg: 'bg-yellow-100 text-yellow-700', label: 'Sent' },
        partial: { bg: 'bg-purple-100 text-purple-700', label: 'Partial' },
        received: { bg: 'bg-green-100 text-green-700', label: 'Received' },
        cancelled: { bg: 'bg-red-100 text-red-700', label: 'Cancelled' },
      }} />
    )},
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader icon={ShoppingCart} title="Purchase Orders" subtitle="Manage purchase orders" />
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search orders..." />
        </div>
        <DataTable columns={columns} data={orders} loading={loading} emptyTitle="No orders found" actions={[{ icon: 'view' as const, path: (o: any) => `/purchases/orders/${o.id}` }]} />
      </div>
    </div>
  )
}
