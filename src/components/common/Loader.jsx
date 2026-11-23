/**
 * Loader — small centered spinner for inline/blocking loads.
 */
export function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-sage border-t-fern" />
      <span className="text-sm text-ink/60">{label}</span>
    </div>
  );
}

/**
 * ProductCardSkeleton — shimmer placeholder matching ProductCard's
 * dimensions, used while product grids are fetching.
 */
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-paper shadow-card">
      <div className="h-56 w-full bg-mist" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-mist" />
        <div className="h-3 w-1/2 rounded bg-mist" />
        <div className="h-4 w-1/3 rounded bg-mist" />
      </div>
    </div>
  );
}
