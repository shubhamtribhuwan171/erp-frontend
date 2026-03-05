import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Boxes, Package, ShoppingCart, Truck, TrendingUp, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react'
import { inventory } from '../../lib/api'

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
    purchase: 'bg-blue-100 text-blue-700',
    sale: 'bg-purple-100 text-purple-700',
    adjustment: 'bg-yellow-100 text-yellow-700',
    transfer: 'bg-cyan-100 text-cyan-700',
    return: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

function TxnBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string, icon: any, label: string }> = {
    purchase_in: { bg: 'bg-blue-50 text-blue-600 border border-blue-100', icon: ArrowDown, label: 'Purchase In' },
    purchase: { bg: 'bg-blue-50 text-blue-600 border border-blue-100', icon: ArrowDown, label: 'Purchase' },
    sales_out: { bg: 'bg-purple-50 text-purple-600 border border-purple-100', icon: ArrowUp, label: 'Sales Out' },
    sale: { bg: 'bg-purple-50 text-purple-600 border border-purple-100', icon: ArrowUp, label: 'Sale' },
    adjustment: { bg: 'bg-amber-50 text-amber-600 border border-amber-100', icon: TrendingUp, label: 'Adjustment' },
    transfer: { bg: 'bg-cyan-50 text-cyan-600 border border-cyan-100', icon: Truck, label: 'Transfer' },
    return: { bg: 'bg-red-50 text-red-600 border border-red-100', icon: ArrowDown, label: 'Return' },
  }
  const cfg = config[type] || { bg: 'bg-gray-50 text-gray-600 border border-gray-100', icon: TrendingUp, label: type || 'Other' }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.bg}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
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

  const totalStock = useMemo(() => {
    const rows: any[] = Array.isArray(item?.stock) ? item.stock : []
    return rows.reduce((sum, r) => sum + (Number(r.qty_on_hand ?? r.on_hand ?? 0) || 0), 0)
  }, [item?.stock])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/inventory/items" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="grid gap-6">
            <div className="h-48 bg-white rounded-2xl animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
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
          <div className="flex items-center gap-3 mb-8">
            <Link to="/inventory/items" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <span className="text-gray-500">Item Details</span>
          </div>
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-400">{error || 'Item not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const { stats = {}, stock = [], transactions = [], purchaseOrders = [], salesOrders = [] } = item
  const totalOnHand = stats.totalOnHand ?? totalStock
  const needsReorder = stats.needsReorder ?? (totalOnHand <= (item.reorder_level || 0))

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/inventory/items" className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{item.name}</h1>
              <p className="text-sm text-gray-400">Item Details</p>
            </div>
          </div>
          {id && (
            <Link
              to={`/inventory/items/${id}/edit`}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Edit Item
            </Link>
          )}
        </div>

        {/* Low Stock Alert */}
        {needsReorder && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div>
              <div className="font-medium text-amber-800">Low Stock Alert</div>
              <div className="text-sm text-amber-600">
                Current stock ({totalOnHand}) is below reorder level ({item.reorder_level || 0})
              </div>
            </div>
          </div>
        )}

        {/* Main Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Item Identity */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Package size={28} className="text-gray-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">SKU</div>
                  <div className="font-mono text-lg text-gray-700">{item.sku || '-'}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm">
                  {item.category?.name || 'Uncategorized'}
                </span>
                <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm">
                  {item.unit?.code || item.unit?.name || '-'}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <div className="text-sm text-gray-400">Sale Price</div>
              <div className="text-2xl font-semibold text-gray-900">{formatCurrency(item.sale_price_minor)}</div>
              <div className="text-sm text-gray-400">Cost: {formatCurrency(item.standard_cost_minor)}</div>
            </div>

            {/* Stock */}
            <div className="space-y-3">
              <div className="text-sm text-gray-400">On Hand</div>
              <div className={`text-2xl font-semibold ${needsReorder ? 'text-amber-600' : 'text-gray-900'}`}>
                {totalOnHand}
              </div>
              {item.reorder_level > 0 && (
                <div className="text-sm text-gray-400">Reorder at: {item.reorder_level}</div>
              )}
            </div>
          </div>

          {item.description && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-400 mb-2">Description</div>
              <p className="text-gray-600">{item.description}</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Boxes size={16} />
              On Hand
            </div>
            <div className={`text-2xl font-semibold ${needsReorder ? 'text-amber-600' : 'text-gray-900'}`}>
              {totalOnHand}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 text-blue-500 text-sm mb-2">
              <ArrowDown size={16} />
              Purchased
            </div>
            <div className="text-2xl font-semibold text-gray-900">{stats.totalPurchased || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 text-purple-500 text-sm mb-2">
              <ArrowUp size={16} />
              Sold
            </div>
            <div className="text-2xl font-semibold text-gray-900">{stats.totalSold || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <TrendingUp size={16} />
              Total Orders
            </div>
            <div className="text-2xl font-semibold text-gray-900">{(purchaseOrders?.length || 0) + (salesOrders?.length || 0)}</div>
          </div>
        </div>

        {/* Stock by Warehouse */}
        {stock.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Stock by Warehouse</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Warehouse</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">On Hand</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Reserved</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stock.map((row: any) => {
                  const onHand = Number(row.qty_on_hand ?? row.on_hand ?? 0) || 0
                  const reserved = Number(row.qty_reserved ?? row.reserved ?? 0) || 0
                  const available = onHand - reserved
                  return (
                    <tr key={row.id ?? row.warehouse_id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm text-gray-700">{row.warehouse?.name ?? row.warehouse_code ?? '-'}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{onHand}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-400">{reserved}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{available}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
              <Link to="/inventory/transactions" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Warehouse</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Qty</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.slice(0, 8).map((txn: any) => (
                    <tr key={txn.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3.5 text-sm text-gray-500">{formatDate(txn.created_at)}</td>
                      <td className="px-6 py-3.5"><TxnBadge type={txn.txn_type || txn.transaction_type} /></td>
                      <td className="px-6 py-3.5 text-sm text-gray-600">{txn.warehouse?.name || '-'}</td>
                      <td className="px-6 py-3.5 text-sm text-right font-medium text-gray-900">{txn.qty || txn.quantity}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-400 font-mono">{txn.reference?.order_no || txn.reference_type || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Purchase Orders */}
          {purchaseOrders && purchaseOrders.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Truck size={18} className="text-blue-500" />
                <h2 className="font-semibold text-gray-900">Purchase Orders</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {purchaseOrders.slice(0, 4).map((po: any) => (
                  <Link key={po.id} to={`/purchases/orders/${po.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{po.order?.po_no || '-'}</div>
                      <div className="text-xs text-gray-400">{po.order?.vendor?.name || '-'} · {formatDate(po.order?.order_date)}</div>
                    </div>
                    <StatusBadge status={po.order?.status || 'draft'} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sales Orders */}
          {salesOrders && salesOrders.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingCart size={18} className="text-purple-500" />
                <h2 className="font-semibold text-gray-900">Sales Orders</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {salesOrders.slice(0, 4).map((so: any) => (
                  <Link key={so.id} to={`/sales/orders/${so.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{so.order?.order_no || '-'}</div>
                      <div className="text-xs text-gray-400">{so.order?.customer?.name || '-'} · {formatDate(so.order?.order_date)}</div>
                    </div>
                    <StatusBadge status={so.order?.status || 'draft'} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {transactions.length === 0 && purchaseOrders.length === 0 && salesOrders.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <Package size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400">No transactions or orders yet</p>
          </div>
        )}

      </div>
    </div>
  )
}
