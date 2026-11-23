import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiCheck, FiDroplet } from 'react-icons/fi';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Loader';
import { getButtonClasses } from '../components/common/Button';
import { getPlantRecommendations } from '../services/recommendationService';

// Value lists mirror the server enums. The server re-validates everything.
const QUESTIONS = [
  { key: 'sunlight', label: 'Sunlight availability', help: 'How much light does the spot get?', options: [
    ['low', 'Low light', 'Dim spot, far from windows'],
    ['indirect', 'Indirect sunlight', 'Bright room, no direct rays'],
    ['bright_indirect', 'Bright indirect sunlight', 'Close to a window, filtered sun'],
    ['direct', 'Direct sunlight', '4+ hours of direct sun'],
  ] },
  { key: 'space', label: 'Available space', help: 'Where will the plant live?', options: [
    ['small', 'Small room or desk', ''], ['room', 'Bedroom or living room', ''],
    ['balcony', 'Balcony', ''], ['garden', 'Garden or outdoor space', ''],
  ] },
  { key: 'environment', label: 'Growing environment', help: '', options: [
    ['indoor', 'Indoor', ''], ['outdoor', 'Outdoor', ''], ['both', 'Both indoor and outdoor', ''],
  ] },
  { key: 'climate', label: 'Climate', help: 'Pick the category closest to your area. We do not look up live weather.', options: [
    ['hot_tropical', 'Hot and tropical', ''], ['warm_humid', 'Warm and humid', ''],
    ['mild', 'Mild', ''], ['cool', 'Cool', ''],
  ] },
  { key: 'watering', label: 'Watering preference', help: 'A general preference. Real needs depend on soil moisture, pot size, temperature and light.', options: [
    ['rare', 'Rare watering', ''], ['moderate', 'Moderate watering', ''], ['frequent', 'Frequent watering', ''],
  ] },
  { key: 'maintenance', label: 'Maintenance preference', help: '', options: [
    ['beginner', 'Beginner-friendly', ''], ['low', 'Low maintenance', ''],
    ['moderate', 'Moderate care', ''], ['advanced', 'Advanced care', ''],
  ] },
];

const EMPTY_OPTIONAL = { maxBudget: '', plantSize: '', petSafeOnly: false, floweringOnly: false, decorativeFoliageOnly: false, edibleOnly: false };
const EXCLUSION_TEXT = {
  environment: 'conflicted with your indoor/outdoor choice',
  budget: 'were over your budget',
  pet_safety: 'were toxic or had no confirmed pet-safety information',
  edible: 'were not confirmed edible',
  flowering: 'do not flower',
  foliage: 'do not have decorative foliage',
  size: 'did not match your plant size',
  out_of_stock: 'are out of stock',
};

function OptionGroup({ q, value, error, onChange }) {
  return (
    <fieldset aria-describedby={`${q.key}-help`} className="rounded-2xl bg-paper p-5 shadow-card">
      <legend className="px-1 font-display text-lg font-medium text-ink">{q.label} <span aria-hidden="true" className="text-gold">*</span></legend>
      {q.help && <p id={`${q.key}-help`} className="mb-3 text-sm text-ink/60">{q.help}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map(([val, label, hint]) => (
          <label key={val} className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-gold ${value === val ? 'border-fern bg-mist' : 'border-ink/15 hover:border-sage'}`}>
            <input type="radio" name={q.key} value={val} checked={value === val} onChange={() => onChange(val)} className="mt-1 accent-fern" />
            <span><span className="font-medium text-ink">{label}</span>{hint && <span className="block text-xs text-ink/60">{hint}</span>}</span>
          </label>
        ))}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </fieldset>
  );
}

function ResultCard({ rec }) {
  const tone = rec.matchLabel === 'Excellent match' ? 'bg-fern text-paper' : rec.matchLabel === 'Good match' ? 'bg-moss text-paper' : 'bg-sage text-ink';
  return (
    <li className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-xl bg-paper px-4 py-2 shadow-card">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{rec.matchLabel}</span>
        <span className="font-mono text-sm text-ink" aria-label={`Suitability score ${rec.suitabilityScore} out of 100`}>{rec.suitabilityScore}/100</span>
      </div>
      <ProductCard plant={rec} />
      <div className="rounded-xl bg-paper p-4 text-sm shadow-card">
        {rec.reasons.length > 0 && (
          <ul className="space-y-1.5">
            {rec.reasons.map((r) => <li key={r} className="flex gap-2 text-ink/80"><FiCheck className="mt-0.5 shrink-0 text-fern" aria-hidden="true" />{r}</li>)}
          </ul>
        )}
        {rec.careTips.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-t border-ink/10 pt-3">
            {rec.careTips.map((t) => <li key={t} className="flex gap-2 text-ink/70"><FiDroplet className="mt-0.5 shrink-0 text-moss" aria-hidden="true" />{t}</li>)}
          </ul>
        )}
        {rec.warnings.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-t border-ink/10 pt-3">
            {rec.warnings.map((w) => <li key={w} className="flex gap-2 text-clay"><FiAlertTriangle className="mt-0.5 shrink-0" aria-hidden="true" />{w}</li>)}
          </ul>
        )}
      </div>
    </li>
  );
}

export default function PlantFinder() {
  const [answers, setAnswers] = useState({});
  const [optional, setOptional] = useState(EMPTY_OPTIONAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const resultsRef = useRef(null);

  const validate = () => {
    const next = {};
    QUESTIONS.forEach((q) => { if (!answers[q.key]) next[q.key] = 'Please choose an option.'; });
    if (optional.maxBudget !== '' && !(Number(optional.maxBudget) > 0)) next.maxBudget = 'Enter a positive amount.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const body = { ...answers, petSafeOnly: optional.petSafeOnly, floweringOnly: optional.floweringOnly, decorativeFoliageOnly: optional.decorativeFoliageOnly, edibleOnly: optional.edibleOnly };
    if (optional.maxBudget !== '') body.maxBudget = Number(optional.maxBudget);
    if (optional.plantSize) body.plantSize = optional.plantSize;
    setStatus('loading');
    try {
      const data = await getPlantRecommendations(body);
      setResult(data);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'We could not reach the plant finder. Please try again.');
      setStatus('error');
    }
    requestAnimationFrame(() => resultsRef.current?.focus());
  };

  const reset = () => { setAnswers({}); setOptional(EMPTY_OPTIONAL); setErrors({}); setStatus('idle'); setResult(null); };
  const setOpt = (k) => (e) => setOptional((o) => ({ ...o, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const inputCls = 'w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm focus:border-fern focus:outline-none';

  const meta = result?.meta;
  const limiting = meta ? Object.entries(meta.excluded || {}).filter(([, n]) => n > 0) : [];

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: 'Plant Finder' }]} />
      <header className="mt-4 max-w-2xl">
        <p className="eyebrow">Plant Finder</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-ink">Find Your Perfect Plant</h1>
        <p className="mt-3 text-ink/70">Tell us about your space, and discover plants that fit your lifestyle.</p>
      </header>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-5 lg:grid-cols-2" aria-label="Plant preferences">
        {QUESTIONS.map((q) => (
          <OptionGroup key={q.key} q={q} value={answers[q.key]} error={errors[q.key]} onChange={(v) => setAnswers((a) => ({ ...a, [q.key]: v }))} />
        ))}

        <fieldset className="rounded-2xl bg-paper p-5 shadow-card lg:col-span-2">
          <legend className="px-1 font-display text-lg font-medium text-ink">Optional preferences</legend>
          <p className="mb-3 text-sm text-ink/60">Filters only use plant data we have. If a plant's pet-safety status is unknown it is left out of pet-safe results, never assumed safe.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="maxBudget" className="mb-1.5 block text-sm font-medium text-ink/80">Maximum budget (₹)</label>
              <input id="maxBudget" type="number" min="1" inputMode="numeric" value={optional.maxBudget} onChange={setOpt('maxBudget')} className={inputCls} aria-invalid={!!errors.maxBudget} />
              {errors.maxBudget && <p role="alert" className="mt-1 text-sm text-red-700">{errors.maxBudget}</p>}
            </div>
            <div>
              <label htmlFor="plantSize" className="mb-1.5 block text-sm font-medium text-ink/80">Plant size</label>
              <select id="plantSize" value={optional.plantSize} onChange={setOpt('plantSize')} className={inputCls}>
                <option value="">Any size</option><option value="small">Small (under 30 cm)</option>
                <option value="medium">Medium (30–90 cm)</option><option value="large">Large (over 90 cm)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[['petSafeOnly', 'Pet-safe plants only'], ['floweringOnly', 'Flowering plants'], ['decorativeFoliageOnly', 'Decorative foliage'], ['edibleOnly', 'Edible plants']].map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center gap-3 text-sm text-ink/80">
                <input type="checkbox" checked={optional[k]} onChange={setOpt(k)} className="h-4 w-4 accent-fern" />{label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3 lg:col-span-2">
          <button type="submit" disabled={status === 'loading'} className={getButtonClasses('primary', 'lg', 'disabled:opacity-50')}>
            {status === 'loading' ? 'Finding plants…' : 'Find My Plants'}
          </button>
          <button type="button" onClick={reset} className={getButtonClasses('ghost', 'lg')}>Reset</button>
        </div>
      </form>

      <section ref={resultsRef} tabIndex={-1} aria-live="polite" aria-label="Recommendations" className="mt-12 outline-none">
        {status === 'idle' && <p className="rounded-2xl bg-mist p-6 text-sm text-ink/70">Answer the questions above and choose “Find My Plants” to see ranked recommendations.</p>}

        {status === 'loading' && (
          <div role="status" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <span className="sr-only">Calculating recommendations</span>
            {[0, 1, 2].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        )}

        {status === 'error' && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-paper p-6">
            <p className="font-medium text-red-700">Something went wrong</p>
            <p className="mt-1 text-sm text-ink/70">{errorMsg}</p>
          </div>
        )}

        {status === 'success' && meta?.catalogEmpty && (
          <div className="rounded-2xl bg-paper p-6 shadow-card">
            <h2 className="font-display text-xl">Our plant catalog is empty right now</h2>
            <p className="mt-1 text-sm text-ink/70">Please check back soon, or <Link to="/shop" className="text-fern underline">browse the shop</Link>.</p>
          </div>
        )}

        {status === 'success' && !meta?.catalogEmpty && result.count === 0 && (
          <div className="rounded-2xl bg-paper p-6 shadow-card">
            <h2 className="font-display text-xl">No plants are a good fit for these conditions</h2>
            <p className="mt-1 text-sm text-ink/70">We never loosen your requirements silently, so nothing is shown here. Try adjusting your answers.</p>
            {limiting.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-sm text-ink/70">
                {limiting.map(([k, n]) => <li key={k}>{n} plant{n > 1 ? 's' : ''} {EXCLUSION_TEXT[k] || 'were filtered out'}</li>)}
                {meta.belowThreshold > 0 && <li>{meta.belowThreshold} plant{meta.belowThreshold > 1 ? 's' : ''} scored too low for your light, space or care preferences</li>}
              </ul>
            )}
            <button onClick={reset} className={getButtonClasses('secondary', 'md', 'mt-4')}>Adjust preferences</button>
          </div>
        )}

        {status === 'success' && result.count > 0 && (
          <>
            <h2 className="font-display text-2xl font-medium">Your matches <span className="font-mono text-sm text-ink/50">({result.count}{result.total > result.count ? ` of ${result.total}` : ''})</span></h2>
            {meta?.plantsWithoutRecommendationData > 0 && (
              <p className="mt-2 text-sm text-clay">{meta.plantsWithoutRecommendationData} product{meta.plantsWithoutRecommendationData > 1 ? 's' : ''} in the catalog can't be matched yet because plant-care data is incomplete.</p>
            )}
            <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {result.recommendations.map((rec) => <ResultCard key={rec.plantId} rec={rec} />)}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
