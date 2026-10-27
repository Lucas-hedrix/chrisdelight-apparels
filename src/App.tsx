import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { UIProvider } from './context/UIContext';
import { NotificationProvider } from './context/NotificationContext';
import Shell from './components/Shell';
import Dashboard from './pages/Dashboard';
import Collection from './pages/Collection';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ShippingReturns from './pages/ShippingReturns';
import Sell from './pages/Sell';
import Vendors from './pages/Vendors';
import VendorStorefront from './pages/VendorStorefront';
import VendorDashboard from './pages/VendorDashboard';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Auth from './pages/Auth';
import AuthVerified from './pages/AuthVerified';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminVendors from './pages/admin/AdminVendors';
import { WhatsAppBlob } from './components/WhatsAppBlob';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <UIProvider>
            <NotificationProvider>
              <CartProvider>
                <WishlistProvider>
                  <Routes>
                    <Route element={<Shell />}>
                      <Route index element={<Dashboard />} />
                      <Route path="collections" element={<Collection />} />
                      <Route path="vendors" element={<Vendors />} />
                      <Route path="vendors/:slug" element={<VendorStorefront />} />
                      <Route path="support" element={<Support />} />
                      <Route path="terms" element={<Terms />} />
                      <Route path="privacy" element={<Privacy />} />
                      <Route path="shipping-returns" element={<ShippingReturns />} />
                      <Route path="sell" element={<Sell />} />
                      <Route path="vendor" element={<VendorDashboard />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="wishlist" element={<Wishlist />} />
                    </Route>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/verified" element={<AuthVerified />} />
                    <Route path="/login" element={<Navigate to="/auth" replace />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminOverview />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="vendors" element={<AdminVendors />} />
                    </Route>
                  </Routes>
                  <WhatsAppRoutes />
                </WishlistProvider>
              </CartProvider>
            </NotificationProvider>
          </UIProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

// WhatsApp contact stays available everywhere except the admin panel and auth page.
function WhatsAppRoutes() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname.startsWith('/login')) return null;
  return <WhatsAppBlob />;
}
