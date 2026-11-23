import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';

// Compared against when the email is unknown, so "no such user" and "wrong
// password" take about the same time and can't be told apart.
const DUMMY_HASH = bcrypt.hashSync('plantista-dummy-password', 10);

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, address: u.address || null });

export function createAuthController(UserModel = User, signToken = generateToken) {
  // POST /api/auth/register
  async function register(req, res, next) {
    try {
      const { errors, value } = validateRegister(req.body);
      if (errors) return res.status(400).json({ message: 'Please correct the highlighted fields', errors });

      if (await UserModel.findOne({ email: value.email })) {
        return res.status(409).json({ message: 'An account with that email already exists', errors: { email: 'Email already registered' } });
      }
      const user = await UserModel.create(value); // role defaults to "customer"
      res.status(201).json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ message: 'An account with that email already exists', errors: { email: 'Email already registered' } });
      }
      next(err);
    }
  }

  // Customers and admins sign in through separate endpoints so the two
  // portals can never be mixed up: POST /api/auth/login is customers only,
  // POST /api/auth/admin/login is admins only.
  const makeLogin = (portal) => async function login(req, res, next) {
    try {
      const { errors, value } = validateLogin(req.body);
      if (errors) return res.status(400).json({ message: 'Please correct the highlighted fields', errors });

      const user = await UserModel.findOne({ email: value.email }).select('+password');
      const ok = user ? await user.comparePassword(value.password) : (await bcrypt.compare(value.password, DUMMY_HASH), false);
      if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
      if (user.status === 'Blocked') return res.status(403).json({ message: 'This account has been blocked' });

      const isAdmin = user.role === 'admin';
      if (portal === 'admin' && !isAdmin) {
        // Same message as a wrong password: don't reveal which emails are customers.
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      if (portal === 'customer' && isAdmin) {
        return res.status(403).json({ message: 'This is the customer sign-in. Admins sign in on the admin page.' });
      }

      res.json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  };
  const login = makeLogin('customer');
  const adminLogin = makeLogin('admin');

  // GET /api/auth/me — requires `protect`
  async function getMe(req, res) {
    res.json({ user: publicUser(req.user) });
  }

  return { register, login, adminLogin, getMe };
}

export const { register, login, adminLogin, getMe } = createAuthController();
