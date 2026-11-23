import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { RequireAuth, RequireAdmin, GuestOnly, AdminGuest } from './components/auth/RouteGuards';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Contact from './pages/Contact';
import PlantFinder from './pages/PlantFinder';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Toaster position="top-right" toastOptions={{
            style: { background: '#16311F', color: '#F6F1E7', fontSize: '14px' },
          }} />
          <Routes>
            {/* Sign in / create account: only for signed-out visitors */}
            <Route element={<GuestOnly />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
            </Route>

            <Route element={<MainLayout />}>
              {/* Public storefront: anyone can browse; sign-in is asked for at checkout */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/plant-finder" element={<PlantFinder />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/contact" element={<Contact />} />

              {/* Account pages need a signed-in user */}
              <Route element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Separate admin sign-in: not linked from anywhere in the storefront */}
            <Route element={<AdminGuest />}>
              <Route path="/admin/login" element={<AdminLogin />} />
            </Route>

            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
            </Route>
          </Routes>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
