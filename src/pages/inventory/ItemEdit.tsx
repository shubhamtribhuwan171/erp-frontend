import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Package } from 'lucide-react'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to={`/inventory/items/${id}`} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="space-y-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/inventory/items/${id}`} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Edit Item</h1>
              <p className="text-sm text-gray-400">Update item details</p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving || loading}
            onClick={handleSave}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Name & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  value={form.status} 
                  onChange={(e) => setForm({ ...form, status: e.target.value })} 
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Category & Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  value={form.category_id} 
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })} 
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <select 
                  value={form.unit_id} 
                  onChange={(e) => setForm({ ...form, unit_id: e.target.value })} 
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                >
                  <option value="">Select unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.code ?? u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                rows={3} 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all resize-none"
                placeholder="Enter description (optional)"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">Pricing</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Cost (₹)</label>
                <input 
                  type="number" 
                  value={form.standard_cost_minor} 
                  onChange={(e) => setForm({ ...form, standard_cost_minor: e.target.value })} 
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (₹)</label>
                <input 
                  type="number" 
                  value={form.sale_price_minor} 
                  onChange={(e) => setForm({ ...form, sale_price_minor: e.target.value })} 
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">Inventory Settings</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={!!form.track_inventory} 
                  onChange={(e) => setForm({ ...form, track_inventory: e.target.checked })} 
                  className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-200"
                />
                <span className="text-sm text-gray-700">Track Inventory</span>
              </label>
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={!!form.is_serialized} 
                  onChange={(e) => setForm({ ...form, is_serialized: e.target.checked })} 
                  className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-200"
                />
                <span className="text-sm text-gray-700">Serialized</span>
              </label>
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={!!form.is_batch_tracked} 
                  onChange={(e) => setForm({ ...form, is_batch_tracked: e.target.checked })} 
                  className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-200"
                />
                <span className="text-sm text-gray-700">Batch Tracked</span>
              </label>
            </div>

            {/* Reorder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
                <input 
                  type="number" 
                  value={form.reorder_level} 
                  onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} 
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                  placeholder="0"
                />
                <p className="mt-1.5 text-xs text-gray-400">Alert when stock falls below this</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Quantity</label>
                <input 
                  type="number" 
                  value={form.reorder_qty} 
                  onChange={(e) => setForm({ ...form, reorder_qty: e.target.value })} 
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                  placeholder="0"
                />
                <p className="mt-1.5 text-xs text-gray-400">Default quantity to reorder</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
