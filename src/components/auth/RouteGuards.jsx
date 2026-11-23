import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Splash = () => (
  <div className="grid min-h-screen place-items-center bg-cream" role="status" aria-label="Loading">
    <img src="/logo.png" alt="" className="h-20 w-auto animate-pulse" />
  </div>
);

// Everything inside requires a signed-in user; otherwise go to /login and
// remember where they were headed so we can send them back after sign-in.
export function RequireAuth() {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <Splash />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

// Admin screens. The API enforces this too; this only avoids showing dead pages.
export function RequireAdmin() {
  const { user, isAdmin, initializing } = useAuth();
  if (initializing) return <Splash />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

// The admin sign-in page: signed-in admins go straight to the dashboard.
export function AdminGuest() {
  const { isAdmin, initializing } = useAuth();
  if (initializing) return <Splash />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

// Login/register are only for signed-out visitors.
export function GuestOnly() {
  const { user, initializing } = useAuth();
  if (initializing) return <Splash />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
