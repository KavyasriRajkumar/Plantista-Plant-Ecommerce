import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiDroplet, FiSun, FiFeather, FiMinus, FiPlus } from 'react-icons/fi';
import { getPlantById, getRelatedPlants } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Rating from '../components/common/Rating';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/common/Button';
import { Loader } from '../components/common/Loader';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [plant, setPlant] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    getPlantById(id)
      .then(async (data) => {
        if (!active) return;
        setPlant(data);
        if (data) {
          const rel = await getRelatedPlants(data);
          if (active) setRelated(rel);
        }
      })
      .catch(() => active && toast.error('Could not load this plant'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Loader label="Loading plant details…" />;

  if (!plant) {
    return (
      <div className="container-page py-20 text-center">
        <p className="font-display text-2xl">Plant not found.</p>
        <Link to="/shop" className="mt-4 inline-block text-fern hover:underline">Back to shop</Link>
      </div>
    );
  }

  const finalPrice = plant.price * (1 - (plant.discount || 0) / 100);
  const wishlisted = isWishlisted(plant.id);

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: 'Shop', to: '/shop' }, { label: plant.name }]} />

      <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-organic bg-mist">
            <img src={plant.images[activeImage]} alt={plant.name} className="h-full w-full object-cover" />
          </div>
          {plant.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {plant.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={activeImage === i}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${activeImage === i ? 'border-fern' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="eyebrow">{plant.category}</p>
          <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">{plant.name}</h1>
          <div className="mt-3">
            <Rating value={plant.rating} count={plant.reviewCount} showValue />
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-semibold text-ink">₹{finalPrice.toFixed(0)}</span>
            {plant.discount > 0 && (
              <>
                <span className="font-mono text-base text-ink/40 line-through">₹{plant.price}</span>
                <span className="rounded-full bg-gold/15 px-2 py-1 font-mono text-xs font-medium text-gold">
                  Save {plant.discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/70">{plant.description}</p>

          {/* Care info */}
          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-ink/10 p-4">
            <div className="text-center">
              <FiDroplet className="mx-auto text-fern" size={18} />
              <p className="mt-1 text-[11px] font-medium text-ink/70">{plant.care.water}</p>
            </div>
            <div className="border-x border-ink/10 text-center">
              <FiSun className="mx-auto text-fern" size={18} />
              <p className="mt-1 text-[11px] font-medium text-ink/70">{plant.care.sunlight}</p>
            </div>
            <div className="text-center">
              <FiFeather className="mx-auto text-fern" size={18} />
              <p className="mt-1 text-[11px] font-medium text-ink/70">{plant.care.fertilizer}</p>
            </div>
          </div>

          <p className={`mt-4 text-sm font-medium ${plant.stock > 0 ? 'text-fern' : 'text-red-600'}`}>
            {plant.stock > 0 ? `In stock — ${plant.stock} available` : 'Out of stock'}
          </p>

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-ink/15">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-3 hover:text-fern"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium" aria-live="polite">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(plant.stock, q + 1))}
                aria-label="Increase quantity"
                className="p-3 hover:text-fern"
              >
                <FiPlus size={14} />
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              disabled={plant.stock === 0}
              onClick={() => addToCart(plant, quantity)}
            >
              Add to cart
            </Button>

            <button
              onClick={() => toggleWishlist(plant)}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={wishlisted}
              className="rounded-full border border-ink/15 p-3 hover:border-gold hover:text-gold"
            >
              <FiHeart size={18} className={wishlisted ? 'fill-gold text-gold' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-medium">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} plant={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
