import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Pagination — purely presentational; the caller (Shop page) owns the
 * current page and slices data accordingly. Keeps this component
 * reusable anywhere paginated results appear (e.g. future Orders list).
 */
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="rounded-full p-2 text-ink/60 hover:bg-mist disabled:opacity-30"
      >
        <FiChevronLeft size={18} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
            p === page ? 'bg-fern text-paper' : 'text-ink/60 hover:bg-mist'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="rounded-full p-2 text-ink/60 hover:bg-mist disabled:opacity-30"
      >
        <FiChevronRight size={18} />
      </button>
    </nav>
  );
}
