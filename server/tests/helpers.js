import { readFileSync } from 'node:fs';

// Self-contained fixtures (independent of the real catalogue, which changes).
const recommendationData = JSON.parse(readFileSync(new URL('./fixtures.json', import.meta.url), 'utf8'));

const base = { discount: 0, rating: 4.5, reviewCount: 10, stock: 10, images: ['img.jpg'], care: {} };
const seeded = [
  ['Fiddle Leaf Fig', 'indoor', 1899, 10],
  ['Snake Plant', 'indoor', 799, 0],
  ['Monstera Deliciosa', 'indoor', 2199, 15],
  ['Echeveria Succulent', 'succulents', 349, 0],
  ['Peace Lily', 'flowering', 1099, 5],
  ['ZZ Plant', 'office', 999, 0],
].map(([name, category, price, discount], i) => ({
  ...base, _id: `id${i}`, name, category, price, discount, recommendation: recommendationData[name],
}));

export const mysteryFern = { ...base, _id: 'fern', name: 'Mystery Fern', category: 'indoor', price: 500,
  recommendation: { ...recommendationData['Snake Plant'], petSafety: { status: 'unknown' } } };
export const incompletePlant = { ...base, _id: 'inc', name: 'Incomplete Plant', category: 'indoor', price: 300,
  recommendation: { ...recommendationData['Snake Plant'], sunlight: [] } };
export const noClimatePlant = { ...base, _id: 'nc', name: 'No Climate Plant', category: 'indoor', price: 400,
  recommendation: { ...recommendationData['Snake Plant'], climate: [] } };
export const planter = { ...base, _id: 'pot', name: 'Clay Pot', category: 'planters', price: 200, recommendation: {} };

export const catalog = [...seeded, mysteryFern, incompletePlant, noClimatePlant, planter];
export const byName = (n) => catalog.find((p) => p.name === n);

export const prefs = (over = {}) => ({
  sunlight: 'low', space: 'small', environment: 'indoor', climate: 'hot_tropical',
  watering: 'rare', maintenance: 'beginner', petSafeOnly: false, floweringOnly: false,
  decorativeFoliageOnly: false, edibleOnly: false, ...over,
});

// Minimal stand-in for the Mongoose model (no database needed).
export const stubModel = (docs = catalog) => ({
  find: () => ({ lean: async () => docs.map((d) => structuredClone(d)) }),
  countDocuments: async () => docs.filter((d) => d.category !== 'planters').length,
  findByIdAndUpdate: async () => null,
});
