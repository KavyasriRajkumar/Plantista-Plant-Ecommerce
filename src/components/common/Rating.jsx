import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

/**
 * Rating — renders a 5-star display for a numeric rating, optionally
 * with the review count and/or the raw number alongside it.
 */
export default function Rating({ value = 0, count, size = 14, showValue = false }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-1" role="img" aria-label={`Rated ${value} out of 5 stars`}>
      <div className="flex text-gold" style={{ fontSize: size }}>
        {Array.from({ length: full }).map((_, i) => (
          <FaStar key={`f${i}`} />
        ))}
        {half && <FaStarHalfAlt />}
        {Array.from({ length: empty }).map((_, i) => (
          <FaRegStar key={`e${i}`} />
        ))}
      </div>
      {showValue && <span className="text-xs font-medium text-ink/70">{value.toFixed(1)}</span>}
      {count != null && <span className="text-xs text-ink/50">({count})</span>}
    </div>
  );
}
