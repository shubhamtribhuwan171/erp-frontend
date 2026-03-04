import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Truck } from 'lucide-react';
import { purchases } from '../../lib/api';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  approved: 'bg-blue-100 text-blue-700',
  sent: 'bg-yellow-100 text-yellow-700',
  partial: 'bg-purple-100 text-purple-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function PurchaseOrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await purchases.orders.list();
        setOrders(response.data.data?.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount / 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Purchase Orders</h1>
          <p className="text-[--text-secondary]">Manage your purchase orders</p>
        </div>
        <Link
          to="/purchases/orders/new"
          className="bg-[--primary] hover:bg-[--primary-hover] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          New Order
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-[--border] overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[--border]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[--text-secondary]">PO #</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[--text-secondary]">Vendor</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[--text-secondary]">Date</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[--text-secondary]">Amount</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-[--text-secondary]">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[--text-secondary]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[--secondary]">Loading...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[--secondary]">
                  No purchase orders yet. <Link to="/purchases/orders/new" className="text-[--primary] hover:underline">Create one</Link>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{order.po_no}</td>
                  <td className="px-4 py-3">{order.vendor?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-[--text-secondary]">{formatDate(order.order_date)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(order.total_minor)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/purchases/orders/${order.id}`} className="p-2 hover:bg-gray-100 rounded">
                        <Eye size={16} className="text-[--secondary]" />
                      </Link>
                      {order.status === 'draft' && (
                        <Link to={`/purchases/orders/${order.id}/edit`} className="p-2 hover:bg-gray-100 rounded">
                          <Edit size={16} className="text-[--secondary]" />
                        </Link>
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
