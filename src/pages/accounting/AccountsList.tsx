import { useState, useEffect } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, Building, DollarSign } from 'lucide-react';
import { accounting } from '../../lib/api';

const typeColors: Record<string, string> = {
  asset: 'bg-blue-100 text-blue-700',
  liability: 'bg-red-100 text-red-700',
  equity: 'bg-purple-100 text-purple-700',
  revenue: 'bg-green-100 text-green-700',
  expense: 'bg-orange-100 text-orange-700',
};

const typeIcons: Record<string, React.ElementType> = {
  asset: Wallet,
  liability: Building,
  equity: DollarSign,
  revenue: TrendingUp,
  expense: TrendingDown,
};

export default function AccountsList() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', type: 'expense' });

  useEffect(() => { fetchAccounts(); }, []);
  const fetchAccounts = async () => {
    try { const res = await accounting.accounts.list(); setAccounts(res.data.data?.accounts || []); }
    catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await accounting.accounts.create(form); setForm({ name: '', code: '', type: 'expense' }); setShowForm(false); fetchAccounts(); }
    catch (e) { alert('Failed'); }
  };

  // Group by type
  const grouped = accounts.reduce((acc, a) => {
    if (!acc[a.type]) acc[a.type] = [];
    acc[a.type].push(a);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Chart of Accounts</h1><p className="text-[--text-secondary]">Manage accounts</p></div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[--primary] text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> Add Account</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-4">
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div><label className="block text-sm mb-1">Code</label><input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="px-3 py-2 border rounded-lg w-32" required /></div>
            <div><label className="block text-sm mb-1">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="px-3 py-2 border rounded-lg w-64" required /></div>
            <div><label className="block text-sm mb-1">Type</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-3 py-2 border rounded-lg"><option value="asset">Asset</option><option value="liability">Liability</option><option value="equity">Equity</option><option value="revenue">Revenue</option><option value="expense">Expense</option></select></div>
            <button type="submit" className="bg-[--primary] text-white px-4 py-2 rounded-lg">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
          </form>
        </div>
      )}

      {loading ? <div>Loading...</div> : Object.entries(grouped as Record<string, any[]>).map(([type, items]) => (
        <div key={type} className="bg-white rounded-lg border overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b flex items-center gap-2">
            {(() => { const Icon = typeIcons[type] || DollarSign; return <Icon size={18} className="text-[--secondary]" /> })()}
            <span className="font-medium capitalize">{type}</span>
            <span className="text-sm text-[--secondary]">({items.length})</span>
          </div>
          <table className="w-full">
            <tbody className="divide-y">
              {items.map((acc: any) => (
                <tr key={acc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{acc.code}</td>
                  <td className="px-4 py-3">{acc.name}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs capitalize ${typeColors[type]}`}>{type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
