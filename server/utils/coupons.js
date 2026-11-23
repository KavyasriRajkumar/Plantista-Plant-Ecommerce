// Single source of truth for coupon rules, used by checkout (orders) and by
// the Cart page's "Apply" button via POST /api/coupons/validate.
export const COUPONS = {
  PLANT10: { type: 'percent', value: 10, label: '10% off' },
  GREEN50: { type: 'flat', value: 50, label: '₹50 off' },
};

export const normalizeCoupon = (code) => String(code || '').trim().toUpperCase();

export function couponDiscount(code, subtotal) {
  const coupon = COUPONS[normalizeCoupon(code)];
  if (!coupon) return 0;
  const raw = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  return Math.min(Math.round(raw), Math.round(subtotal));
}
