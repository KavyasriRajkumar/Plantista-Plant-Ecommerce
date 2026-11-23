// Deterministic, rule-based plant recommendation engine. Pure functions
// only (no DB access) so scoring is easy to test and reason about.

export const DEFAULT_WEIGHTS = {
  sunlight: 0.3,
  environment: 0.2,
  space: 0.15,
  watering: 0.15,
  climate: 0.1,
  maintenance: 0.1,
};

// Initial values, not scientifically validated — tune as needed.
export const MATCH_LABELS = [
  { min: 85, label: 'Excellent match' },
  { min: 70, label: 'Good match' },
  { min: 50, label: 'Partial match' },
];
export const MIN_SUITABLE_SCORE = 50;
// Sunlight is the factor most likely to kill a plant, so a plant two or more
// light levels away from the user's light can never reach the suitable range,
// however well the other criteria match (e.g. a sun-lover in a dark room).
export const SUNLIGHT_MISMATCH_CAP = MIN_SUITABLE_SCORE - 1;
export const UNCERTAIN_SCORE_CAP = 84; // plants with unverified data can never be "Excellent"
export const CRITICAL_ATTRIBUTES = ['sunlight', 'environment', 'space', 'watering', 'maintenance'];

// Ordered scales: distance between positions drives partial credit.
const SCALES = {
  sunlight: ['low', 'indirect', 'bright_indirect', 'direct'],
  space: ['small', 'room', 'balcony', 'garden'],
  climate: ['hot_tropical', 'warm_humid', 'mild', 'cool'],
  watering: ['rare', 'moderate', 'frequent'],
  maintenance: ['beginner', 'low', 'moderate', 'advanced'],
};

// Credit by distance (0,1,2,3 steps away from the nearest tolerated value).
const DISTANCE_CREDIT = [1, 0.5, 0.15, 0];

export const LABELS = {
  sunlight: { low: 'low light', indirect: 'indirect sunlight', bright_indirect: 'bright indirect sunlight', direct: 'direct sunlight' },
  space: { small: 'a small room or desk', room: 'a bedroom or living room', balcony: 'a balcony', garden: 'a garden or outdoor space' },
  environment: { indoor: 'indoor', outdoor: 'outdoor', both: 'indoor and outdoor' },
  watering: { rare: 'rare', moderate: 'moderate', frequent: 'frequent' },
  maintenance: { beginner: 'beginner-friendly', low: 'low-maintenance', moderate: 'moderate-care', advanced: 'advanced-care' },
  climate: { hot_tropical: 'hot and tropical', warm_humid: 'warm and humid', mild: 'mild', cool: 'cool' },
};

// Plant size bands (cm, based on the plant's maximum recommended height).
export const SIZE_BANDS = { small: [0, 30], medium: [30, 90], large: [90, Infinity] };

const rec = (p) => p.recommendation || {};
export const effectivePrice = (p) => p.price * (1 - (p.discount || 0) / 100);

/** Which critical attributes are missing/empty on a plant. */
export function missingCritical(plant) {
  const r = rec(plant);
  return CRITICAL_ATTRIBUTES.filter((k) => {
    const v = r[k];
    return Array.isArray(v) ? v.length === 0 : !v;
  });
}

function nearestDistance(scale, tolerated, pref) {
  const idx = SCALES[scale].indexOf(pref);
  return Math.min(...tolerated.map((v) => Math.abs(SCALES[scale].indexOf(v) - idx)));
}

/** Per-criterion scores in [0,1]. Missing data -> null (caller decides). */
export const criterionScores = {
  sunlight(plant, prefs) {
    const t = rec(plant).sunlight;
    if (!t?.length) return null;
    return DISTANCE_CREDIT[nearestDistance('sunlight', t, prefs.sunlight)];
  },
  environment(plant, prefs) {
    const e = rec(plant).environment;
    if (!e) return null;
    if (prefs.environment === 'both') return e === 'both' ? 1 : 0.6; // single-setting plants cover only half
    if (e === 'both' || e === prefs.environment) return 1;
    return 0; // strict conflicts are removed by hard filters before scoring
  },
  space(plant, prefs) {
    const t = rec(plant).space;
    if (!t?.length) return null;
    return DISTANCE_CREDIT[nearestDistance('space', t, prefs.space)];
  },
  watering(plant, prefs) {
    const w = rec(plant).watering;
    if (!w) return null;
    const d = Math.abs(SCALES.watering.indexOf(w) - SCALES.watering.indexOf(prefs.watering));
    return DISTANCE_CREDIT[d];
  },
  climate(plant, prefs) {
    const t = rec(plant).climate;
    if (!t?.length) return null;
    return DISTANCE_CREDIT[nearestDistance('climate', t, prefs.climate)];
  },
  maintenance(plant, prefs) {
    const m = rec(plant).maintenance;
    if (!m) return null;
    // Easier-than-wanted is fine; harder-than-wanted is penalised.
    const over = SCALES.maintenance.indexOf(m) - SCALES.maintenance.indexOf(prefs.maintenance);
    return over <= 0 ? 1 : DISTANCE_CREDIT[over];
  },
};

/**
 * Hard filters. Returns a reason string if the plant must be excluded,
 * otherwise null. Only rules backed by reliable plant data are applied.
 */
export function hardFilterReason(plant, prefs) {
  const r = rec(plant);
  if (plant.stock !== undefined && plant.stock <= 0) return 'out_of_stock';
  if (r.environment && r.environment !== 'both' && prefs.environment !== 'both' && r.environment !== prefs.environment) {
    return 'environment';
  }
  if (prefs.maxBudget != null && effectivePrice(plant) > prefs.maxBudget) return 'budget';
  if (prefs.petSafeOnly && r.petSafety?.status !== 'safe') return 'pet_safety'; // toxic AND unknown excluded
  if (prefs.edibleOnly && r.edible !== 'yes') return 'edible'; // safety-sensitive: must be confirmed
  if (prefs.floweringOnly && r.flowering === 'no') return 'flowering';
  if (prefs.decorativeFoliageOnly && r.decorativeFoliage === 'no') return 'foliage';
  if (prefs.plantSize && r.sizeCm?.max != null) {
    const [lo, hi] = SIZE_BANDS[prefs.plantSize];
    if (r.sizeCm.max < lo || r.sizeCm.max >= hi) return 'size';
  }
  return null;
}

export function matchLabel(score) {
  return MATCH_LABELS.find((l) => score >= l.min)?.label || null;
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** Score one plant. Returns null if critical data is missing. */
export function scorePlant(plant, prefs, weights = DEFAULT_WEIGHTS) {
  if (missingCritical(plant).length) return null;
  const warnings = [];
  const parts = {};
  let uncertain = false;

  for (const key of Object.keys(weights)) {
    let s = criterionScores[key](plant, prefs);
    if (s === null) {
      // Only climate can be missing here; never treat missing as a match.
      s = 0.4;
      uncertain = true;
      warnings.push('Climate suitability has not been verified for this plant.');
    }
    parts[key] = s;
  }

  const raw = 100 * Object.entries(weights).reduce((sum, [k, w]) => sum + w * parts[k], 0);
  let score = Math.round(clamp(raw, 0, 100));
  if (uncertain) score = Math.min(score, UNCERTAIN_SCORE_CAP);
  if (parts.sunlight < 0.5) score = Math.min(score, SUNLIGHT_MISMATCH_CAP);

  return { score, parts, uncertain, warnings };
}

function buildExplanations(plant, prefs, parts) {
  const r = rec(plant);
  const reasons = [];
  const warnings = [];

  if (parts.sunlight === 1) reasons.push(`Matches your ${LABELS.sunlight[prefs.sunlight]} conditions.`);
  else if (parts.sunlight >= 0.5) warnings.push(`Prefers ${r.sunlight.map((s) => LABELS.sunlight[s]).join(' or ')}; your ${LABELS.sunlight[prefs.sunlight]} is close but not ideal.`);
  else warnings.push(`Needs ${r.sunlight.map((s) => LABELS.sunlight[s]).join(' or ')}, which is a poor fit for ${LABELS.sunlight[prefs.sunlight]}.`);

  if (parts.environment === 1) reasons.push(`Suitable for ${LABELS.environment[prefs.environment]} growing.`);
  else if (parts.environment > 0) warnings.push(`Grows ${LABELS.environment[r.environment]} only, so it covers just part of your indoor-and-outdoor plan.`);

  if (parts.space === 1) reasons.push(`Suitable for ${LABELS.space[prefs.space]}.`);
  else warnings.push(`Best suited to ${r.space.map((s) => LABELS.space[s]).join(' or ')}, not ${LABELS.space[prefs.space]}.`);

  if (parts.watering === 1) reasons.push(`Watering needs (${LABELS.watering[r.watering]}) match your preference.`);
  else if (SCALES.watering.indexOf(r.watering) > SCALES.watering.indexOf(prefs.watering)) warnings.push('May need more frequent watering than you prefer.');
  else warnings.push('May need less frequent watering than you prefer — easy to overwater.');

  if (parts.climate === 1) reasons.push(`Tolerates ${LABELS.climate[prefs.climate]} climates.`);
  else if (r.climate?.length) warnings.push(`May not be ideal for a ${LABELS.climate[prefs.climate]} climate.`);

  if (SCALES.maintenance.indexOf(r.maintenance) <= SCALES.maintenance.indexOf(prefs.maintenance)) {
    reasons.push(`Fits your ${LABELS.maintenance[prefs.maintenance]} preference.`);
  } else warnings.push(`Needs ${LABELS.maintenance[r.maintenance]} attention, more than you asked for.`);

  if (r.petSafety?.status === 'toxic') warnings.push('Toxic to pets if eaten.');
  else if (r.petSafety?.status !== 'safe') warnings.push('Safety information unavailable.');

  if (prefs.floweringOnly && r.flowering === 'unknown') warnings.push('Flowering information unavailable.');
  if (prefs.decorativeFoliageOnly && r.decorativeFoliage === 'unknown') warnings.push('Foliage information unavailable.');
  if (prefs.plantSize && r.sizeCm?.max == null) warnings.push('Size information unavailable.');

  return { reasons, warnings };
}

function careSummary(plant) {
  const r = rec(plant);
  const tips = [...(r.careTips || [])];
  if (!tips.length && plant.care?.water) tips.push(`Water: ${plant.care.water}`);
  if (r.soilNotes) tips.push(`Soil: ${r.soilNotes}`);
  return tips;
}

/**
 * Rank plants for the given (already validated) preferences.
 * Returns { recommendations, stats } — stats explains what limited results.
 */
export function recommend(products, prefs, { limit = 12, weights = DEFAULT_WEIGHTS } = {}) {
  const stats = { considered: products.length, excluded: {}, incomplete: 0, belowThreshold: 0 };
  const bump = (k) => { stats.excluded[k] = (stats.excluded[k] || 0) + 1; };
  const scored = [];

  for (const p of products) {
    const obj = typeof p.toObject === 'function' ? p.toObject() : p;
    if (missingCritical(obj).length) { stats.incomplete += 1; continue; }
    const reason = hardFilterReason(obj, prefs);
    if (reason) { bump(reason); continue; }
    const result = scorePlant(obj, prefs, weights);
    if (result.score < MIN_SUITABLE_SCORE) { stats.belowThreshold += 1; continue; }
    const { reasons, warnings } = buildExplanations(obj, prefs, result.parts);
    scored.push({
      plantId: String(obj._id ?? obj.id),
      id: String(obj._id ?? obj.id),
      name: obj.name,
      category: obj.category,
      price: obj.price,
      discount: obj.discount || 0,
      rating: obj.rating,
      reviewCount: obj.reviewCount,
      stock: obj.stock,
      images: obj.images || [],
      image: obj.images?.[0] || null,
      suitabilityScore: result.score,
      matchLabel: matchLabel(result.score),
      dataUncertain: result.uncertain,
      reasons,
      careTips: careSummary(obj),
      warnings: [...new Set([...warnings, ...result.warnings])],
    });
  }

  scored.sort((a, b) => b.suitabilityScore - a.suitabilityScore || a.price - b.price || a.name.localeCompare(b.name));
  return { recommendations: scored.slice(0, limit), total: scored.length, stats };
}
