import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { sales } from '../../lib/api'

export default function CustomerDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await sales.customers.get(id)
        setCustomer(res.data.data?.customer ?? res.data.data ?? res.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load customer')
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
          <Link to="/sales/customers" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Customer Details</h1>
            <p className="text-[var(--text-secondary)]">View customer information</p>
          </div>
        </div>

        {id && (
          <Link
            to={`/sales/customers/${id}/edit`}
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
        ) : !customer ? (
          <div className="py-8 text-center text-[var(--secondary)]">Customer not found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[var(--text-secondary)]">Name</div>
              <div className="font-medium">{customer.name ?? '-'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Code</div>
              <div className="font-mono">{customer.code ?? '-'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Email</div>
              <div className="font-medium">{customer.email ?? '-'}</div>
            </div>
            <div>
              <div className="text-[var(--text-secondary)]">Phone</div>
              <div className="font-medium">{customer.phone ?? '-'}</div>
            </div>
          </div>
        )}
      </div>

      {!loading && customer && (
        <div className="bg-white rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Raw payload (for now)</h2>
            <span className="text-xs text-[var(--text-secondary)]">Placeholder detail view</span>
          </div>
          <pre className="mt-3 text-xs bg-gray-50 border border-[var(--border)] rounded-lg p-3 overflow-auto text-left">
            {JSON.stringify(customer, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
