import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { inventory } from '../../lib/api'

export default function ItemEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [categories, setCategories] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])

  const [form, setForm] = useState<any>({
    name: '',
    description: '',
    category_id: '',
    unit_id: '',
    track_inventory: true,
    is_serialized: false,
    is_batch_tracked: false,
    reorder_level: 0,
    reorder_qty: 0,
    standard_cost_minor: 0,
    sale_price_minor: 0,
    status: 'active',
  })

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setLoading(true)
      setError('')
      try {
        const [itemRes, catRes, unitRes] = await Promise.all([
          inventory.items.get(id),
          inventory.categories.list(),
          inventory.units.list(),
        ])

        const it = itemRes.data.data
        setCategories(catRes.data.data ?? [])
        setUnits(unitRes.data.data ?? [])

        setForm({
          name: it.name ?? '',
          description: it.description ?? '',
          category_id: it.category_id ?? '',
          unit_id: it.unit_id ?? '',
          track_inventory: !!it.track_inventory,
          is_serialized: !!it.is_serialized,
          is_batch_tracked: !!it.is_batch_tracked,
          reorder_level: it.reorder_level ?? 0,
          reorder_qty: it.reorder_qty ?? 0,
          standard_cost_minor: it.standard_cost_minor ?? 0,
          sale_price_minor: it.sale_price_minor ?? 0,
          status: it.status ?? 'active',
        })
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load item')
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
      await inventory.items.update(id, {
        ...form,
        reorder_level: Number(form.reorder_level) || 0,
        reorder_qty: Number(form.reorder_qty) || 0,
        standard_cost_minor: Number(form.standard_cost_minor) || 0,
        sale_price_minor: Number(form.sale_price_minor) || 0,
      })
      navigate(`/inventory/items/${id}`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={id ? `/inventory/items/${id}` : '/inventory/items'} className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={18} className="text-[var(--secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Edit Item</h1>
            <p className="text-[var(--text-secondary)]">Update item details</p>
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
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg">
                <option value="">Select unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.code ?? u.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form.track_inventory} onChange={(e) => setForm({ ...form, track_inventory: e.target.checked })} />
                Track inventory
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form.is_serialized} onChange={(e) => setForm({ ...form, is_serialized: e.target.checked })} />
                Serialized
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form.is_batch_tracked} onChange={(e) => setForm({ ...form, is_batch_tracked: e.target.checked })} />
                Batch tracked
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reorder Level</label>
              <input type="number" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reorder Qty</label>
              <input type="number" value={form.reorder_qty} onChange={(e) => setForm({ ...form, reorder_qty: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Standard Cost (minor)</label>
              <input type="number" value={form.standard_cost_minor} onChange={(e) => setForm({ ...form, standard_cost_minor: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sale Price (minor)</label>
              <input type="number" value={form.sale_price_minor} onChange={(e) => setForm({ ...form, sale_price_minor: e.target.value })} className="w-full px-3 py-2 border border-[var(--border)] rounded-lg" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
