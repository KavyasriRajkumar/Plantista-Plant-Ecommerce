import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// GET /api/stats — admin only. Numbers for the dashboard cards plus the
// last 7 days of sales (cancelled orders are not counted as revenue).
export async function getDashboardStats(req, res, next) {
  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - 6);

    const [revenueAgg, orderCount, productCount, userCount, salesAgg, recent] = await Promise.all([
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, value: { $sum: '$total' } } },
      ]),
      Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(4),
    ]);

    const byDay = Object.fromEntries(salesAgg.map((d) => [d._id, d.value]));
    const weeklySales = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      return { label: d.toLocaleDateString('en-US', { weekday: 'short' }), value: Math.round(byDay[key] || 0) };
    });

    res.json({
      totalRevenue: Math.round(revenueAgg[0]?.total || 0),
      totalOrders: orderCount,
      totalProducts: productCount,
      totalUsers: userCount,
      weeklySales,
      recentOrders: recent,
    });
  } catch (err) {
    next(err);
  }
}
