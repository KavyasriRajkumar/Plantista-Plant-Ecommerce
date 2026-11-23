import jwt from 'jsonwebtoken';

// Centralizes token creation so the payload shape (and secret/expiry
// source) only needs to change in one place.
export default function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}
