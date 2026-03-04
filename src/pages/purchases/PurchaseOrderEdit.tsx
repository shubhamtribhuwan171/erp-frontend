import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { purchases } from '../../lib/api'

function toDateInput(value?: string | null) {
  if (!value) return ''
  const d = new Date(value)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function PurchaseOrderEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [vendors, setVendors] = useState<any[]>([])
  const [status, setStatus] = useState('draft')

  const [form, setForm] = useState<any>({
    vendor_id: '',
    order_date: '',
    expected_receipt_date: '',
    notes: '',
  })

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const [poRes, vendorRes] = await Promise.all([
          purchases.orders.get(id),
          purchases.vendors.list({ limit: 200 }),
        ])
        const p = poRes.data.data
        setStatus(p.status ?? 'draft')
        setVendors(vendorRes.data.data?.vendors ?? vendorRes.data.data ?? [])
        setForm({
          vendor_id: p.vendor_id ?? '',
          order_date: toDateInput(p.order_date),
          expected_receipt_date: toDateInput(p.expected_receipt_date),
          notes: p.notes ?? '',
        })
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load purchase order')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    setError('')
    try {
      await purchases.orders.update(id, {
        vendor_id: form.vendor_id,
        order_date: form.order_date,
        expected_receipt_date: form.expected_receipt_date || null,
        notes: form.notes || null,
      })
      navigate(`/purchases/orders/${id}`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to save purchase order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={id ? `/purchases/orders/${id}` : '/purchases/orders'} className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Edit Purchase Order</h1>
            <p className="text-[var(--text-secondary)]">Only draft POs can be edited</p>
          </div>
        </div>

        <button
          type="button"
          disabled={saving || loading || status !== 'draft'}
          onClick={handleSave}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
          title={status !== 'draft' ? 'Only draft purchase orders can be edited' : ''}
        >
          <Save size={18} />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        {loading ? (
          <div className="py-8 text-center text-[var(--secondary)]">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor</label>
              <select
                value={form.vendor_id}
                onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                disabled={status !== 'draft'}
              >
                <option value="">Select vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Order Date</label>
              <input
                type="date"
                value={form.order_date}
                onChange={(e) => setForm({ ...form, order_date: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                disabled={status !== 'draft'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expected Receipt Date</label>
              <input
                type="date"
                value={form.expected_receipt_date}
                onChange={(e) => setForm({ ...form, expected_receipt_date: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                disabled={status !== 'draft'}
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                disabled={status !== 'draft'}
              />
            </div>

            {status !== 'draft' && (
              <div className="md:col-span-3 text-sm text-[var(--text-secondary)]">
                This PO is <span className="font-medium capitalize">{status}</span>. Only draft POs can be edited.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm text-[var(--text-secondary)]">Line items editing is next.</p>
      </div>
    </div>
  )
}
