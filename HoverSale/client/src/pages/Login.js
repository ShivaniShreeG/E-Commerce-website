import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../api';

function Login() {
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
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.user && data.user.id) {
        localStorage.setItem('userId', data.user.id);
        setSuccess("Login successful!");
        setError("");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(data.message || "Invalid email or password");
        setSuccess("");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-sky-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>

        {error && <div className="text-red-600 mb-3 font-medium">{error}</div>}
        {success && <div className="text-green-600 mb-3 font-medium">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold transition duration-200"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-700">
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-sky-600 font-semibold cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>

        <p className="mt-2 text-sm text-gray-700">
          <span
            onClick={() => navigate('/forgot-password')}
            className="text-sky-600 font-semibold cursor-pointer hover:underline"
          >
            Forgot Password?
          </span>
        </p>

        {/* ✅ Admin Login styled like Forgot Password */}
        <p className="mt-2 text-sm text-gray-700">
          <span
            onClick={() => navigate('/admin-login')}
            className="text-sky-600 font-semibold cursor-pointer hover:underline"
          >
            Admin Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
