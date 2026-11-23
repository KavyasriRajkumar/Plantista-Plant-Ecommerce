// Small in-memory limiter (per IP) for login/register, to slow down password
// guessing and sign-up spam. For multiple server instances, swap for a shared
// store such as Redis. No extra dependency needed.
export function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 10, message = 'Too many attempts. Please try again later.' } = {}) {
  const hits = new Map();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
  }, windowMs);
  timer.unref?.();

  return function rateLimit(req, res, next) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.reset <= now) entry = { count: 0, reset: now + windowMs };
    entry.count += 1;
    hits.set(key, entry);
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.reset - now) / 1000)));
      return res.status(429).json({ message });
    }
    next();
  };
}
