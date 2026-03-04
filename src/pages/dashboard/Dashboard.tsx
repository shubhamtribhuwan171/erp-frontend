import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, ArrowRight, AlertTriangle } from 'lucide-react';
import { sales, inventory, purchases } from '../../lib/api';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  color: string;
}

function KPICard({ title, value, change, icon: Icon, color }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}%</span>
              <span className="text-[var(--text-secondary)]">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, itemsRes] = await Promise.all([
          sales.orders.list({ limit: 5 }),
          inventory.items.list({ limit: 5 }),
        ]);
        setOrders(ordersRes.data.data?.orders || []);
        setItems(itemsRes.data.data?.items || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-[var(--text-secondary)]">Welcome back! Here's what's happening.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Sales"
          value="₹4,52,300"
          change={12}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <KPICard
          title="Pending Orders"
          value="12"
          icon={ShoppingCart}
          color="bg-orange-500"
        />
        <KPICard
          title="Total Customers"
          value="156"
          change={8}
          icon={Users}
          color="bg-green-500"
        />
        <KPICard
          title="Low Stock Items"
          value="5"
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-[var(--border)]">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/sales/orders" className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {loading ? (
              <div className="p-4 text-center text-[var(--text-secondary)]">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="p-4 text-center text-[var(--text-secondary)]">No orders yet</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{order.order_no}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{order.customer?.name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total_minor)}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      order.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg border border-[var(--border)]">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold">Low Stock Items</h2>
            <Link to="/inventory/items" className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {loading ? (
              <div className="p-4 text-center text-[var(--text-secondary)]">Loading...</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-center text-[var(--text-secondary)]">No items yet</div>
            ) : (
              items.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <Package size={20} className="text-[var(--secondary)]" />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.reorder_level || 0} units</p>
                    <p className="text-sm text-[var(--danger)]">Low stock</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/sales/orders/new"
          className="bg-white border border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary)] hover:shadow-sm transition text-center"
        >
          <ShoppingCart className="mx-auto mb-2 text-[var(--primary)]" size={24} />
          <p className="font-medium">New Sales Order</p>
        </Link>
        <Link
          to="/inventory/items/new"
          className="bg-white border border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary)] hover:shadow-sm transition text-center"
        >
          <Package className="mx-auto mb-2 text-[var(--primary)]" size={24} />
          <p className="font-medium">Add Item</p>
        </Link>
        <Link
          to="/sales/customers/new"
          className="bg-white border border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary)] hover:shadow-sm transition text-center"
        >
          <Users className="mx-auto mb-2 text-[var(--primary)]" size={24} />
          <p className="font-medium">Add Customer</p>
        </Link>
        <Link
          to="/purchases/orders/new"
          className="bg-white border border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary)] hover:shadow-sm transition text-center"
        >
          <ShoppingCart className="mx-auto mb-2 text-[var(--primary)]" size={24} />
          <p className="font-medium">Purchase Order</p>
        </Link>
      </div>
    </div>
  );
}
