import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.admin && data.admin.id) {
        localStorage.setItem('adminId', data.admin.id);
        localStorage.setItem('isAdmin', 'true');
        setSuccess("Admin login successful!");
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 1500);
      } else {
        setError(data.message || "Invalid admin credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 px-4 sm:px-6">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
          Admin Login
        </h2>

        {error && <div className="text-red-600 text-sm text-center mb-3">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center mb-3">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-sky-400 focus:outline-none text-sm"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-sky-400 focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold transition duration-200"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-700">
          <span
            onClick={() => navigate('/login')}
            className="text-sky-600 font-semibold cursor-pointer hover:underline"
          >
            Back to User Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
