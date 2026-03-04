import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { purchases } from '../../lib/api'

export default function VendorEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<any>({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
    payment_terms_days: 0,
    default_lead_time_days: 0,
    bank_details: '',
    status: 'active',
  })

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await purchases.vendors.get(id)
        const v = res.data.data
        setForm({
          name: v.name ?? '',
          email: v.email ?? '',
          phone: v.phone ?? '',
          address: v.address ?? '',
          tax_id: v.tax_id ?? '',
          payment_terms_days: v.payment_terms_days ?? 0,
          default_lead_time_days: v.default_lead_time_days ?? 0,
          bank_details: v.bank_details ?? '',
          status: v.status ?? 'active',
        })
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load vendor')
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
      await purchases.vendors.update(id, {
        ...form,
        payment_terms_days: Number(form.payment_terms_days) || 0,
        default_lead_time_days: Number(form.default_lead_time_days) || 0,
      })
      navigate(`/purchases/vendors/${id}`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to save vendor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={id ? `/purchases/vendors/${id}` : '/purchases/vendors'} className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Edit Vendor</h1>
            <p className="text-[var(--text-secondary)]">Update vendor details</p>
          </div>
        </div>

        <button
          type="button"
          disabled={saving || loading}
          onClick={handleSave}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tax ID</label>
              <input value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Terms (days)</label>
              <input type="number" value={form.payment_terms_days} onChange={(e) => setForm({ ...form, payment_terms_days: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Lead Time (days)</label>
              <input type="number" value={form.default_lead_time_days} onChange={(e) => setForm({ ...form, default_lead_time_days: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Bank Details</label>
              <textarea rows={3} value={form.bank_details} onChange={(e) => setForm({ ...form, bank_details: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
