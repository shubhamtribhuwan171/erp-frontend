import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User, Mail, Phone } from 'lucide-react';
import { crm } from '../../lib/api';

export default function ContactsList() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crm.contacts.list().then(res => {
      setContacts(res.data.data?.contacts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Contacts</h1><p className="text-[--secondary]">All contacts</p></div>
        <Link to="/crm/contacts/new" className="bg-[--primary] text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> Add Contact</Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[--secondary]">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[--secondary]">Code</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[--secondary]">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[--secondary]">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={4} className="px-4 py-8 text-center">Loading...</td></tr> :
            contacts.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-[--secondary]">No contacts</td></tr> :
            contacts.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">{c.name?.charAt(0)}</div>
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[--secondary]">{c.code}</td>
                <td className="px-4 py-3 text-sm">{c.email || '-'}</td>
                <td className="px-4 py-3 text-sm">{c.phone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
