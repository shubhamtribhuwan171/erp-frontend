import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, Phone, MapPin } from 'lucide-react'
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
        setCustomer(res.data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load customer')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const statusBadge = useMemo(() => {
    const s = String(customer?.status ?? 'active').toLowerCase()
    return s === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
  }, [customer?.status])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/sales/customers" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Customer</h1>
            <p className="text-[var(--text-secondary)]">Customer details</p>
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
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-[var(--text-secondary)]">Name</div>
                <div className="text-lg font-semibold">{customer.name ?? '-'}</div>
                <div className="text-sm text-[var(--text-secondary)] font-mono">{customer.code ?? ''}</div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs capitalize ${statusBadge}`}>
                {customer.status ?? 'active'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                  <Mail size={14} /> Email
                </div>
                <div className="mt-1 font-medium">{customer.email ?? '-'}</div>
              </div>
              <div className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                  <Phone size={14} /> Phone
                </div>
                <div className="mt-1 font-medium">{customer.phone ?? '-'}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                  <MapPin size={14} /> Billing Address
                </div>
                <div className="mt-1 whitespace-pre-wrap">{customer.billing_address ?? '-'}</div>
              </div>
              <div className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                  <MapPin size={14} /> Shipping Address
                </div>
                <div className="mt-1 whitespace-pre-wrap">{customer.shipping_address ?? '-'}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
