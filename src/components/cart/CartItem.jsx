import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

/**
 * CartItem — one product row in the Cart page. Reads/writes through
 * CartContext directly so the Cart page itself stays thin.
 */
export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { plant, quantity } = item;
  const price = plant.price * (1 - (plant.discount || 0) / 100);

  return (
    <div className="flex items-center gap-4 border-b border-ink/10 py-5">
      <Link to={`/product/${plant.id}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mist">
        <img src={plant.images[0]} alt={plant.name} className="h-full w-full object-cover" />
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={`/product/${plant.id}`} className="font-display text-base font-medium text-ink hover:text-fern">
          {plant.name}
        </Link>
        <p className="mt-1 text-xs text-ink/50 capitalize">{plant.category}</p>
        <p className="mt-1 font-mono text-sm font-semibold text-ink sm:hidden">₹{price.toFixed(0)}</p>
      </div>

      <div className="hidden items-center rounded-full border border-ink/15 sm:flex">
        <button onClick={() => updateQuantity(plant.id, quantity - 1)} aria-label="Decrease quantity" className="p-2.5 hover:text-fern">
          <FiMinus size={12} />
        </button>
        <span className="w-6 text-center text-sm">{quantity}</span>
        <button onClick={() => updateQuantity(plant.id, quantity + 1)} aria-label="Increase quantity" className="p-2.5 hover:text-fern">
          <FiPlus size={12} />
        </button>
      </div>

      <p className="hidden w-20 text-right font-mono text-sm font-semibold text-ink sm:block">
        ₹{(price * quantity).toFixed(0)}
      </p>

      <button
        onClick={() => removeFromCart(plant.id)}
        aria-label={`Remove ${plant.name} from cart`}
        className="rounded-full p-2 text-ink/40 hover:bg-mist hover:text-red-500"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
}
