import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommend, scorePlant, missingCritical, matchLabel } from '../services/recommendationService.js';
import { catalog, byName, prefs, noClimatePlant, mysteryFern } from './helpers.js';

const names = (r) => r.recommendations.map((x) => x.name);

test('1. low-light indoor user gets low-light-tolerant plants, not sun lovers', () => {
  const r = recommend(catalog, prefs());
  assert.ok(names(r).includes('Snake Plant'));
  assert.ok(names(r).includes('ZZ Plant'));
  assert.ok(!names(r).includes('Echeveria Succulent')); // needs bright/direct light
  assert.equal(r.recommendations[0].matchLabel, 'Excellent match');
});

test('2. direct-sunlight outdoor user gets sun-loving plants and no indoor-only plants', () => {
  const r = recommend(catalog, prefs({ sunlight: 'direct', space: 'garden', environment: 'outdoor', climate: 'mild', maintenance: 'low' }));
  assert.equal(r.recommendations[0].name, 'Echeveria Succulent');
  assert.equal(r.recommendations[0].suitabilityScore, 100);
  assert.ok(!names(r).includes('Peace Lily')); // indoor-only -> hard filtered
  assert.ok(r.stats.excluded.environment >= 1);
});

test('3. small-space user ranks small-space plants above room-sized ones', () => {
  const r = recommend(catalog, prefs({ sunlight: 'bright_indirect', space: 'small', maintenance: 'advanced', watering: 'moderate' }));
  const idx = (n) => names(r).indexOf(n);
  assert.ok(idx('Echeveria Succulent') !== -1);
  assert.ok(idx('Echeveria Succulent') < idx('Fiddle Leaf Fig') || idx('Fiddle Leaf Fig') === -1);
});

test('4. low-maintenance user: beginner plants outrank advanced plants', () => {
  const r = recommend(catalog, prefs({ sunlight: 'bright_indirect', space: 'room', maintenance: 'low', watering: 'moderate', climate: 'warm_humid' }));
  const score = (n) => r.recommendations.find((x) => x.name === n)?.suitabilityScore ?? 0;
  assert.ok(score('Snake Plant') > score('Fiddle Leaf Fig'));
  assert.ok(r.recommendations.find((x) => x.name === 'Fiddle Leaf Fig')?.warnings.some((w) => /more than you asked/.test(w)) ?? true);
});

test('5. budget filter uses the discounted price and excludes plants above it', () => {
  const r = recommend(catalog, prefs({ sunlight: 'bright_indirect', environment: 'both', maxBudget: 500 }));
  assert.ok(r.recommendations.every((x) => x.price * (1 - x.discount / 100) <= 500));
  assert.ok(r.stats.excluded.budget >= 1);
});

test('6. pet-safe filter excludes toxic AND unknown-status plants', () => {
  const r = recommend(catalog, prefs({ sunlight: 'bright_indirect', environment: 'both', space: 'balcony', climate: 'mild', maintenance: 'low', petSafeOnly: true }));
  assert.deepEqual(names(r), ['Echeveria Succulent']);
  assert.ok(!names(r).includes('Mystery Fern'));
  assert.ok(r.stats.excluded.pet_safety >= 2);
});

test('7. missing data never yields a misleading high score', () => {
  assert.deepEqual(missingCritical(byName('Incomplete Plant')), ['sunlight']);
  const r = recommend(catalog, prefs());
  assert.ok(!names(r).includes('Incomplete Plant'));
  assert.ok(r.stats.incomplete >= 2); // Incomplete Plant + planter
  assert.ok(!names(r).includes('Clay Pot'));
  const s = scorePlant(noClimatePlant, prefs());
  assert.ok(s.uncertain && s.score <= 84);
  const full = recommend([noClimatePlant], prefs()).recommendations[0];
  assert.notEqual(full.matchLabel, 'Excellent match');
  assert.ok(full.warnings.some((w) => /Climate/.test(w)));
  // unknown pet safety is surfaced, not assumed safe
  assert.ok(recommend([mysteryFern], prefs()).recommendations[0].warnings.includes('Safety information unavailable.'));
});

test('8. no suitable plants returns an empty list with explanatory stats', () => {
  const r = recommend(catalog, prefs({ sunlight: 'direct', space: 'garden', environment: 'outdoor', petSafeOnly: true, edibleOnly: true }));
  assert.equal(r.recommendations.length, 0);
  assert.ok(Object.keys(r.stats.excluded).length > 0);
});

test('manual score check A: Snake Plant for low/small/indoor/hot/rare/beginner = 100', () => {
  assert.equal(scorePlant(byName('Snake Plant'), prefs()).score, 100);
});

test('manual score check B: Peace Lily same prefs = 82 (.30+.20+.15+.15*.15+.10+.10*.5 = .8225)', () => {
  const s = scorePlant(byName('Peace Lily'), prefs());
  assert.deepEqual(s.parts, { sunlight: 1, environment: 1, space: 1, watering: 0.15, climate: 1, maintenance: 0.5 });
  assert.equal(s.score, 82);
  assert.equal(matchLabel(82), 'Good match');
});

test('manual score check C: Echeveria for direct/balcony/both/cool/rare/beginner = 90', () => {
  const s = scorePlant(byName('Echeveria Succulent'), prefs({ sunlight: 'direct', space: 'balcony', environment: 'both', climate: 'cool', watering: 'rare', maintenance: 'beginner' }));
  assert.deepEqual(s.parts, { sunlight: 1, environment: 1, space: 1, watering: 1, climate: 0.5, maintenance: 0.5 });
  assert.equal(s.score, 90);
});

test('manual score check D: Fiddle Leaf Fig in a low-light small room scores under the 50 threshold (~44.5)', () => {
  const s = scorePlant(byName('Fiddle Leaf Fig'), prefs());
  assert.ok(s.score < 50);
  assert.ok(!names(recommend(catalog, prefs())).includes('Fiddle Leaf Fig'));
});

test('labels and clamping', () => {
  assert.equal(matchLabel(85), 'Excellent match');
  assert.equal(matchLabel(70), 'Good match');
  assert.equal(matchLabel(50), 'Partial match');
  assert.equal(matchLabel(49), null);
  for (const p of catalog) { const s = scorePlant(p, prefs()); if (s) assert.ok(s.score >= 0 && s.score <= 100); }
});

test('results are sorted descending and deterministic, and respect the limit', () => {
  const a = recommend(catalog, prefs({ environment: 'both' }), { limit: 2 });
  const b = recommend(catalog, prefs({ environment: 'both' }), { limit: 2 });
  assert.deepEqual(a, b);
  assert.ok(a.recommendations.length <= 2);
  const scores = recommend(catalog, prefs({ environment: 'both' })).recommendations.map((x) => x.suitabilityScore);
  assert.deepEqual(scores, [...scores].sort((x, y) => y - x));
});

test('explanations come from real comparisons (warnings for mismatches)', () => {
  const r = recommend(catalog, prefs()).recommendations.find((x) => x.name === 'Peace Lily');
  assert.ok(r.warnings.includes('May need more frequent watering than you prefer.'));
  assert.ok(r.reasons.some((x) => /low light/.test(x)));
});
