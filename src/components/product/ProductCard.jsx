import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import Rating from '../common/Rating';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { getButtonClasses } from '../common/Button';

/**
 * ProductCard — the single card design reused in Shop grid, Home
 * featured/best-seller rails, and related-products. Keeping one
 * implementation means a pricing or badge change updates everywhere.
 */
export default function ProductCard({ plant }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isWishlisted(plant.id);
  const finalPrice = plant.price * (1 - (plant.discount || 0) / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl bg-paper shadow-card transition-shadow hover:shadow-lift"
    >
      <button
        onClick={() => toggleWishlist(plant)}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={wishlisted}
        className="absolute right-3 top-3 z-10 rounded-full bg-paper/90 p-2 text-ink shadow-sm transition-colors hover:text-gold"
      >
        <FiHeart size={16} className={wishlisted ? 'fill-gold text-gold' : ''} />
      </button>

      {plant.discount > 0 && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-gold px-2.5 py-1 font-mono text-[10px] font-medium text-paper">
          -{plant.discount}%
        </span>
      )}

      <Link to={`/product/${plant.id}`} className="block">
        <div className="h-56 w-full overflow-hidden bg-mist">
          <img
            src={plant.images[0]}
            alt={plant.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div className="p-4">
          <p className="eyebrow">{plant.category}</p>
          <h3 className="mt-1 font-display text-lg font-medium text-ink">{plant.name}</h3>
          <div className="mt-1">
            <Rating value={plant.rating} count={plant.reviewCount} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-base font-semibold text-ink">₹{finalPrice.toFixed(0)}</span>
            {plant.discount > 0 && (
              <span className="font-mono text-xs text-ink/40 line-through">₹{plant.price}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={() => addToCart(plant, 1)}
          disabled={plant.stock === 0}
          className={getButtonClasses('secondary', 'sm', 'w-full disabled:opacity-40')}
        >
          {plant.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </motion.div>
  );
}
