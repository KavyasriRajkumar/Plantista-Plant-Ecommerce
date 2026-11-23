import Rating from '../common/Rating';

/**
 * ReviewCard — used in the Home testimonials rail. Kept intentionally
 * plain (no photo avatars) since we have no real customer photography;
 * a placeholder avatar would read as more fake than no avatar at all.
 */
export default function ReviewCard({ review }) {
  return (
    <figure className="flex h-full flex-col justify-between rounded-2xl bg-paper p-6 shadow-card">
      <blockquote className="font-display text-lg leading-relaxed text-ink">“{review.quote}”</blockquote>
      <figcaption className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">{review.name}</p>
          <p className="text-xs text-ink/50">{review.role}</p>
        </div>
        <Rating value={review.rating} size={13} />
      </figcaption>
    </figure>
  );
}
