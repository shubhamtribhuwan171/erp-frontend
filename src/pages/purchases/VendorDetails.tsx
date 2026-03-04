import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Mail, Phone, Landmark, MapPin } from 'lucide-react'
import { purchases } from '../../lib/api'

export default function VendorDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [vendor, setVendor] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await purchases.vendors.get(id)
        setVendor(res.data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load vendor')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const statusBadge = useMemo(() => {
    const s = String(vendor?.status ?? 'active').toLowerCase()
    return s === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
  }, [vendor?.status])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/purchases/vendors" className="p-2 hover:bg-gray-100 rounded" title="Back">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Vendor</h1>
            <p className="text-[var(--text-secondary)]">Vendor details</p>
          </div>
        </div>

        {id && (
          <Link
            to={`/purchases/vendors/${id}/edit`}
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
        ) : !vendor ? (
          <div className="py-8 text-center text-[var(--secondary)]">Vendor not found</div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-[var(--text-secondary)]">Name</div>
                <div className="text-lg font-semibold">{vendor.name ?? '-'}</div>
                <div className="text-sm text-[var(--text-secondary)] font-mono">{vendor.code ?? ''}</div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs capitalize ${statusBadge}`}>
                {vendor.status ?? 'active'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                  <Mail size={14} /> Email
                </div>
                <div className="mt-1 font-medium">{vendor.email ?? '-'}</div>
              </div>
              <div className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                  <Phone size={14} /> Phone
                </div>
                <div className="mt-1 font-medium">{vendor.phone ?? '-'}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                  <MapPin size={14} /> Address
                </div>
                <div className="mt-1 whitespace-pre-wrap">{vendor.address ?? '-'}</div>
              </div>
              <div className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                  <Landmark size={14} /> Payment Terms
                </div>
                <div className="mt-1 font-medium">
                  {vendor.payment_terms_days !== null && vendor.payment_terms_days !== undefined
                    ? `${vendor.payment_terms_days} days`
                    : '-'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
