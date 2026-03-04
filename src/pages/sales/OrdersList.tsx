import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, MoreVertical, FileText, Truck, XCircle, ChevronDown } from 'lucide-react';
import { sales } from '../../lib/api';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  invoiced: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = statusFilter ? { status: statusFilter } : {};
        const response = await sales.orders.list(params);
        setOrders(response.data.data?.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount / 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sales Orders</h1>
          <p className="text-[var(--text-secondary)]">Manage your sales orders</p>
        </div>
        <Link
          to="/sales/orders/new"
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white pl-4 pr-10 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:border-slate-300 transition"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[var(--border-strong)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--border-strong)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Order #</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Customer</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Date</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Amount</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-strong)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--secondary)]">Loading...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--secondary)]">
                  No orders found. <Link to="/sales/orders/new" className="text-[var(--primary)] hover:underline">Create one</Link>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{order.order_no}</td>
                  <td className="px-4 py-3">{order.customer?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(order.order_date)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(order.total_minor)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/sales/orders/${order.id}`} className="p-2 hover:bg-gray-100 rounded" title="View">
                        <Eye size={16} className="text-[var(--secondary)]" />
                      </Link>
                      {order.status === 'draft' && (
                        <Link to={`/sales/orders/${order.id}/edit`} className="p-2 hover:bg-gray-100 rounded" title="Edit">
                          <Edit size={16} className="text-[var(--secondary)]" />
                        </Link>
                      )}
                      {order.status === 'confirmed' && (
                        <button className="p-2 hover:bg-green-50 rounded" title="Mark Shipped">
                          <Truck size={16} className="text-green-600" />
                        </button>
                      )}
                      {order.status === 'draft' && (
                        <button className="p-2 hover:bg-red-50 rounded" title="Cancel">
                          <XCircle size={16} className="text-red-600" />
                        </button>
                      )}
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
