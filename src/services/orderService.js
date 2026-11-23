import api from './api';

// Customer-side checkout and order history.

export const validateCoupon = async (code) => (await api.post('/coupons/validate', { code })).data;

// items: cart items ({ plant, quantity }). The server re-prices everything.
export const placeOrder = async ({ items, shippingAddress, couponCode }) => {
  const { data } = await api.post('/orders', {
    items: items.map((i) => ({ productId: i.plant.id, quantity: i.quantity })),
    shippingAddress,
    couponCode: couponCode || undefined,
  });
  return data;
};

export const getMyOrders = async () => (await api.get('/orders/mine')).data;
