import { useState, useEffect } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { inventory } from '../../lib/api';

export default function WarehousesList() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', is_default: false });

  useEffect(() => { fetchWarehouses(); }, []);
  const fetchWarehouses = async () => {
    try { const res = await inventory.warehouses.list(); setWarehouses(res.data.data || []); }
    catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await inventory.warehouses.create(form); setForm({name:'',code:'',is_default:false}); setShowForm(false); fetchWarehouses(); }
    catch (e) { alert('Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Warehouses</h1><p className="text-[var(--text-secondary)]">Manage warehouses</p></div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> Add Warehouse</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-4">
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div><label className="block text-sm mb-1">Code</label><input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="px-3 py-2 border rounded-lg" required /></div>
            <div className="flex-1"><label className="block text-sm mb-1">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
            <label className="flex items-center gap-2 pb-2"><input type="checkbox" checked={form.is_default} onChange={e => setForm({...form, is_default: e.target.checked})} /> Default</label>
            <button type="submit" className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? <div>Loading...</div> : warehouses.map(w => (
          <div key={w.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><MapPin size={20} className="text-blue-600" /></div>
              <div><p className="font-medium">{w.name}</p><p className="text-sm text-[var(--secondary)]">{w.code}</p></div>
            </div>
            {w.is_default && <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Default</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
