import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * CategoryCard — image tile linking into the Shop pre-filtered by
 * category. Used on Home; Shop's filter sidebar uses plain text links
 * instead since images would be redundant there.
 */
export default function CategoryCard({ category }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/shop?category=${category.id}`}
        className="group relative block h-44 overflow-hidden rounded-organic sm:h-56"
      >
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <span className="absolute bottom-4 left-4 font-display text-lg font-medium text-cream">
          {category.name}
        </span>
      </Link>
    </motion.div>
  );
}
