import toast from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import { getPlants, getCategories } from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/product/FilterSidebar';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import Breadcrumb from '../components/common/Breadcrumb';
import { ProductCardSkeleton } from '../components/common/Loader';

const PAGE_SIZE = 8;
const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

/**
 * Shop — the main browse/filter/search page. Filter state is kept in
 * React state, seeded once from the URL's ?category=/?search= params so
 * links from Home/Footer land pre-filtered; it deliberately does NOT
 * sync back to the URL on every change, to keep the filter UI snappy.
 */
export default function Shop() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: null,
    maxPrice: null,
    minRating: null,
    sort: '',
  });

  useEffect(() => {
    getCategories().then(setCategories).catch(() => toast.error('Could not load categories'));
  }, []);

  useEffect(() => {
    setLoading(true);
    getPlants(filters)
      .then((res) => {
        setAllResults(res);
        setPage(1);
      })
      .catch(() => toast.error('Could not load plants. Is the API running?'))
      .finally(() => setLoading(false));
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(allResults.length / PAGE_SIZE));
  const pageResults = useMemo(
    () => allResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [allResults, page]
  );

  const clearFilters = () =>
    setFilters({ category: '', search: filters.search, minPrice: null, maxPrice: null, minRating: null, sort: '' });

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: 'Shop' }]} />
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-medium">Shop all plants</h1>
        <SearchBar
          className="sm:max-w-xs"
          onSearch={(q) => setFilters((f) => ({ ...f, search: q }))}
        />
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar categories={categories} filters={filters} onChange={setFilters} onClear={clearFilters} />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm lg:hidden"
            >
              <FiFilter size={14} /> Filters
            </button>
            <p className="text-sm text-ink/50">{allResults.length} plants</p>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              aria-label="Sort by"
              className="rounded-full border border-ink/15 bg-paper px-4 py-2 text-sm text-ink focus:border-fern focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductCardSkeleton key={i} />)
              : pageResults.map((plant) => <ProductCard key={plant.id} plant={plant} />)}
          </div>

          {!loading && allResults.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-display text-xl text-ink">No plants match those filters.</p>
              <p className="mt-2 text-sm text-ink/50">Try clearing a filter or searching for something else.</p>
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto h-full w-72 overflow-y-auto bg-cream p-6 shadow-lift">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Close filters"
              className="mb-4 rounded-full p-2 hover:bg-mist"
            >
              <FiX size={18} />
            </button>
            <FilterSidebar categories={categories} filters={filters} onChange={setFilters} onClear={clearFilters} />
          </div>
        </div>
      )}
    </div>
  );
}
