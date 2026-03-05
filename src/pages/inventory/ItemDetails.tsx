import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Boxes, Package, ShoppingCart, Truck, TrendingUp, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react'
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
    quotation: 'bg-orange-100 text-orange-700',
    purchase: 'bg-blue-100 text-blue-700',
    sale: 'bg-purple-100 text-purple-700',
    adjustment: 'bg-yellow-100 text-yellow-700',
    transfer: 'bg-cyan-100 text-cyan-700',
    return: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

function TxnBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string, icon: any }> = {
    purchase_in: { bg: 'bg-blue-100 text-blue-700', icon: ArrowDown },
    purchase: { bg: 'bg-blue-100 text-blue-700', icon: ArrowDown },
    sales_out: { bg: 'bg-purple-100 text-purple-700', icon: ArrowUp },
    sale: { bg: 'bg-purple-100 text-purple-700', icon: ArrowUp },
    adjustment: { bg: 'bg-yellow-100 text-yellow-700', icon: TrendingUp },
    transfer: { bg: 'bg-cyan-100 text-cyan-700', icon: Truck },
    return: { bg: 'bg-red-100 text-red-700', icon: ArrowDown },
  }
  const cfg = config[type] || { bg: 'bg-gray-100 text-gray-700', icon: TrendingUp }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs capitalize ${cfg.bg}`}>
      <Icon size={12} /> {type?.replace('_', ' ')}
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
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/inventory/items" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Item</h1>
            <p className="text-[var(--text-secondary)]">Item details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--secondary)]">
          Loading...
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/inventory/items" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Item</h1>
            <p className="text-[var(--text-secondary)]">Item details</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-red-600">
          {error || 'Item not found'}
        </div>
      </div>
    )
  }

  const { stats = {}, stock = [], transactions = [], purchaseOrders = [], salesOrders = [] } = item
  const totalOnHand = stats.totalOnHand ?? totalStock
  const needsReorder = stats.needsReorder ?? (totalOnHand <= (item.reorder_level || 0))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/inventory/items" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Item</h1>
            <p className="text-[var(--text-secondary)]">Item details</p>
          </div>
        </div>

        {id && (
          <Link
            to={`/inventory/items/${id}/edit`}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Edit size={18} />
            Edit
          </Link>
        )}
      </div>

      {/* Reorder Alert */}
      {needsReorder && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-yellow-600" />
          <div>
            <div className="font-medium text-yellow-800">Low Stock Alert</div>
            <div className="text-sm text-yellow-700">
              Current stock ({totalOnHand}) is below reorder level ({item.reorder_level || 0})
            </div>
          </div>
        </div>
      )}

      {/* Basic Info Card */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-[var(--text-secondary)]">Name</div>
            <div className="font-semibold text-base">{item.name ?? '-'}</div>
            <div className="text-[var(--text-secondary)] font-mono">{item.sku ?? ''}</div>
          </div>
          <div>
            <div className="text-[var(--text-secondary)]">Category</div>
            <div className="font-medium">{item.category?.name ?? '-'}</div>
            <div className="text-[var(--text-secondary)]">Unit: {item.unit?.code ?? item.unit?.name ?? '-'}</div>
          </div>
          <div>
            <div className="text-[var(--text-secondary)]">Pricing</div>
            <div className="font-medium">Cost: {formatCurrency(item.standard_cost_minor)}</div>
            <div className="font-medium">Price: {formatCurrency(item.sale_price_minor)}</div>
          </div>
          <div>
            <div className="text-[var(--text-secondary)]">Inventory</div>
            <div className="font-semibold text-lg">{totalOnHand}</div>
            <div className="text-xs text-[var(--text-secondary)]">Reorder at: {item.reorder_level || 0}</div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-[var(--text-secondary)] text-xs">Description</div>
            <div className="mt-1 text-sm">{item.description}</div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Boxes size={14} /> On Hand
            </div>
            <div className={`text-lg font-semibold mt-1 ${needsReorder ? 'text-yellow-600' : ''}`}>
              {totalOnHand}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <ArrowDown size={14} className="text-blue-500" /> Purchased
            </div>
            <div className="text-lg font-semibold mt-1">{stats.totalPurchased || 0}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <ArrowUp size={14} className="text-purple-500" /> Sold
            </div>
            <div className="text-lg font-semibold mt-1">{stats.totalSold || 0}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <Truck size={14} /> P.Orders
            </div>
            <div className="text-lg font-semibold mt-1">{purchaseOrders?.length || 0}</div>
          </div>
          <div className="bg-white rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
              <ShoppingCart size={14} /> S.Orders
            </div>
            <div className="text-lg font-semibold mt-1">{salesOrders?.length || 0}</div>
          </div>
        </div>
      )}

      {/* Stock by Warehouse */}
      {stock.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-strong)]">
            <div className="flex items-center gap-2">
              <Boxes size={18} className="text-[var(--secondary)]" />
              <h2 className="font-semibold">Stock by Warehouse</h2>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Warehouse</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">On Hand</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Reserved</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-strong)]">
              {stock.map((row: any) => {
                const onHand = Number(row.qty_on_hand ?? row.on_hand ?? 0) || 0
                const reserved = Number(row.qty_reserved ?? row.reserved ?? 0) || 0
                const available = onHand - reserved
                return (
                  <tr key={row.id ?? row.warehouse_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{row.warehouse?.name ?? row.warehouse_code ?? row.warehouse_id ?? '-'}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">{onHand}</td>
                    <td className="px-4 py-3 text-right text-sm">{reserved}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">{available}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--secondary)]" />
              <h2 className="font-semibold">Recent Transactions</h2>
            </div>
            <Link to="/inventory/transactions" className="text-sm text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[var(--text-secondary)]">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Type</th>
                  <th className="text-left px-4 py-2 font-medium">Warehouse</th>
                  <th className="text-right px-4 py-2 font-medium">Qty</th>
                  <th className="text-left px-4 py-2 font-medium">Reference</th>
                  <th className="text-left px-4 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((txn: any) => (
                  <tr key={txn.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                    <td className="px-4 py-2">{formatDate(txn.created_at)}</td>
                    <td className="px-4 py-2"><TxnBadge type={txn.txn_type || txn.transaction_type} /></td>
                    <td className="px-4 py-2">{txn.warehouse?.name ?? '-'}</td>
                    <td className="px-4 py-2 text-right font-medium">{txn.qty || txn.quantity}</td>
                    <td className="px-4 py-2 font-mono text-xs">{txn.reference?.order_no || txn.reference_type || '-'}</td>
                    <td className="px-4 py-2 text-[var(--text-secondary)] truncate max-w-xs">{txn.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Orders */}
      {purchaseOrders && purchaseOrders.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-blue-500" />
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
                  <th className="text-left px-4 py-2 font-medium">Vendor</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-right px-4 py-2 font-medium">Qty</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.slice(0, 5).map((po: any) => (
                  <tr key={po.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{po.order?.po_no || '-'}</td>
                    <td className="px-4 py-2">{po.order?.vendor?.name || '-'}</td>
                    <td className="px-4 py-2">{formatDate(po.order?.order_date)}</td>
                    <td className="px-4 py-2 text-right font-medium">{po.qty || po.quantity}</td>
                    <td className="px-4 py-2 text-center"><StatusBadge status={po.order?.status || 'draft'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales Orders */}
      {salesOrders && salesOrders.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-purple-500" />
              <h2 className="font-semibold">Sales Orders</h2>
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
                  <th className="text-left px-4 py-2 font-medium">Customer</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-right px-4 py-2 font-medium">Qty</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {salesOrders.slice(0, 5).map((so: any) => (
                  <tr key={so.id} className="border-t border-[var(--border)] hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{so.order?.order_no || '-'}</td>
                    <td className="px-4 py-2">{so.order?.customer?.name || '-'}</td>
                    <td className="px-4 py-2">{formatDate(so.order?.order_date)}</td>
                    <td className="px-4 py-2 text-right font-medium">{so.qty || so.quantity}</td>
                    <td className="px-4 py-2 text-center"><StatusBadge status={so.order?.status || 'draft'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {transactions.length === 0 && purchaseOrders.length === 0 && salesOrders.length === 0 && (
        <div className="bg-white rounded-lg border border-[var(--border)] p-8 text-center text-[var(--text-secondary)]">
          <Package size={32} className="mx-auto mb-2 opacity-50" />
          <p>No transactions or orders yet</p>
        </div>
      )}
    </div>
  )
}
