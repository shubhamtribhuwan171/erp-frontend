import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { sales } from '../../lib/api'

function toDateInput(value?: string | null) {
  if (!value) return ''
  const d = new Date(value)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function OrderEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [customers, setCustomers] = useState<any[]>([])
  const [status, setStatus] = useState('draft')

  const [form, setForm] = useState<any>({
    customer_id: '',
    order_date: '',
    expected_ship_date: '',
    billing_address: '',
    shipping_address: '',
    notes: '',
  })

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const [orderRes, custRes] = await Promise.all([
          sales.orders.get(id),
          sales.customers.list({ limit: 200 }),
        ])
        const o = orderRes.data.data
        setStatus(o.status ?? 'draft')
        setCustomers(custRes.data.data?.customers ?? custRes.data.data ?? [])
        setForm({
          customer_id: o.customer_id ?? '',
          order_date: toDateInput(o.order_date),
          expected_ship_date: toDateInput(o.expected_ship_date),
          billing_address: o.billing_address ?? '',
          shipping_address: o.shipping_address ?? '',
          notes: o.notes ?? '',
        })
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load order')
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
      await sales.orders.update(id, {
        customer_id: form.customer_id,
        order_date: form.order_date,
        expected_ship_date: form.expected_ship_date || null,
        billing_address: form.billing_address || null,
        shipping_address: form.shipping_address || null,
        notes: form.notes || null,
      })
      navigate(`/sales/orders/${id}`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to save order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={id ? `/sales/orders/${id}` : '/sales/orders'} className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Edit Order</h1>
            <p className="text-[var(--text-secondary)]">Only draft orders can be edited</p>
          </div>
        </div>

        <button
          type="button"
          disabled={saving || loading || status !== 'draft'}
          onClick={handleSave}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
          title={status !== 'draft' ? 'Only draft orders can be edited' : ''}
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
              <label className="block text-sm font-medium mb-1">Customer</label>
              <select
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                disabled={status !== 'draft'}
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
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
              <label className="block text-sm font-medium mb-1">Expected Ship Date</label>
              <input
                type="date"
                value={form.expected_ship_date}
                onChange={(e) => setForm({ ...form, expected_ship_date: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                disabled={status !== 'draft'}
              />
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Billing Address</label>
                <textarea
                  rows={3}
                  value={form.billing_address}
                  onChange={(e) => setForm({ ...form, billing_address: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                  disabled={status !== 'draft'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Address</label>
                <textarea
                  rows={3}
                  value={form.shipping_address}
                  onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                  disabled={status !== 'draft'}
                />
              </div>
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
                This order is <span className="font-medium capitalize">{status}</span>. Only draft orders can be edited.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <p className="text-sm text-[var(--text-secondary)]">
          Line items editing is next (backend currently updates header fields here).
        </p>
      </div>
    </div>
  )
}
