import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { purchases } from '../../lib/api'

export default function PurchaseOrderDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [po, setPo] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await purchases.orders.get(id)
        setPo(res.data.data?.order ?? res.data.data ?? res.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load purchase order')
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
          <Link to="/purchases/orders" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Purchase Order Details</h1>
            <p className="text-[var(--text-secondary)]">View purchase order information</p>
          </div>
        </div>

        {id && (
          <Link
            to={`/purchases/orders/${id}/edit`}
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
        ) : !po ? (
          <div className="py-8 text-center text-[var(--secondary)]">Purchase order not found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[var(--text-secondary)]">PO #</div>
              <div className="font-mono">{po.po_no ?? po.order_no ?? po.id}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Status</div>
              <div className="font-medium capitalize">{po.status ?? '-'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Vendor</div>
              <div className="font-medium">{po.vendor?.name ?? po.vendor_name ?? 'N/A'}</div>
            </div>
          </div>
        )}
      </div>

      {!loading && po && (
        <div className="bg-white rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Raw payload (for now)</h2>
            <span className="text-xs text-[var(--text-secondary)]">Placeholder detail view</span>
          </div>
          <pre className="mt-3 text-xs bg-gray-50 border border-[var(--border)] rounded-lg p-3 overflow-auto text-left">
            {JSON.stringify(po, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
