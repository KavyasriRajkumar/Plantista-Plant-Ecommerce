import User from '../models/User.js';
import Order from '../models/Order.js';

// GET /api/users — admin only. Includes each customer's order count.
export async function getUsers(req, res, next) {
  try {
    const [users, counts] = await Promise.all([
      User.find({ role: 'customer' }).sort({ createdAt: -1 }),
      Order.aggregate([{ $group: { _id: '$user', n: { $sum: 1 } } }]),
    ]);
    const byUser = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
    res.json(users.map((u) => ({ ...u.toJSON(), orders: byUser[String(u._id)] || 0 })));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/:id/status — admin only (block/unblock)
export async function updateUserStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot change your own status' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/me — requires `protect`, lets a user edit their own profile/address
export async function updateMe(req, res, next) {
  try {
    const { name, phone, address } = req.body;
    const update = {};
    if (typeof name === 'string' && name.trim()) update.name = name.trim();
    if (typeof phone === 'string') update.phone = phone.trim();
    if (address && typeof address === 'object') {
      update.address = {
        street: String(address.street || '').trim(),
        city: String(address.city || '').trim(),
        pincode: String(address.pincode || '').trim(),
      };
    }
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, address: user.address || null } });
  } catch (err) {
    next(err);
  }
}
