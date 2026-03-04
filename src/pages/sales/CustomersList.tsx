import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Phone, Mail, MapPin } from 'lucide-react';
import { sales } from '../../lib/api';

export default function CustomersList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await sales.customers.list({ search });
        setCustomers(response.data.data?.customers || []);
      } catch (error) {
        console.error('Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await sales.customers.delete(id);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (error) {
      alert('Failed to delete customer');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-[var(--text-secondary)]">Manage your customers</p>
        </div>
        <Link
          to="/sales/customers/new"
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Customer
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-[var(--secondary)]">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-[var(--secondary)]">
            No customers found. <Link to="/sales/customers/new" className="text-[var(--primary)] hover:underline">Add one</Link>
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg border border-[var(--border)] p-4 hover:shadow-sm transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[var(--primary)] font-semibold">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{customer.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{customer.code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {customer.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-end gap-2">
                <Link to={`/sales/customers/${customer.id}`} className="p-2 hover:bg-gray-100 rounded">
                  <Eye size={16} className="text-[var(--secondary)]" />
                </Link>
                <Link to={`/sales/customers/${customer.id}/edit`} className="p-2 hover:bg-gray-100 rounded">
                  <Edit size={16} className="text-[var(--secondary)]" />
                </Link>
                <button onClick={() => handleDelete(customer.id)} className="p-2 hover:bg-red-50 rounded">
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
