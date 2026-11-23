import { NavLink, Link } from 'react-router-dom';
import { FiGrid, FiBox, FiShoppingBag, FiUsers, FiArrowLeft } from 'react-icons/fi';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
];

/**
 * Sidebar — fixed admin navigation. Kept separate from the customer
 * Navbar entirely; admin routes never render the storefront chrome.
 */
export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-cream/10 bg-ink px-4 py-6 text-cream md:flex">
      <Link to="/" className="mb-8 flex items-center gap-2 px-2 font-display text-xl font-semibold">
        Plantista
      </Link>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-fern text-cream' : 'text-cream/60 hover:bg-cream/5 hover:text-cream'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <Link
        to="/"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cream/60 hover:bg-cream/5 hover:text-cream"
      >
        <FiArrowLeft size={16} /> Back to store
      </Link>
    </aside>
  );
}
