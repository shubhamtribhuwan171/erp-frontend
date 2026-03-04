import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { sales } from '../../lib/api'

export default function OrderDetails() {
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
        <div>
          <div className="flex items-center gap-3">
            <Link to="/sales/orders" className="p-2 hover:bg-gray-100 rounded" title="Back">
              <ArrowLeft size={18} className="text-[var(--secondary)]" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Order Details</h1>
              <p className="text-[var(--text-secondary)]">View sales order information</p>
            </div>
          </div>
        </div>

        {id && (
          <Link
            to={`/sales/orders/${id}/edit`}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
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
        ) : !order ? (
          <div className="py-8 text-center text-[var(--secondary)]">Order not found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[var(--text-secondary)]">Order #</div>
              <div className="font-mono">{order.order_no ?? order.id}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Status</div>
              <div className="font-medium capitalize">{order.status ?? '-'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Customer</div>
              <div className="font-medium">{order.customer?.name ?? order.customer_name ?? 'N/A'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Order Date</div>
              <div className="font-medium">
                {order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN') : '-'}
              </div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Total</div>
              <div className="font-medium">{order.total_minor ?? order.total ?? '-'}</div>
            </div>
          </div>
        )}
      </div>

      {!loading && order && (
        <div className="bg-white rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Raw payload (for now)</h2>
            <span className="text-xs text-[var(--text-secondary)]">Placeholder detail view</span>
          </div>
          <pre className="mt-3 text-xs bg-gray-50 border border-[var(--border)] rounded-lg p-3 overflow-auto text-left">
            {JSON.stringify(order, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
