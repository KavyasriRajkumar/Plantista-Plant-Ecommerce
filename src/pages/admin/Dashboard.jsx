import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDollarSign, FiShoppingBag, FiUsers, FiBox } from 'react-icons/fi';
import { getDashboardStats } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';

const STATUS_STYLES = {
  Processing: 'bg-sage/20 text-moss',
  Delivered: 'bg-fern/10 text-fern',
  Shipped: 'bg-gold/15 text-gold',
  Cancelled: 'bg-red-100 text-red-600',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => toast.error('Could not load dashboard stats'));
  }, []);

  if (!stats) return <Loader label="Loading dashboard…" />;

  const { weeklySales, recentOrders } = stats;
  const maxSale = Math.max(1, ...weeklySales.map((d) => d.value));
  const cards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: FiDollarSign },
    { label: 'Total Orders', value: stats.totalOrders, icon: FiShoppingBag },
    { label: 'Total Products', value: stats.totalProducts, icon: FiBox },
    { label: 'Total Users', value: stats.totalUsers, icon: FiUsers },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-medium">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/50">Overview of store performance.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-paper p-5 shadow-card">
            <card.icon className="text-fern" size={20} />
            <p className="mt-4 font-display text-2xl font-semibold text-ink">{card.value}</p>
            <p className="mt-1 text-xs text-ink/50">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Last 7 days of revenue (cancelled orders excluded) */}
        <div className="rounded-2xl bg-paper p-6 shadow-card lg:col-span-2">
          <h2 className="font-display text-lg font-medium">Sales this week</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {weeklySales.map((day) => (
              <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-fern/80"
                  style={{ height: `${Math.max(2, (day.value / maxSale) * 100)}%` }}
                  title={`₹${day.value.toLocaleString('en-IN')}`}
                />
                <span className="text-[11px] text-ink/40">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl bg-paper p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium">Recent orders</h2>
            <Link to="/admin/orders" className="text-xs font-medium text-fern hover:underline">View all</Link>
          </div>
          <ul className="mt-4 space-y-4">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-mono text-xs font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-ink/50">{order.user?.name || 'Deleted user'}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-semibold">₹{order.total}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
