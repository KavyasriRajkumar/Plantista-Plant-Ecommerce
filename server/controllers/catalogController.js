import Category from '../models/Category.js';
import Testimonial from '../models/Testimonial.js';
import { COUPONS, normalizeCoupon } from '../utils/coupons.js';

// GET /api/categories
export async function getCategories(req, res, next) {
  try {
    res.json(await Category.find().sort({ order: 1 }));
  } catch (err) {
    next(err);
  }
}

// GET /api/testimonials
export async function getTestimonials(req, res, next) {
  try {
    res.json(await Testimonial.find().sort({ createdAt: 1 }));
  } catch (err) {
    next(err);
  }
}

// POST /api/coupons/validate  { code }
export function validateCoupon(req, res) {
  const code = normalizeCoupon(req.body?.code);
  const coupon = COUPONS[code];
  if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
  res.json({ code, type: coupon.type, value: coupon.value, label: coupon.label });
}
