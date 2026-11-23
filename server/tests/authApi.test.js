import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createAuthController } from '../controllers/authController.js';
import { createAuthRouter } from '../routes/authRoutes.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { validateRegister } from '../validators/authValidator.js';

process.env.JWT_SECRET = 'test-secret';

// In-memory stand-in for the Mongoose User model.
function makeModel() {
  const users = [];
  const wrap = (u) => u && Object.assign(u, { comparePassword: (p) => bcrypt.compare(p, u.password) });
  return {
    users,
    findOne: (q) => {
      if (typeof q.email !== 'string') throw new Error('non-string email reached the database');
      const u = wrap(users.find((x) => x.email === q.email));
      return Object.assign(Promise.resolve(u), { select: async () => u });
    },
    create: async (v) => {
      const u = { _id: `u${users.length + 1}`, role: 'customer', status: 'Active', ...v, password: await bcrypt.hash(v.password, 4) };
      users.push(u); return wrap(u);
    },
  };
}
const sign = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

let server, base, model;
const call = (path, body, headers = {}) => fetch(`${base}/api/auth${path}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined });
const good = { name: 'Ananya Rao', email: 'Ananya@Example.com', phone: '9876543210', password: 'Greenleaf9' };

async function start(limiter) {
  model = makeModel();
  const app = express(); app.use(express.json({ limit: '10kb' }));
  const protect = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized, no token' });
    try { const d = jwt.verify(h.slice(7), process.env.JWT_SECRET); req.user = model.users.find((u) => u._id === d.id); next(); }
    catch { res.status(401).json({ message: 'Not authorized, invalid token' }); }
  };
  app.use('/api/auth', createAuthRouter({ controller: createAuthController(model, sign), auth: protect, limiter }));
  app.use((err, req, res, next) => res.status(500).json({ message: 'Server error' })); // eslint-disable-line no-unused-vars
  return new Promise((r) => { const s = app.listen(0, () => r(s)); });
}
before(async () => { server = await start(createRateLimiter({ max: 1000 })); base = `http://127.0.0.1:${server.address().port}`; });
after(() => server.close());

test('register creates a customer, normalises email, returns token and no password', async () => {
  const res = await call('/register', good);
  assert.equal(res.status, 201);
  const j = await res.json();
  assert.ok(j.token);
  assert.equal(j.user.email, 'ananya@example.com');
  assert.equal(j.user.role, 'customer');
  assert.ok(!JSON.stringify(j).includes('Greenleaf9'));
  assert.notEqual(model.users[0].password, 'Greenleaf9'); // stored hashed
});

test('register ignores attempts to set role or status', async () => {
  await call('/register', { ...good, email: 'evil@example.com', role: 'admin', status: 'Active' });
  assert.equal(model.users.find((u) => u.email === 'evil@example.com').role, 'customer');
});

test('duplicate email -> 409', async () => {
  assert.equal((await call('/register', { ...good, name: 'Someone Else' })).status, 409);
});

test('register validation: weak/short passwords, bad email, bad phone, short name', () => {
  for (const bad of [{ password: 'short1' }, { password: 'allletters' }, { password: '12345678' }, { email: 'nope' }, { phone: '12345' }, { name: 'A' }]) {
    assert.ok(validateRegister({ ...good, ...bad }).errors, JSON.stringify(bad));
  }
  assert.ok(validateRegister(good).value);
});

test('login succeeds with the right password (email case-insensitive) and /me works with the token', async () => {
  const res = await call('/login', { email: 'ANANYA@example.com', password: 'Greenleaf9' });
  assert.equal(res.status, 200);
  const { token } = await res.json();
  const me = await call('/me', null, { Authorization: `Bearer ${token}` });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).user.email, 'ananya@example.com');
});

test('wrong password and unknown email give the same 401 message', async () => {
  const a = await call('/login', { email: 'ananya@example.com', password: 'WrongPass1' });
  const b = await call('/login', { email: 'ghost@example.com', password: 'WrongPass1' });
  assert.equal(a.status, 401); assert.equal(b.status, 401);
  assert.equal((await a.json()).message, (await b.json()).message);
});

test('NoSQL-injection style payloads are rejected before reaching the database', async () => {
  const res = await call('/login', { email: { $gt: '' }, password: { $gt: '' } });
  assert.equal(res.status, 400);
});

test('blocked accounts cannot log in', async () => {
  model.users.find((u) => u.email === 'ananya@example.com').status = 'Blocked';
  assert.equal((await call('/login', { email: 'ananya@example.com', password: 'Greenleaf9' })).status, 403);
  model.users.find((u) => u.email === 'ananya@example.com').status = 'Active';
});

test('/me rejects missing or tampered tokens', async () => {
  assert.equal((await call('/me')).status, 401);
  assert.equal((await call('/me', null, { Authorization: 'Bearer abc.def.ghi' })).status, 401);
});

test('rate limiter blocks repeated attempts with 429 and Retry-After', async () => {
  const s = await start(createRateLimiter({ max: 3 }));
  const url = `http://127.0.0.1:${s.address().port}/api/auth/login`;
  const hit = () => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'a@b.co', password: 'x' }) });
  for (let i = 0; i < 3; i++) assert.equal((await hit()).status, 401);
  const blocked = await hit();
  s.close();
  assert.equal(blocked.status, 429);
  assert.ok(blocked.headers.get('retry-after'));
});

test('customer and admin sign-ins are separate doors', async () => {
  await model.create({ name: 'Store Admin', email: 'boss@example.com', phone: '', password: 'AdminPass9', role: 'admin' });

  // An admin account is refused on the customer endpoint, with a pointer to the admin page.
  const asCustomer = await call('/login', { email: 'boss@example.com', password: 'AdminPass9' });
  assert.equal(asCustomer.status, 403);

  // The admin endpoint accepts the admin and returns an admin user.
  const asAdmin = await call('/admin/login', { email: 'boss@example.com', password: 'AdminPass9' });
  assert.equal(asAdmin.status, 200);
  assert.equal((await asAdmin.json()).user.role, 'admin');

  // A customer is refused on the admin endpoint with the same message as a wrong password.
  const cust = await call('/admin/login', { email: 'ananya@example.com', password: 'Greenleaf9' });
  const wrong = await call('/admin/login', { email: 'ananya@example.com', password: 'WrongPass1' });
  assert.equal(cust.status, 401);
  assert.equal((await cust.json()).message, (await wrong.json()).message);
});
