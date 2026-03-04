import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import { sales } from '../../lib/api'

export default function OrderEdit() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await sales.orders.get(id)
        setOrder(res.data.data?.order ?? res.data.data ?? res.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load order')
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
          <Link to={id ? `/sales/orders/${id}` : '/sales/orders'} className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Edit Order</h1>
            <p className="text-[var(--text-secondary)]">Placeholder edit screen</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Info size={18} className="text-[var(--secondary)]" />
          </div>
          <div>
            <p className="font-medium">Editing UI coming next</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              For now this page confirms routing and loads the order. Next we’ll convert fields into a proper form and wire save.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[var(--secondary)]">Loading…</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">{error}</div>
        ) : (
          <pre className="mt-4 text-xs bg-gray-50 border border-[var(--border)] rounded-lg p-3 overflow-auto text-left">
            {JSON.stringify(order, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
