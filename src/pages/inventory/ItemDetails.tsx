import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { inventory } from '../../lib/api'

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
        setItem(res.data.data?.item ?? res.data.data ?? res.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load item')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/inventory/items" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Item Details</h1>
            <p className="text-[var(--text-secondary)]">View item information</p>
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

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        {loading ? (
          <div className="py-8 text-center text-[var(--secondary)]">Loading…</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">{error}</div>
        ) : !item ? (
          <div className="py-8 text-center text-[var(--secondary)]">Item not found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[var(--text-secondary)]">SKU</div>
              <div className="font-mono">{item.sku ?? '-'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Name</div>
              <div className="font-medium">{item.name ?? '-'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Category</div>
              <div className="font-medium">{item.category?.name ?? '-'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Track Inventory</div>
              <div className="font-medium">{String(!!item.track_inventory)}</div>
            </div>
          </div>
        )}
      </div>

      {!loading && item && (
        <div className="bg-white rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Raw payload (for now)</h2>
            <span className="text-xs text-[var(--text-secondary)]">Placeholder detail view</span>
          </div>
          <pre className="mt-3 text-xs bg-gray-50 border border-[var(--border)] rounded-lg p-3 overflow-auto text-left">
            {JSON.stringify(item, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
