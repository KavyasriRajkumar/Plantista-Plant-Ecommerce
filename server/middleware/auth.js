import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verifies the Bearer token, loads the user (without password), and
// attaches it to req.user. Every protected route depends on this
// running first, so a missing/invalid token fails fast with 401.
export async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Not authorized, user not found' });
    if (user.status === 'Blocked') return res.status(403).json({ message: 'Account is blocked' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
}

// Must run after protect() — relies on req.user already being set.
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}
