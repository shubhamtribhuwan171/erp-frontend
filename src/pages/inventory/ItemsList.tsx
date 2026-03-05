import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Edit, Trash2, Eye, Package } from 'lucide-react'
import { inventory } from '../../lib/api'
import { getApiErrorMessage, isForbidden, isModuleDisabledError } from '../../lib/api-error'
import { ErrorState, ForbiddenState, ModuleDisabledState } from '../../components/ui/RequestState'
import { DataTable, PageHeader, SearchInput, StatusBadge } from '../../components/ui'

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

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      render: (item: any) => (
        <Link to={`/inventory/items/${item.id}`} className="font-mono text-sm text-gray-500 hover:text-gray-700">
          {item.sku || '-'}
        </Link>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (item: any) => (
        <Link to={`/inventory/items/${item.id}`} className="font-medium text-gray-900 hover:text-gray-700">
          {item.name}
        </Link>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: any) => item.category?.name || '-',
    },
    {
      key: 'standard_cost_minor',
      header: 'Cost',
      align: 'right' as const,
      render: (item: any) => formatCurrency(item.standard_cost_minor),
    },
    {
      key: 'sale_price_minor',
      header: 'Price',
      align: 'right' as const,
      render: (item: any) => <span className="font-medium">{formatCurrency(item.sale_price_minor)}</span>,
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right' as const,
      render: (item: any) => {
        const stock = item.stock?.[0]?.qty_on_hand || 0
        const reorderLevel = item.reorder_level || 0
        const isLow = stock <= reorderLevel
        return (
          <span className={isLow ? 'text-amber-600 font-medium' : ''}>
            {stock}
          </span>
        )
      },
    },
  ]

  const actions = [
    { icon: 'view' as const, path: (item: any) => `/inventory/items/${item.id}` },
    { icon: 'edit' as const, path: (item: any) => `/inventory/items/${item.id}/edit` },
    { icon: 'delete' as const, onClick: (item: any) => handleDelete(item.id) },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <PageHeader
          icon={Package}
          title="Items"
          subtitle="Manage your inventory"
          actions={
            <Link
              to="/inventory/items/new"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Item
            </Link>
          }
        />

        <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search items..."
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          emptyTitle="No items found"
          emptyDescription="Add your first item to get started"
          emptyActionLabel="Add Item"
          emptyActionPath="/inventory/items/new"
          actions={actions}
        />

      </div>
    </div>
  )
}
