import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onHeightChange }) => {
  const navigate = useNavigate();
  const navbarRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (navbarRef.current && onHeightChange) {
      onHeightChange(navbarRef.current.offsetHeight);
    }

    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);
  }, [onHeightChange]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <div
      ref={navbarRef}
      className="fixed top-0 left-0 w-full bg-blue-800 text-white flex items-center justify-between px-6 py-3 shadow-md z-50"
    >
      {/* Left - Logo and Brand */}
      <div className="flex items-center gap-3">
        <img
          src="/logo1.png"
          alt="Logo"
          className="w-12 h-12 rounded-full object-cover"
        />
        <h2 className="text-2xl font-bold tracking-wide drop-shadow-sm">HoverSale</h2>
      </div>

      {/* Right - Navigation Links */}
      <div className="flex items-center gap-5 flex-wrap justify-end">
        <Link to="/" className="hover:underline">Home</Link>

        {isLoggedIn ? (
          <>
            <Link to="/wishlist" className="hover:underline">Wishlist</Link>
            <Link to="/orders" className="hover:underline">Orders</Link>
            <Link to="/cart" className="hover:underline">Cart</Link>
            <Link to="/profile" className="hover:underline">Profile</Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-white"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
