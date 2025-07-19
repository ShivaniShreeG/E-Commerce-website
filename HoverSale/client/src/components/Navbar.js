import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BASE_URL from '../api';
import {
  FaHome,
  FaHeart,
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaBoxOpen,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const Navbar = ({ onHeightChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navbarRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    // Set navbar height
    if (navbarRef.current && onHeightChange) {
      onHeightChange(navbarRef.current.offsetHeight);
    }

    // Check login & fetch counts
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);

    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const wishlist = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    setCartCount(cart.length);
    setWishlistCount(wishlist.length);
  }, [location, onHeightChange]);

  // ✅ Fetch dynamic logo from backend
  useEffect(() => {
  fetch(`${BASE_URL}/api/logos`)
    .then(res => res.json())
    .then(data => {
      // If it's an array, get the first logo
      if (Array.isArray(data) && data.length > 0) {
        setLogoUrl(data[0].image_url);
      }
    })
    .catch(err => console.error('Logo fetch error:', err));
}, []);


  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div
      ref={navbarRef}
      className="fixed top-0 left-0 w-full bg-gradient-to-r from-sky-400 via-cyan-500 to-teal-500 text-white shadow-md z-50"
    >
      <div className="flex justify-between items-center px-4 py-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover shadow"
            />
          ) : (
            <div className="w-10 h-10 bg-white rounded-full animate-pulse" />
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide drop-shadow">
            HoverSale
          </h2>
        </div>

        {/* Hamburger Icon */}
        <button
          className="text-white sm:hidden text-xl focus:outline-none"
          onClick={toggleMenu}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex gap-5 text-sm sm:text-base items-center font-medium">
          <Link to="/" className="hover:text-yellow-300 transition flex items-center gap-1">
            <FaHome /> Home
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/wishlist" className="hover:text-red-500 transition relative flex items-center gap-1">
                <FaHeart /> Wishlist
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-white text-red-600 text-xs px-1.5 py-0.5 rounded-full shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/orders" className="hover:text-amber-500 transition flex items-center gap-1">
                <FaBoxOpen /> Orders
              </Link>
              <Link to="/cart" className="hover:text-lime-300 transition relative flex items-center gap-1">
                <FaShoppingCart /> Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-white text-green-600 text-xs px-1.5 py-0.5 rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="hover:text-indigo-300 transition flex items-center gap-1">
                <FaUser /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 transition"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white flex items-center gap-1 transition"
            >
              <FaSignInAlt /> Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-3 px-4 pb-4 text-sm bg-gradient-to-r from-sky-400 via-cyan-500 to-teal-500 text-white font-medium">
          <Link to="/" onClick={toggleMenu} className="flex items-center gap-2 hover:text-yellow-300">
            <FaHome /> Home
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/wishlist" onClick={toggleMenu} className="flex items-center gap-2 hover:text-red-500 relative">
                <FaHeart /> Wishlist
                {wishlistCount > 0 && (
                  <span className="absolute left-24 bg-white text-red-600 text-xs px-2 py-0.5 rounded-full shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/orders" onClick={toggleMenu} className="flex items-center gap-2 hover:text-amber-500">
                <FaBoxOpen /> Orders
              </Link>
              <Link to="/cart" onClick={toggleMenu} className="flex items-center gap-2 hover:text-green-500 relative">
                <FaShoppingCart /> Cart
                {cartCount > 0 && (
                  <span className="absolute left-24 bg-white text-green-600 text-xs px-2 py-0.5 rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" onClick={toggleMenu} className="flex items-center gap-2 hover:text-indigo-500">
                <FaUser /> Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="flex items-center gap-2 text-left bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={toggleMenu}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              <FaSignInAlt /> Login
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
