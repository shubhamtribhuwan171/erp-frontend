import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { sales } from '../../lib/api'

export default function CustomerEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<any>({
    name: '',
    email: '',
    phone: '',
    billing_address: '',
    shipping_address: '',
    tax_id: '',
    payment_terms_days: 0,
    credit_limit_minor: 0,
    status: 'active',
  })

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const res = await sales.customers.get(id)
        const c = res.data.data
        setForm({
          name: c.name ?? '',
          email: c.email ?? '',
          phone: c.phone ?? '',
          billing_address: c.billing_address ?? '',
          shipping_address: c.shipping_address ?? '',
          tax_id: c.tax_id ?? '',
          payment_terms_days: c.payment_terms_days ?? 0,
          credit_limit_minor: c.credit_limit_minor ?? 0,
          status: c.status ?? 'active',
        })
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load customer')
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
      await sales.customers.update(id, {
        ...form,
        payment_terms_days: Number(form.payment_terms_days) || 0,
        credit_limit_minor: Number(form.credit_limit_minor) || 0,
      })
      navigate(`/sales/customers/${id}`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to save customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={id ? `/sales/customers/${id}` : '/sales/customers'} className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Edit Customer</h1>
            <p className="text-[var(--text-secondary)]">Update customer details</p>
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
              <label className="block text-sm font-medium mb-1">Credit Limit (minor)</label>
              <input type="number" value={form.credit_limit_minor} onChange={(e) => setForm({ ...form, credit_limit_minor: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Billing Address</label>
              <textarea rows={3} value={form.billing_address} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Shipping Address</label>
              <textarea rows={3} value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
