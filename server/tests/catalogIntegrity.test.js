import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recommendationData } from '../seed/recommendationData.js';
import { recommend, missingCritical } from '../services/recommendationService.js';
import { REC_ENUMS } from '../models/Product.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
// seed.js runs a DB job on import, so read the product list from its source text.
const seedSrc = fs.readFileSync(path.join(root, 'server/seed/seed.js'), 'utf8');
const grab = (src, re) => [...src.matchAll(re)].map((m) => m[1]);
const names = grab(seedSrc, /name: '((?:[^'\\]|\\.)*)', category:/g).map((n) => n.replace(/\\'/g, "'"));
const images = grab(seedSrc, /images: \['([^']+)'\]/g);

const TARGET = 50;
const products = names.map((name, i) => ({
  _id: `id${i}`, name, category: 'x', price: 100, discount: 0, stock: 5, images: [images[i]], recommendation: recommendationData[name],
}));

test(`catalog has exactly ${TARGET} plants and seed and recommendation data agree`, () => {
  assert.equal(names.length, TARGET);
  assert.deepEqual(Object.keys(recommendationData).sort(), [...names].sort());
});

test('no plant is repeated (name, scientific name, image)', () => {
  const dup = (arr) => arr.filter((v, i) => arr.indexOf(v) !== i);
  assert.deepEqual(dup(names.map((n) => n.toLowerCase())), []);
  assert.deepEqual(dup(images), []);
  const sci = names.map((n) => recommendationData[n].scientificName.toLowerCase());
  assert.ok(sci.every(Boolean));
  assert.deepEqual(dup(sci), []);
});

test('every image is a local file that exists in public/', () => {
  for (const img of images) {
    assert.ok(img.startsWith('/plants/'), img);
    assert.ok(fs.existsSync(path.join(root, 'public', img)), `${img} missing`);
  }
});

test('every plant has complete, valid recommendation data', () => {
  for (const p of products) {
    assert.deepEqual(missingCritical(p), [], p.name);
    const r = p.recommendation;
    assert.ok(r.sunlight.every((v) => REC_ENUMS.sunlight.includes(v)), p.name);
    assert.ok(r.space.every((v) => REC_ENUMS.space.includes(v)), p.name);
    assert.ok(r.climate.length > 0 && r.climate.every((v) => REC_ENUMS.climate.includes(v)), p.name);
    assert.ok(REC_ENUMS.environment.includes(r.environment) && REC_ENUMS.watering.includes(r.watering) && REC_ENUMS.maintenance.includes(r.maintenance), p.name);
    assert.ok(REC_ENUMS.petSafety.includes(r.petSafety.status), p.name);
    assert.ok(r.petSafety.status === 'unknown' || r.petSafety.source, `${p.name} needs a pet-safety source`);
    assert.ok(r.sizeCm.min <= r.sizeCm.max, p.name);
    assert.ok(r.careTips.length >= 1, p.name);
  }
});

test('every answer option in the form is covered by at least 3 plants', () => {
  const count = (key, val) => products.filter((p) => [].concat(p.recommendation[key]).includes(val)).length;
  for (const [key, values] of Object.entries({ sunlight: REC_ENUMS.sunlight, space: REC_ENUMS.space, climate: REC_ENUMS.climate, environment: REC_ENUMS.environment, watering: REC_ENUMS.watering, maintenance: REC_ENUMS.maintenance })) {
    for (const v of values) assert.ok(count(key, v) >= 3, `${key}=${v} has only ${count(key, v)} plants`);
  }
  const status = (s) => products.filter((p) => p.recommendation.petSafety.status === s).length;
  assert.ok(status('safe') >= 5 && status('toxic') >= 10 && status('unknown') >= 3);
  assert.ok(products.filter((p) => p.recommendation.edible === 'yes').length >= 4);
  assert.ok(products.filter((p) => p.recommendation.flowering === 'yes').length >= 6);
});

test('each single-criterion choice returns at least one suitable recommendation', () => {
  const base = { sunlight: 'indirect', space: 'room', environment: 'indoor', climate: 'warm_humid', watering: 'moderate', maintenance: 'moderate' };
  for (const [key, values] of Object.entries({ sunlight: REC_ENUMS.sunlight, space: REC_ENUMS.space, climate: REC_ENUMS.climate, watering: REC_ENUMS.watering, maintenance: REC_ENUMS.maintenance })) {
    for (const v of values) {
      const prefs = { ...base, [key]: v, petSafeOnly: false, floweringOnly: false, decorativeFoliageOnly: false, edibleOnly: false };
      if (key === 'space' && (v === 'balcony' || v === 'garden')) prefs.environment = v === 'garden' ? 'outdoor' : 'both';
      assert.ok(recommend(products, prefs).recommendations.length > 0, `${key}=${v}`);
    }
  }
});

test('every realistic scenario has results (sunlight x space x environment, all other answers neutral)', () => {
  const miss = [];
  for (const sunlight of REC_ENUMS.sunlight) for (const space of REC_ENUMS.space) for (const environment of REC_ENUMS.environment) {
    // a garden indoors (or a small desk outdoors) is not a realistic request
    if ((space === 'garden' && environment === 'indoor') || (space === 'small' && environment === 'outdoor')) continue;
    const prefs = { sunlight, space, environment, climate: 'warm_humid', watering: 'moderate', maintenance: 'moderate', petSafeOnly: false, floweringOnly: false, decorativeFoliageOnly: false, edibleOnly: false };
    if (recommend(products, prefs).recommendations.length === 0) miss.push(`${sunlight}/${space}/${environment}`);
  }
  assert.deepEqual(miss, []);
});
