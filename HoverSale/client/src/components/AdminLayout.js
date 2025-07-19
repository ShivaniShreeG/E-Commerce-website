import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaUsers,
  FaSignOutAlt,
  FaShoppingBag,
  FaTags,
  FaBars,
  FaTimes,
  FaImage, // NEW: Icon for banner/logo
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Toggle Button */}
      <div className="md:hidden bg-slate-800 text-white flex items-center justify-between p-4">
        <div className="text-xl font-bold">Admin Panel</div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-800 text-white flex-col p-4 z-10 absolute md:relative top-0 left-0 h-screen md:h-auto`}
      >
        <div className="text-2xl font-bold mb-6 text-center hidden md:block">Admin Panel</div>
        <nav className="flex flex-col gap-4">
          <Link to="/admin-dashboard" className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded">
            <FaTachometerAlt /> Dashboard
          </Link>
          <Link to="/admin-orders" className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded">
            <FaShoppingBag /> Orders
          </Link>
          <Link to="/admin-products" className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded">
            <FaBoxOpen /> Products
          </Link>
          <Link to="/admin-users" className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded">
            <FaUsers /> Users
          </Link>
          <Link to="/admin-categories" className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded">
            <FaTags /> Categories
          </Link>

          {/* ✅ NEW: Banners & Logo section */}
          <Link to="/admin-assets" className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded">
            <FaImage /> Banners & Logo
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 hover:bg-red-600 p-2 rounded mt-auto"
          >
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto mt-16 md:mt-0">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
