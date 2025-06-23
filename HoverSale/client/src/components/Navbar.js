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

    // Check if user is logged in (based on userId or token in localStorage)
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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        backgroundColor: '#2a5298',
        color: '#fff',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 1000,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/logo1.png"
          alt="Logo"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: '10px',
          }}
        />
        <h2 style={{
          margin: 0,
          fontSize: '1.8rem',
          fontWeight: 'bold',
          fontFamily: 'Segoe UI, Roboto, sans-serif',
          color: '#ffffff',
          letterSpacing: '1px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
        }}>
          HoverSale
        </h2>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        gap: '15px',
        maxWidth: '60%',
      }}>
        <Link to="/" style={linkStyle}>Home</Link>
        {isLoggedIn && (
          <>
            <Link to="/wishlist" style={linkStyle}>Wishlist</Link>
            <Link to="/orders" style={linkStyle}>Orders</Link>
            <Link to="/cart" style={linkStyle}>Cart</Link>
            <Link to="/profile" style={linkStyle}>Profile</Link>
            <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
          </>
        )}
        {!isLoggedIn && (
          <Link to="/login" style={{ ...linkStyle, background: 'green', padding: '6px 12px', borderRadius: '5px' }}>
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const logoutButtonStyle = {
  background: 'red',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  padding: '5px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export default Navbar;
