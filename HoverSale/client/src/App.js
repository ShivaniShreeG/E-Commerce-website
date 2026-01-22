import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';

import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Products from './pages/Products';
import Wishlist from './pages/Wishlist';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import RazorpayPayment from './pages/RazorpayPayment';
import TrackingPage from './pages/TrackingPage'; 
// ✅ Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCategories from './pages/AdminCategories';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminAssetsPage from './pages/AdminAssetsPage';
function AppWrapper() {
  const location = useLocation();
  const [navbarHeight, setNavbarHeight] = useState(0);

  const hideNavbar = (() => {
    const path = location.pathname;

    // ❌ Hide for user auth and reset-password
    if (
      path === '/register' ||
      path === '/forgot-password' ||
      path.startsWith('/reset-password')
    ) {
      return true;
    }

    // ❌ Hide for all admin routes
    if (path.startsWith('/admin')) return true;

    return false;
  })();

  const userId = localStorage.getItem('userId');

  return (
    <>
      {!hideNavbar && <Navbar onHeightChange={setNavbarHeight} />}
      <div style={{ marginTop: hideNavbar ? 0 : `${navbarHeight}px` }}>
        <Routes>
          {/* ✅ User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/products/:category" element={<Products />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/placeorder" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile userId={userId} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/razorpay-payment" element={<RazorpayPayment />} />
          <Route path="/track-order/:trackingId" element={<TrackingPage />} />
          {/* ✅ Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-users" element={<AdminUsers />} />
          <Route path="/admin-categories" element={<AdminCategories />} />
          <Route path="/admin-products" element={<AdminProducts />} />
          <Route path="/admin-orders" element={<AdminOrders />} />
          <Route path="/admin-assets" element={<AdminAssetsPage />} />

        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
