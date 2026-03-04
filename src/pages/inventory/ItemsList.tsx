import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { inventory } from '../../lib/api';

export default function ItemsList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await inventory.items.list({ search });
        setItems(response.data.data?.items || []);
      } catch (error) {
        console.error('Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [search]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount / 100);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await inventory.items.delete(id);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Items</h1>
          <p className="text-[var(--text-secondary)]">Manage your inventory items</p>
        </div>
        <Link
          to="/inventory/items/new"
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Item
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-gray-50">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">SKU</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Category</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Cost</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Price</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Stock</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-strong)]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--secondary)]">Loading...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--secondary)]">
                  No items found. <Link to="/inventory/items/new" className="text-[var(--primary)] hover:underline">Add one</Link>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{item.sku}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{item.category?.name || '-'}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.standard_cost_minor || 0)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.sale_price_minor || 0)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.reorder_level ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.track_inventory ? (item.reorder_level || 0) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/inventory/items/${item.id}`} className="p-1 hover:bg-gray-100 rounded">
                        <Eye size={16} className="text-[var(--secondary)]" />
                      </Link>
                      <Link to={`/inventory/items/${item.id}/edit`} className="p-1 hover:bg-gray-100 rounded">
                        <Edit size={16} className="text-[var(--secondary)]" />
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded">
                        <Trash2 size={16} className="text-[var(--danger)]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
