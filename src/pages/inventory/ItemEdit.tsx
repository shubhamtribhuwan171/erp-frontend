import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import { inventory } from '../../lib/api'

export default function ItemEdit() {
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
      <div className="flex items-center gap-3">
        <Link to={id ? `/inventory/items/${id}` : '/inventory/items'} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft size={18} className="text-[var(--secondary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Edit Item</h1>
          <p className="text-[var(--text-secondary)]">Placeholder edit screen</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-[var(--secondary)] mt-0.5" />
          <div>
            <p className="font-medium">Edit form coming next</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              This page exists so “Edit” links don’t 404. Next we’ll convert fields into an editable form and wire save.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[var(--secondary)]">Loading…</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">{error}</div>
        ) : (
          <pre className="mt-4 text-xs bg-gray-50 border border-[var(--border)] rounded-lg p-3 overflow-auto text-left">
            {JSON.stringify(item, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
