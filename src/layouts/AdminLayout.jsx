import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

/**
 * AdminLayout — chrome for every /admin/* route. Deliberately does not
 * reuse MainLayout; admin is a separate application surface with its
 * own navigation, so mixing the two chrome systems would only create
 * confusing edge cases (e.g. storefront Navbar cart badge in admin).
 */
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-5 py-6 sm:px-8 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
