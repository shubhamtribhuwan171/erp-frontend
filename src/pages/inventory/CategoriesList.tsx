import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Folder } from 'lucide-react';
import { inventory } from '../../lib/api';

export default function CategoriesList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await inventory.categories.list();
      setCategories(res.data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventory.categories.create(form);
      setForm({ name: '', code: '' });
      setShowForm(false);
      fetchCategories();
    } catch (e) { alert('Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-[--text-secondary]">Manage item categories</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[--primary] text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input type="text" placeholder="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="px-3 py-2 border rounded-lg" required />
            <input type="text" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="px-3 py-2 border rounded-lg flex-1" required />
            <button type="submit" className="bg-[--primary] text-white px-4 py-2 rounded-lg">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? <div>Loading...</div> : categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-lg border border-[--border] p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Folder size={20} className="text-[--secondary]" /></div>
            <div className="flex-1">
              <p className="font-medium">{cat.name}</p>
              <p className="text-xs text-[--secondary]">{cat.code}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
