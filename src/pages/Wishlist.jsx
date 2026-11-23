import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getButtonClasses } from '../components/common/Button';
import Rating from '../components/common/Rating';

/**
 * Wishlist — lets a user move a saved plant into the cart, which adds
 * it via CartContext and removes it from the wishlist in one action,
 * matching the "move to cart" pattern from the spec.
 */
export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const moveToCart = (plant) => {
    addToCart(plant, 1);
    removeFromWishlist(plant.id);
  };

  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FiHeart size={40} className="text-ink/20" />
        <h1 className="mt-6 font-display text-2xl font-medium">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-ink/60">Save plants you're considering so you don't lose track of them.</p>
        <Link to="/shop" className={getButtonClasses('primary', 'md', 'mt-6')}>
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-medium">Your wishlist</h1>
      <p className="mt-1 text-sm text-ink/50">{items.length} plant{items.length !== 1 ? 's' : ''} saved</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((plant) => {
          const price = plant.price * (1 - (plant.discount || 0) / 100);
          return (
            <div key={plant.id} className="flex gap-4 rounded-2xl bg-paper p-4 shadow-card">
              <Link to={`/product/${plant.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-mist">
                <img src={plant.images[0]} alt={plant.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <Link to={`/product/${plant.id}`} className="font-display text-base font-medium hover:text-fern">
                    {plant.name}
                  </Link>
                  <div className="mt-1"><Rating value={plant.rating} size={12} /></div>
                  <p className="mt-1 font-mono text-sm font-semibold">₹{price.toFixed(0)}</p>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => moveToCart(plant)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-fern hover:underline"
                  >
                    <FiShoppingBag size={13} /> Move to cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(plant.id)}
                    aria-label={`Remove ${plant.name} from wishlist`}
                    className="text-ink/40 hover:text-red-500"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
