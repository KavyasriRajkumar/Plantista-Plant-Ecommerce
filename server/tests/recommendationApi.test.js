import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createRecommendationController } from '../controllers/recommendationController.js';
import { createRecommendationRouter } from '../routes/recommendationRoutes.js';
import { adminOnly } from '../middleware/auth.js';
import { validatePreferences, validateRecommendationUpdate } from '../validators/recommendationValidator.js';
import { stubModel, prefs, catalog } from './helpers.js';

let server; let base;
const denyAuth = { protect: (req, res) => res.status(401).json({ message: 'Not authorized, no token' }), adminOnly };

function start(model, auth) {
  const app = express();
  app.use(express.json());
  app.use('/api/recommendations', createRecommendationRouter(createRecommendationController(model), auth));
  app.use((err, req, res, next) => res.status(500).json({ success: false, message: 'Server error' })); // eslint-disable-line no-unused-vars
  return new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
}
const post = (body) => fetch(`${base}/api/recommendations/plants`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

before(async () => { server = await start(stubModel(), denyAuth); base = `http://127.0.0.1:${server.address().port}`; });
after(() => server.close());

test('POST returns ranked recommendations with expected shape', async () => {
  const res = await post(prefs());
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.success, true);
  assert.equal(j.count, j.recommendations.length);
  assert.ok(j.count > 0);
  for (const k of ['plantId', 'name', 'price', 'image', 'suitabilityScore', 'matchLabel', 'reasons', 'careTips', 'warnings']) assert.ok(k in j.recommendations[0], k);
  assert.ok(!JSON.stringify(j).includes('MONGO'));
});

test('9. invalid enum values and malformed bodies are rejected with 400', async () => {
  for (const bad of [prefs({ sunlight: 'moonlight' }), prefs({ maxBudget: -5 }), prefs({ petSafeOnly: 'yes' }), prefs({ hack: 1 }), { sunlight: 'low' }]) {
    const res = await post(bad);
    assert.equal(res.status, 400);
    assert.equal((await res.json()).success, false);
  }
  const res = await fetch(`${base}/api/recommendations/plants`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad json' });
  assert.ok(res.status >= 400 && res.status < 600);
});

test('missing required fields are listed per field', () => {
  const { errors } = validatePreferences({});
  for (const k of ['sunlight', 'space', 'environment', 'climate', 'watering', 'maintenance']) assert.ok(errors[k]);
});

test('8b. no suitable plants -> 200 with empty list and explanatory meta', async () => {
  const j = await (await post(prefs({ sunlight: 'direct', space: 'garden', environment: 'outdoor', petSafeOnly: true, edibleOnly: true }))).json();
  assert.equal(j.success, true);
  assert.equal(j.count, 0);
  assert.ok(j.meta.excluded);
});

test('empty catalog is reported', async () => {
  const s = await start(stubModel([]), denyAuth);
  const j = await (await fetch(`http://127.0.0.1:${s.address().port}/api/recommendations/plants`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs()) })).json();
  s.close();
  assert.equal(j.meta.catalogEmpty, true);
  assert.equal(j.count, 0);
});

test('database failure gives a generic 500 without leaking internals', async () => {
  const broken = { ...stubModel(), find: () => { throw new Error('mongodb://user:pass@host failed'); } };
  const s = await start(broken, denyAuth);
  const res = await fetch(`http://127.0.0.1:${s.address().port}/api/recommendations/plants`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs()) });
  const text = await res.text();
  s.close();
  assert.equal(res.status, 500);
  assert.ok(!text.includes('mongodb://'));
});

test('limit is honoured and bounded', async () => {
  const j = await (await post(prefs({ environment: 'both', limit: 1 }))).json();
  assert.ok(j.count <= 1);
  assert.equal((await post(prefs({ limit: 999 }))).status, 400);
});

test('admin attribute route is protected on the backend', async () => {
  const res = await fetch(`${base}/api/recommendations/plants/abc/attributes`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ watering: 'rare' }) });
  assert.equal(res.status, 401);
  // adminOnly itself rejects non-admins
  let status; const r = { status(c) { status = c; return this; }, json() {} };
  adminOnly({ user: { role: 'user' } }, r, () => { status = 'next'; });
  assert.equal(status, 403);
});

test('admin attribute validation rejects bad values and requires a source for pet safety', () => {
  assert.ok(validateRecommendationUpdate({ watering: 'daily' }).errors.watering);
  assert.ok(validateRecommendationUpdate({ sunlight: ['nope'] }).errors.sunlight);
  assert.ok(validateRecommendationUpdate({ petSafety: { status: 'safe' } }).errors.petSafety);
  assert.ok(validateRecommendationUpdate({ sizeCm: { min: 50, max: 10 } }).errors.sizeCm);
  assert.ok(validateRecommendationUpdate({ petSafety: { status: 'safe', source: 'ASPCA' }, watering: 'rare' }).value);
});

test('catalog fixture sanity', () => assert.ok(catalog.length > 5));
