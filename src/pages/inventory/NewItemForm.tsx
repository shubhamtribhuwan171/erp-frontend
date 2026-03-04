import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Package } from 'lucide-react';
import { inventory } from '../../lib/api';

export default function NewItemForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    unit_id: '',
    standard_cost_minor: '',
    sale_price_minor: '',
    reorder_level: '',
    reorder_qty: '',
    track_inventory: true,
    is_active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, unitRes] = await Promise.all([
          inventory.categories.list(),
          inventory.units.list(),
        ]);
        setCategories(catRes.data.data || []);
        setUnits(unitRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        standard_cost_minor: form.standard_cost_minor ? parseFloat(form.standard_cost_minor) * 100 : 0,
        sale_price_minor: form.sale_price_minor ? parseFloat(form.sale_price_minor) * 100 : 0,
        reorder_level: form.reorder_level ? parseInt(form.reorder_level) : null,
        reorder_qty: form.reorder_qty ? parseInt(form.reorder_qty) : null,
      };
      await inventory.items.create(data);
      navigate('/inventory/items');
    } catch (error) {
      alert('Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/inventory/items')}
        className="flex items-center gap-2 text-[var(--secondary)] hover:text-[var(--text-primary)] mb-4"
      >
        <ArrowLeft size={18} />
        Back to Items
      </button>

      <div className="bg-white rounded-lg border border-[var(--border)]">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-[var(--primary)]" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">New Item</h1>
              <p className="text-sm text-[var(--text-secondary)]">Add a new inventory item</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SKU *</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="SKU-0001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Laptop"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                rows={3}
                placeholder="Item description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Unit *</label>
              <select
                value={form.unit_id}
                onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name} ({unit.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cost Price (₹)</label>
              <input
                type="number"
                value={form.standard_cost_minor}
                onChange={(e) => setForm({ ...form, standard_cost_minor: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Selling Price (₹)</label>
              <input
                type="number"
                value={form.sale_price_minor}
                onChange={(e) => setForm({ ...form, sale_price_minor: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reorder Level</label>
              <input
                type="number"
                value={form.reorder_level}
                onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reorder Quantity</label>
              <input
                type="number"
                value={form.reorder_qty}
                onChange={(e) => setForm({ ...form, reorder_qty: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="50"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.track_inventory}
                  onChange={(e) => setForm({ ...form, track_inventory: e.target.checked })}
                  className="rounded border-[var(--border)]"
                />
                <span className="text-sm">Track Inventory</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-[var(--border)]"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => navigate('/inventory/items')}
              className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
