import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/logos`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLogoUrl(data[0].image_url);
        }
      })
      .catch(err => console.error("Logo fetch error:", err));
  }, []);

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
    <div className="min-h-screen flex justify-center items-center bg-sky-100 px-4 py-8 sm:py-16">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-center animate-fade-in">

        {/* Logo */}
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 rounded-full object-cover shadow hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full animate-pulse" />
        )}

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Login</h2>

        {error && <div className="text-red-600 mb-3 font-medium text-sm sm:text-base">{error}</div>}
        {success && <div className="text-green-600 mb-3 font-medium text-sm sm:text-base">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="peer w-full px-3 py-3 border border-sky-400 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              required
              placeholder=" "
            />
            <label
              className={`absolute left-3 px-1 bg-white text-xs text-gray-500 transition-all ${
                formData.email ? "top-[-8px]" : "top-3 text-sm"
              } peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-sky-600`}
            >
              Email
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="peer w-full px-3 py-3 border border-sky-400 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              required
              placeholder=" "
            />
            <label
              className={`absolute left-3 px-1 bg-white text-xs text-gray-500 transition-all ${
                formData.password ? "top-[-8px]" : "top-3 text-sm"
              } peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-sky-600`}
            >
              Password
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold transition duration-200"
          >
            Login
          </button>
        </form>

        {/* Bottom Links */}
        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p>
            Don't have an account?{" "}
            <span
              onClick={() => navigate('/register')}
              className="text-sky-600 font-semibold cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>
          <p>
            <span
              onClick={() => navigate('/forgot-password')}
              className="text-sky-600 font-semibold cursor-pointer hover:underline"
            >
              Forgot Password?
            </span>
          </p>
          <p>
            <span
              onClick={() => navigate('/admin-login')}
              className="text-sky-600 font-semibold cursor-pointer hover:underline"
            >
              Admin Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
