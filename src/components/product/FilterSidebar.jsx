const PRICE_BANDS = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 – ₹1,500', min: 1000, max: 1500 },
  { label: '₹1,500 – ₹2,000', min: 1500, max: 2000 },
  { label: 'Above ₹2,000', min: 2000, max: Infinity },
];

const RATING_BANDS = [4.5, 4, 3.5];

/**
 * FilterSidebar — controlled component. Shop owns all filter state and
 * passes it down plus setters, so the same sidebar can be reused inside
 * a mobile drawer or a desktop rail without duplicating filter logic.
 */
export default function FilterSidebar({ categories, filters, onChange, onClear }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <aside className="w-full shrink-0 space-y-8 lg:w-64">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">Filters</h2>
        <button onClick={onClear} className="text-xs font-medium text-fern hover:underline">
          Clear all
        </button>
      </div>

      <fieldset>
        <legend className="eyebrow mb-3">Category</legend>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex cursor-pointer items-center gap-2 text-sm text-ink/70">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat.id}
                onChange={() => set({ category: cat.id })}
                className="accent-fern"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3">Price</legend>
        <div className="space-y-2">
          {PRICE_BANDS.map((band) => (
            <label key={band.label} className="flex cursor-pointer items-center gap-2 text-sm text-ink/70">
              <input
                type="radio"
                name="price"
                checked={filters.minPrice === band.min && filters.maxPrice === band.max}
                onChange={() => set({ minPrice: band.min, maxPrice: band.max })}
                className="accent-fern"
              />
              {band.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3">Rating</legend>
        <div className="space-y-2">
          {RATING_BANDS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm text-ink/70">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === r}
                onChange={() => set({ minRating: r })}
                className="accent-fern"
              />
              {r}+ stars
            </label>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}
