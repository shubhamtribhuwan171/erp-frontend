import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, Package, AlertTriangle } from 'lucide-react'
import { inventory } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'

export default function ItemsList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await inventory.items.list({ search })
        setItems(response.data.data?.items || [])
      } catch (e) {
        console.error('Failed to fetch items', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [search])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((amount || 0) / 100)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      await inventory.items.delete(id)
      setItems(items.filter((item) => item.id !== id))
    } catch (e) {
      setError(e)
      alert(getApiErrorMessage(e))
    }
  }

  if (error) {
    if (isModuleDisabledError(error)) return <ModuleDisabledState moduleName="Inventory" />
    if (isForbidden(error)) return <ForbiddenState />
    return <ErrorState message={getApiErrorMessage(error)} />
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center">
              <Package size={24} className="text-gray-300" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Items</h1>
              <p className="text-sm text-gray-400">Manage your inventory</p>
            </div>
          </div>
          <Link
            to="/inventory/items/new"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Item
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">SKU</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Cost</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-300">
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400">No items found.</p>
                    <Link to="/inventory/items/new" className="text-sm text-gray-900 hover:underline mt-2 inline-block">
                      Add your first item
                    </Link>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const stock = Number(item.stock?.[0]?.qty_on_hand ?? item.on_hand ?? 0) || 0
                  const needsReorder = stock <= (item.reorder_level || 0)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-500">{item.sku || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/inventory/items/${item.id}`} className="font-medium text-gray-900 hover:text-gray-700">
                          {item.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.category?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-500">{formatCurrency(item.standard_cost_minor)}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-500">{formatCurrency(item.sale_price_minor)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {needsReorder && item.track_inventory && (
                            <AlertTriangle size={14} className="text-amber-500" />
                          )}
                          <span className={`font-medium ${needsReorder ? 'text-amber-600' : 'text-gray-900'}`}>
                            {stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/inventory/items/${item.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                            <Eye size={16} className="text-gray-400" />
                          </Link>
                          <Link to={`/inventory/items/${item.id}/edit`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                            <Edit size={16} className="text-gray-400" />
                          </Link>
                          <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
