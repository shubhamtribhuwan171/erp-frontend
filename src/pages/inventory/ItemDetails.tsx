import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Boxes, Package, ShoppingCart, Truck, TrendingUp, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react'
import { inventory } from '../../lib/api'
import { Card, PageHeader, StatusBadge, DataTable } from '../../components/ui'

function formatCurrency(minor?: number | null) {
  if (minor === null || minor === undefined) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(minor / 100)
}

function formatDate(date?: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function TxnBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string, label: string }> = {
    purchase_in: { bg: 'bg-blue-50 text-blue-600 border border-blue-100', label: 'Purchase In' },
    sales_out: { bg: 'bg-purple-50 text-purple-600 border border-purple-100', label: 'Sales Out' },
    adjustment: { bg: 'bg-amber-50 text-amber-600 border border-amber-100', label: 'Adjustment' },
    transfer: { bg: 'bg-cyan-50 text-cyan-600 border border-cyan-100', label: 'Transfer' },
  }
  const cfg = config[type] || { bg: 'bg-gray-50 text-gray-600', label: type || 'Other' }
  return <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${cfg.bg}`}>{cfg.label}</span>
}

export default function ItemDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await inventory.items.get(id)
        setItem(res.data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load item')
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
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <Card><p className="text-center text-gray-400">{error || 'Item not found'}</p></Card>
        </div>
      </div>
    )
  }

  const totalStock = item?.stock?.reduce((sum: number, r: any) => sum + (Number(r.qty_on_hand ?? r.on_hand ?? 0) || 0), 0) || 0
  const { stats = {}, stock = [], transactions = [], purchaseOrders = [], salesOrders = [] } = item
  const totalOnHand = stats.totalOnHand ?? totalStock
  const needsReorder = totalOnHand <= (item.reorder_level || 0)

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <PageHeader
          backPath="/inventory/items"
          title={item.name}
          subtitle="Item Details"
          actions={
            id && (
              <Link to={`/inventory/items/${id}/edit`} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                Edit Item
              </Link>
            )
          }
        />

        {needsReorder && (
          <Card className="bg-amber-50 border-amber-100">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-amber-600" />
              <div>
                <div className="font-medium text-amber-800">Low Stock Alert</div>
                <div className="text-sm text-amber-600">Current stock ({totalOnHand}) below reorder level ({item.reorder_level || 0})</div>
              </div>
            </div>
          </Card>
        )}

        {/* Basic Info */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                <Package size={28} className="text-gray-300" />
              </div>
              <div>
                <div className="font-mono text-lg text-gray-700">{item.sku || '-'}</div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">{item.category?.name || 'Uncategorized'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">{formatCurrency(item.sale_price_minor)}</div>
              <div className="text-sm text-gray-400">Cost: {formatCurrency(item.standard_cost_minor)}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-400">Stock: <span className={`font-semibold ${needsReorder ? 'text-amber-600' : 'text-gray-900'}`}>{totalOnHand}</span></div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2"><Boxes size={16} /> On Hand</div>
            <div className="text-2xl font-semibold">{totalOnHand}</div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-blue-500 text-sm mb-2"><ArrowDown size={16} /> Purchased</div>
            <div className="text-2xl font-semibold">{stats.totalPurchased || 0}</div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-purple-500 text-sm mb-2"><ArrowUp size={16} /> Sold</div>
            <div className="text-2xl font-semibold">{stats.totalSold || 0}</div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2"><TrendingUp size={16} /> Orders</div>
            <div className="text-2xl font-semibold">{(purchaseOrders?.length || 0) + (salesOrders?.length || 0)}</div>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-2 gap-6">
          {transactions.length > 0 && (
            <Card padding="none">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold">Recent Transactions</h3>
              </div>
              <DataTable
                columns={[
                  { key: 'created_at', header: 'Date', render: (t: any) => formatDate(t.created_at) },
                  { key: 'txn_type', header: 'Type', render: (t: any) => <TxnBadge type={t.txn_type} /> },
                  { key: 'qty', header: 'Qty', align: 'right' as const },
                ]}
                data={transactions.slice(0, 5)}
                loading={false}
              />
            </Card>
          )}

          {stock.length > 0 && (
            <Card padding="none">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold">Stock by Warehouse</h3>
              </div>
              <DataTable
                columns={[
                  { key: 'warehouse', header: 'Warehouse', render: (s: any) => s.warehouse?.name || '-' },
                  { key: 'qty', header: 'On Hand', align: 'right' as const, render: (s: any) => s.qty_on_hand || 0 },
                ]}
                data={stock}
                loading={false}
              />
            </Card>
          )}
        </div>

      </div>
    </div>
  )
}
