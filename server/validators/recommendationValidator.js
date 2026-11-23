import { REC_ENUMS } from '../models/Product.js';

const REQUIRED = {
  sunlight: REC_ENUMS.sunlight,
  space: REC_ENUMS.space,
  environment: REC_ENUMS.environment,
  climate: REC_ENUMS.climate,
  watering: REC_ENUMS.watering,
  maintenance: REC_ENUMS.maintenance,
};
const BOOLEANS = ['petSafeOnly', 'floweringOnly', 'decorativeFoliageOnly', 'edibleOnly'];
const SIZES = ['small', 'medium', 'large'];
const KNOWN = new Set([...Object.keys(REQUIRED), ...BOOLEANS, 'maxBudget', 'plantSize', 'city', 'limit']);

/** Validates and normalises a request body. Returns { value } or { errors }. */
export function validatePreferences(body) {
  const errors = {};
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: { body: 'Request body must be a JSON object' } };
  }
  for (const key of Object.keys(body)) if (!KNOWN.has(key)) errors[key] = 'Unknown field';

  const value = {};
  for (const [key, allowed] of Object.entries(REQUIRED)) {
    if (body[key] === undefined || body[key] === '') errors[key] = 'This field is required';
    else if (typeof body[key] !== 'string' || !allowed.includes(body[key])) errors[key] = `Must be one of: ${allowed.join(', ')}`;
    else value[key] = body[key];
  }

  if (body.maxBudget !== undefined && body.maxBudget !== null && body.maxBudget !== '') {
    const n = Number(body.maxBudget);
    if (typeof body.maxBudget === 'boolean' || !Number.isFinite(n) || n <= 0 || n > 1_000_000) errors.maxBudget = 'Must be a positive number';
    else value.maxBudget = n;
  }
  for (const key of BOOLEANS) {
    if (body[key] === undefined) { value[key] = false; continue; }
    if (typeof body[key] !== 'boolean') errors[key] = 'Must be true or false';
    else value[key] = body[key];
  }
  if (body.plantSize !== undefined && body.plantSize !== null && body.plantSize !== '') {
    if (!SIZES.includes(body.plantSize)) errors.plantSize = `Must be one of: ${SIZES.join(', ')}`;
    else value.plantSize = body.plantSize;
  }
  // City is optional and informational only; never used to infer climate.
  if (body.city !== undefined && body.city !== null) {
    if (typeof body.city !== 'string' || body.city.length > 80) errors.city = 'Must be text up to 80 characters';
  }
  if (body.limit !== undefined) {
    const n = Number(body.limit);
    if (!Number.isInteger(n) || n < 1 || n > 24) errors.limit = 'Must be an integer from 1 to 24';
    else value.limit = n;
  }

  return Object.keys(errors).length ? { errors } : { value };
}

/** Validates admin edits to recommendation attributes (partial updates allowed). */
export function validateRecommendationUpdate(body) {
  const errors = {};
  if (body === null || typeof body !== 'object' || Array.isArray(body)) return { errors: { body: 'Must be an object' } };
  const value = {};
  const arrays = { sunlight: REC_ENUMS.sunlight, space: REC_ENUMS.space, climate: REC_ENUMS.climate };
  const singles = { environment: REC_ENUMS.environment, watering: REC_ENUMS.watering, maintenance: REC_ENUMS.maintenance };
  for (const [k, allowed] of Object.entries(arrays)) {
    if (body[k] === undefined) continue;
    if (!Array.isArray(body[k]) || body[k].some((v) => !allowed.includes(v))) errors[k] = `Must be an array of: ${allowed.join(', ')}`;
    else value[k] = [...new Set(body[k])];
  }
  for (const [k, allowed] of Object.entries(singles)) {
    if (body[k] === undefined) continue;
    if (body[k] !== null && !allowed.includes(body[k])) errors[k] = `Must be one of: ${allowed.join(', ')}`;
    else value[k] = body[k];
  }
  if (body.petSafety !== undefined) {
    const ps = body.petSafety;
    if (!ps || !REC_ENUMS.petSafety.includes(ps.status)) errors.petSafety = 'status must be safe, toxic or unknown';
    else if (ps.status !== 'unknown' && !(typeof ps.source === 'string' && ps.source.trim())) errors.petSafety = 'A source is required when status is safe or toxic';
    else value.petSafety = { status: ps.status, source: String(ps.source || '').slice(0, 300), notes: String(ps.notes || '').slice(0, 500) };
  }
  for (const k of ['flowering', 'decorativeFoliage', 'edible']) {
    if (body[k] === undefined) continue;
    if (!REC_ENUMS.triState.includes(body[k])) errors[k] = 'Must be yes, no or unknown';
    else value[k] = body[k];
  }
  if (body.sizeCm !== undefined) {
    const { min, max } = body.sizeCm || {};
    const ok = [min, max].every((n) => n === null || n === undefined || (Number.isFinite(n) && n >= 0));
    if (!ok || (min != null && max != null && min > max)) errors.sizeCm = 'min/max must be non-negative numbers with min <= max';
    else value.sizeCm = { min: min ?? null, max: max ?? null };
  }
  for (const k of ['soilNotes', 'dataSource']) {
    if (body[k] === undefined) continue;
    if (typeof body[k] !== 'string' || body[k].length > 500) errors[k] = 'Must be text up to 500 characters';
    else value[k] = body[k];
  }
  if (body.careTips !== undefined) {
    if (!Array.isArray(body.careTips) || body.careTips.length > 10 || body.careTips.some((t) => typeof t !== 'string' || t.length > 200)) errors.careTips = 'Up to 10 tips of 200 characters';
    else value.careTips = body.careTips;
  }
  if (body.reviewed !== undefined) {
    if (typeof body.reviewed !== 'boolean') errors.reviewed = 'Must be true or false';
    else value.reviewed = body.reviewed;
  }
  return Object.keys(errors).length ? { errors } : { value };
}
