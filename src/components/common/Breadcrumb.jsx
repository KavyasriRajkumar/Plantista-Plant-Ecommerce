import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

/**
 * Breadcrumb — `items` is an array of { label, to }. The last item is
 * rendered as plain text (current page), never a link.
 */
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink/50">
      <Link to="/" className="hover:text-fern">Home</Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-2">
            <FiChevronRight size={12} />
            {isLast || !item.to ? (
              <span className="text-ink/80" aria-current="page">{item.label}</span>
            ) : (
              <Link to={item.to} className="hover:text-fern">{item.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
