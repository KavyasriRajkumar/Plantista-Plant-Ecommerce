// Strict, type-checked validation for auth requests. Checking `typeof` is
// what stops NoSQL-injection payloads like { "email": { "$gt": "" } }.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\d{10}$/;
const isStr = (v) => typeof v === 'string';

export function validateRegister(body) {
  const errors = {};
  const b = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const name = isStr(b.name) ? b.name.trim().replace(/\s+/g, ' ') : '';
  const email = isStr(b.email) ? b.email.trim().toLowerCase() : '';
  const phone = isStr(b.phone) ? b.phone.trim() : '';
  const password = b.password;

  if (name.length < 2 || name.length > 60) errors.name = 'Enter your full name (2-60 characters)';
  if (!EMAIL.test(email) || email.length > 254) errors.email = 'Enter a valid email address';
  if (b.phone !== undefined && b.phone !== '' && !PHONE.test(phone)) errors.phone = 'Enter a valid 10-digit mobile number';
  if (!isStr(password) || password.length < 8 || password.length > 72) errors.password = 'Password must be 8-72 characters';
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = 'Password must include a letter and a number';

  if (Object.keys(errors).length) return { errors };
  const value = { name, email, password };
  if (phone) value.phone = phone;
  return { value }; // role/status can never come from the request
}

export function validateLogin(body) {
  const b = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const errors = {};
  const email = isStr(b.email) ? b.email.trim().toLowerCase() : '';
  if (!EMAIL.test(email)) errors.email = 'Enter a valid email address';
  if (!isStr(b.password) || b.password.length === 0 || b.password.length > 72) errors.password = 'Enter your password';
  return Object.keys(errors).length ? { errors } : { value: { email, password: b.password } };
}
