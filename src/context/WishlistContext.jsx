import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]); // array of plant objects

  const isWishlisted = (plantId) => items.some((p) => p.id === plantId);

  const toggleWishlist = (plant) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === plant.id);
      if (exists) {
        toast('Removed from wishlist', { icon: '💚' });
        return prev.filter((p) => p.id !== plant.id);
      }
      toast.success('Added to wishlist');
      return [...prev, plant];
    });
  };

  const removeFromWishlist = (plantId) => {
    setItems((prev) => prev.filter((p) => p.id !== plantId));
  };

  const value = { items, isWishlisted, toggleWishlist, removeFromWishlist };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
