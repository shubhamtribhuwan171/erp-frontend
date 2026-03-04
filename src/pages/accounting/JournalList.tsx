import { useState, useEffect } from 'react';
import { FileText, Plus } from 'lucide-react';
import { accounting } from '../../lib/api';

export default function JournalList() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEntries(); }, []);
  const fetchEntries = async () => {
    try { const res = await accounting.journal.list(); setEntries(res.data.data?.entries || []); }
    catch (e) { console.error(e); }
    setLoading(false);
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    posted: 'bg-green-100 text-green-700',
    void: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Journal Entries</h1><p className="text-[--text-secondary]">View journal entries</p></div>
        <button className="bg-[--primary] text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> New Entry</button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[--secondary]">Entry #</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[--secondary]">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[--secondary]">Description</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-[--secondary]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={4} className="px-4 py-8 text-center">Loading...</td></tr> : 
            entries.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-[--secondary]">No journal entries</td></tr> :
            entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">{entry.entry_no}</td>
                <td className="px-4 py-3">{new Date(entry.entry_date).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">{entry.memo || '-'}</td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded text-xs ${statusColors[entry.status] || 'bg-gray-100'}`}>{entry.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
