import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail } from 'lucide-react';
import { purchases } from '../../lib/api';

export default function VendorsList() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await purchases.vendors.list({ search });
        setVendors(response.data.data?.vendors || []);
      } catch (error) {
        console.error('Failed to fetch vendors');
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vendor?')) return;
    try {
      await purchases.vendors.delete(id);
      setVendors(vendors.filter(v => v.id !== id));
    } catch (error) {
      alert('Failed to delete vendor');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <p className="text-[var(--text-secondary)]">Manage your vendors & suppliers</p>
        </div>
        <Link
          to="/purchases/vendors/new"
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Vendor
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-[var(--secondary)]">Loading...</div>
        ) : vendors.length === 0 ? (
          <div className="col-span-full text-center py-8 text-[var(--secondary)]">
            No vendors found. <Link to="/purchases/vendors/new" className="text-[var(--primary)] hover:underline">Add one</Link>
          </div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-lg border border-[var(--border)] p-4 hover:shadow-sm transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                    {vendor.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{vendor.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{vendor.code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${vendor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {vendor.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                {vendor.email && (
                  <div className="flex items-center gap-2"><Mail size={14} /><span>{vendor.email}</span></div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2"><Phone size={14} /><span>{vendor.phone}</span></div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-end gap-2">
                <Link to={`/purchases/vendors/${vendor.id}`} className="p-2 hover:bg-gray-100 rounded">
                  <Eye size={16} className="text-[var(--secondary)]" />
                </Link>
                <Link to={`/purchases/vendors/${vendor.id}/edit`} className="p-2 hover:bg-gray-100 rounded">
                  <Edit size={16} className="text-[var(--secondary)]" />
                </Link>
                <button onClick={() => handleDelete(vendor.id)} className="p-2 hover:bg-red-50 rounded">
                  <Trash2 size={16} className="text-[var(--danger)]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
