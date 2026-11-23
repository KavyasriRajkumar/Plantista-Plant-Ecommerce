import { createContext, useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

// Provides cart state to the whole tree. Kept in React state (not
// localStorage) per the project's in-memory-only constraint for
// browser-based demos; swapping to a persisted store later only
// means changing the useState initializer and the mutator bodies.
export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { plant, quantity }

  const addToCart = (plant, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.plant.id === plant.id);
      if (existing) {
        return prev.map((i) =>
          i.plant.id === plant.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { plant, quantity }];
    });
    toast.success(`${plant.name} added to cart`);
  };

  const removeFromCart = (plantId) => {
    setItems((prev) => prev.filter((i) => i.plant.id !== plantId));
  };

  const updateQuantity = (plantId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => (i.plant.id === plantId ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const { subtotal, itemCount } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        const price = i.plant.price * (1 - (i.plant.discount || 0) / 100);
        acc.subtotal += price * i.quantity;
        acc.itemCount += i.quantity;
        return acc;
      },
      { subtotal: 0, itemCount: 0 }
    );
  }, [items]);

  const value = { items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, itemCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook keeps components from importing useContext + CartContext
// separately, and throws early if used outside the provider.
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
