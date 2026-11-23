import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getMyOrders } from '../services/orderService';
import { Loader } from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { getButtonClasses } from '../components/common/Button';

const STATUS_STYLES = {
  Delivered: 'bg-fern/10 text-fern',
  Shipped: 'bg-gold/15 text-gold',
  Processing: 'bg-sage/20 text-moss',
  Cancelled: 'bg-red-100 text-red-600',
};

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * Orders — the signed-in user's order history from GET /api/orders/mine.
 * Clicking a row opens Modal with the
 * itemized breakdown rather than navigating away, since there isn't
 * enough content per order to justify a dedicated page.
 */
export default function Orders() {
  const [orders, setOrders] = useState(null); // null = still loading
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getMyOrders().then(setOrders).catch(() => { toast.error('Could not load your orders'); setOrders([]); });
  }, []);

  if (orders === null) return <Loader label="Loading your orders…" />;

  if (orders.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FiPackage size={40} className="text-ink/20" />
        <h1 className="mt-6 font-display text-2xl font-medium">No orders yet</h1>
        <Link to="/shop" className={getButtonClasses('primary', 'md', 'mt-6')}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-medium">My orders</h1>

      <div className="mt-8 overflow-hidden rounded-2xl bg-paper shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-5 py-4 font-medium">Order ID</th>
              <th className="px-5 py-4 font-medium">Date</th>
              <th className="hidden px-5 py-4 font-medium sm:table-cell">Status</th>
              <th className="px-5 py-4 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => setSelected(order)}
                className="cursor-pointer border-b border-ink/5 transition-colors last:border-0 hover:bg-mist/50"
              >
                <td className="px-5 py-4 font-mono text-xs font-medium">{order.orderNumber}</td>
                <td className="px-5 py-4 text-ink/60">{fmtDate(order.createdAt)}</td>
                <td className="hidden px-5 py-4 sm:table-cell">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-mono font-semibold">₹{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.orderNumber || ''}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Order date</span>
              <span>{fmtDate(selected.createdAt)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Status</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[selected.status]}`}>
                {selected.status}
              </span>
            </div>
            <div className="border-t border-ink/10 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/50">Items</p>
              <ul className="space-y-2">
                {selected.items.map((item) => (
                  <li key={item.product} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="text-ink/50">× {item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-4 font-semibold">
              <span>Total</span>
              <span className="font-mono">₹{selected.total}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
