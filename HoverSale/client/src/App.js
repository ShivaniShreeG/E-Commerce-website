import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import UPIPayment from './pages/UPIPayment';
import RazorpayPayment from './pages/RazorpayPayment';

function AppWrapper() {
  const location = useLocation();
  const [navbarHeight, setNavbarHeight] = useState(0);

  const noNavbarRoutes = ['/', '/register', '/forgot-password'];
  const isResetPasswordRoute = location.pathname.startsWith('/reset-password');
  const hideNavbar = noNavbarRoutes.includes(location.pathname) || isResetPasswordRoute;

  const userId = localStorage.getItem('userId');

  return (
    <>
      {!hideNavbar && <Navbar onHeightChange={setNavbarHeight} />}
      <div style={{ marginTop: hideNavbar ? 0 : `${navbarHeight}px` }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Home />} />
          <Route path="/products/:category" element={<Products />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/placeorder" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile userId={userId} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/upi-payment" element={<UPIPayment />} />
          <Route path="/razorpay-payment" element={<RazorpayPayment />} />
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
