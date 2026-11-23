import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllOrders, setOrderStatus } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';

const STATUS_STYLES = {
  Delivered: 'bg-fern/10 text-fern',
  Shipped: 'bg-gold/15 text-gold',
  Processing: 'bg-sage/20 text-moss',
  Cancelled: 'bg-red-100 text-red-600',
};

const STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * Admin Orders: every customer's orders from GET /api/orders. Changing the
 * status select saves immediately via PATCH /api/orders/:id/status.
 */
export default function AdminOrders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    getAllOrders().then(setOrders).catch(() => { toast.error('Could not load orders'); setOrders([]); });
  }, []);

  const updateStatus = async (id, status) => {
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o))); // optimistic
    try {
      await setOrderStatus(id, status);
      toast.success('Order status updated');
    } catch {
      setOrders(previous);
      toast.error('Could not update the order');
    }
  };

  if (orders === null) return <Loader label="Loading orders…" />;

  return (
    <div>
      <h1 className="font-display text-3xl font-medium">Orders</h1>
      <p className="mt-1 text-sm text-ink/50">{orders.length} total orders</p>

      <div className="mt-8 overflow-x-auto rounded-2xl bg-paper shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-5 py-4 font-medium">Order ID</th>
              <th className="px-5 py-4 font-medium">Customer</th>
              <th className="hidden px-5 py-4 font-medium sm:table-cell">Date</th>
              <th className="px-5 py-4 font-medium">Amount</th>
              <th className="px-5 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-ink/5 last:border-0 hover:bg-mist/40">
                <td className="px-5 py-3 font-mono text-xs font-medium">{order.orderNumber}</td>
                <td className="px-5 py-3">{order.user?.name || 'Deleted user'}</td>
                <td className="hidden px-5 py-3 text-ink/60 sm:table-cell">{fmtDate(order.createdAt)}</td>
                <td className="px-5 py-3 font-mono">₹{order.total}</td>
                <td className="px-5 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    aria-label={`Update status for ${order.orderNumber}`}
                    className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-fern ${STATUS_STYLES[order.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-ink/50">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
