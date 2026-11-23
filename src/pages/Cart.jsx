import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import Button, { getButtonClasses } from '../components/common/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { validateCoupon, placeOrder } from '../services/orderService';

const SHIPPING = 99;
const FREE_SHIPPING_THRESHOLD = 1500;

/**
 * Cart: reads cart state from CartContext. Coupons are checked against the
 * API and checkout creates a real order (POST /api/orders). The server
 * re-prices the order and decrements stock, so the totals shown here are an
 * estimate that the server confirms.
 */
export default function Cart() {
  const { items, subtotal, itemCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, type, value }
  const [placing, setPlacing] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    try {
      setAppliedCoupon(await validateCoupon(coupon));
      toast.success('Coupon applied');
    } catch {
      setAppliedCoupon(null);
      toast.error('Invalid coupon code');
    }
  };

  const discount = appliedCoupon
    ? Math.min(
        Math.round(appliedCoupon.type === 'percent' ? (subtotal * appliedCoupon.value) / 100 : appliedCoupon.value),
        Math.round(subtotal)
      )
    : 0;

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING;
  const total = Math.max(0, Math.round(subtotal) - discount) + shipping;

  const handleCheckout = async () => {
    if (!user) {
      toast('Sign in to place your order. Your cart will be waiting.');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (!user.address?.street) {
      toast.error('Add your delivery address in your profile first');
      navigate('/profile');
      return;
    }
    setPlacing(true);
    try {
      await placeOrder({ items, shippingAddress: user.address, couponCode: appliedCoupon?.code });
      toast.success('Order placed! Track it from My Orders.');
      clearCart();
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FiShoppingBag size={40} className="text-ink/20" />
        <h1 className="mt-6 font-display text-2xl font-medium">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink/60">Add a few plants and they'll show up here.</p>
        <Link to="/shop" className={getButtonClasses('primary', 'md', 'mt-6')}>
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-medium">Your cart</h1>
      <p className="mt-1 text-sm text-ink/50">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.plant.id} item={item} />
          ))}
        </div>

        <div className="h-fit rounded-2xl bg-paper p-6 shadow-card">
          <h2 className="font-display text-lg font-medium">Order summary</h2>

          <form onSubmit={handleApplyCoupon} className="mt-4 flex gap-2">
            <label htmlFor="coupon" className="sr-only">Coupon code</label>
            <input
              id="coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="w-full rounded-full border border-ink/15 bg-cream px-4 py-2.5 text-sm focus:border-fern focus:outline-none"
            />
            <button type="submit" className="shrink-0 rounded-full border border-ink/15 px-4 text-sm font-medium hover:bg-mist">
              Apply
            </button>
          </form>
          {appliedCoupon && (
            <p className="mt-2 text-xs text-fern">“{appliedCoupon.code}” applied</p>
          )}
          <p className="mt-2 text-xs text-ink/40">Try PLANT10 or GREEN50</p>

          <div className="mt-6 space-y-3 border-t border-ink/10 pt-5 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span className="font-mono">₹{subtotal.toFixed(0)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-fern">
                <span>Discount</span>
                <span className="font-mono">−₹{discount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              <span className="font-mono">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-3 font-semibold text-ink">
              <span>Total</span>
              <span className="font-mono">₹{total.toFixed(0)}</span>
            </div>
          </div>

          <Button onClick={handleCheckout} disabled={placing} className="mt-6 w-full" size="lg">
            {placing ? 'Placing order…' : 'Checkout'}
          </Button>
        </div>
      </div>
    </div>
  );
}
