import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMenu, FiX, FiHeart, FiShoppingBag, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getButtonClasses } from '../common/Button';
import { useWishlist } from '../../context/WishlistContext';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/plant-finder', label: 'Plant Finder' },
  { to: '/contact', label: 'Contact' },
];

/**
 * Navbar — sticky top navigation. Shows live cart/wishlist counts from
 * context so badges stay in sync no matter where an item was added.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-fern ${isActive ? 'text-fern' : 'text-ink/70'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-cream/90 backdrop-blur-md">
      <div className="container-page flex h-20 items-center justify-between">
        <Link to="/" className="font-display text-2xl font-semibold text-ink" aria-label="Plantista home">
          <img src="/logo.png" alt="Plantista" className="h-12 w-auto sm:h-14" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/wishlist"
            aria-label={`Wishlist, ${wishlistItems.length} items`}
            className="relative hidden rounded-full p-2 hover:bg-mist sm:inline-flex"
          >
            <FiHeart size={20} />
            {wishlistItems.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-paper">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <Link to="/cart" aria-label={`Cart, ${itemCount} items`} className="relative rounded-full p-2 hover:bg-mist">
            <FiShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-paper">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/profile" aria-label="Account" className="hidden rounded-full p-2 hover:bg-mist sm:inline-flex">
                <FiUser size={20} />
              </Link>
              <button
                onClick={logout}
                aria-label={`Sign out ${user.name}`}
                title="Sign out"
                className="hidden rounded-full p-2 hover:bg-mist sm:inline-flex"
              >
                <FiLogOut size={20} />
              </button>
            </>
          ) : (
            <div className="ml-2 hidden items-center gap-2 sm:flex">
              <Link to="/login" className={getButtonClasses('secondary', 'sm')}>Sign in</Link>
              <Link to="/register" className={getButtonClasses('primary', 'sm')}>Sign up</Link>
            </div>
          )}

          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="rounded-full p-2 hover:bg-mist md:hidden"
          >
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-ink/5 bg-cream md:hidden"
            aria-label="Mobile"
          >
            <div className="container-page flex flex-col gap-4 py-6">
              {LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/wishlist" onClick={() => setOpen(false)} className={linkClass}>
                Wishlist
              </NavLink>
              {user ? (
                <>
                  <NavLink to="/profile" onClick={() => setOpen(false)} className={linkClass}>
                    Account
                  </NavLink>
                  <NavLink to="/orders" onClick={() => setOpen(false)} className={linkClass}>
                    My orders
                  </NavLink>
                  <button onClick={() => { setOpen(false); logout(); }} className="text-left text-sm font-medium text-ink/70 hover:text-fern">
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Link to="/login" onClick={() => setOpen(false)} className={getButtonClasses('secondary', 'sm')}>Sign in</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className={getButtonClasses('primary', 'sm')}>Sign up</Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
