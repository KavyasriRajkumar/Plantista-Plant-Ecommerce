import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { couponDiscount, normalizeCoupon, COUPONS } from '../utils/coupons.js';

const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_FEE = 99;

// POST /api/orders — requires `protect`
export async function createOrder(req, res, next) {
  try {
    const { items, shippingAddress, couponCode } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Order must include at least one item' });

    // Re-price server-side from the DB rather than trusting client-sent
    // prices, so a tampered request can't check out at a fake price.
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `${product.name} has insufficient stock` });
      }
      const price = product.price * (1 - (product.discount || 0) / 100);
      subtotal += price * item.quantity;
      orderItems.push({ product: product._id, name: product.name, price, quantity: item.quantity });

      product.stock -= item.quantity;
      await product.save();
    }

    const appliedCode = COUPONS[normalizeCoupon(couponCode)] ? normalizeCoupon(couponCode) : null;
    const discountAmount = couponDiscount(appliedCode, subtotal);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = Math.max(0, Math.round(subtotal) - discountAmount + shippingFee);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      couponCode: appliedCode,
      subtotal,
      discountAmount,
      shippingFee,
      total,
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/mine — requires `protect`
export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// GET /api/orders — admin only
export async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/orders/:id/status — admin only
export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
}
