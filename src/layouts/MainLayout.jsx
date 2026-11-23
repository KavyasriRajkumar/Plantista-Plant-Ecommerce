import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/**
 * MainLayout — shared chrome for every customer-facing route. Admin
 * routes use AdminLayout instead (see layouts/AdminLayout.jsx), so the
 * two chrome systems never leak into each other.
 */
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
