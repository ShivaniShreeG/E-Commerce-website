import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BASE_URL from '../api';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/logos`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLogoUrl(data[0].image_url);
        }
      })
      .catch(() => {}); // silently fail, no fallback text
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Password reset successful. Redirecting to login...');
        setError('');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.error || 'Reset failed');
        setMessage('');
      }
    } catch (err) {
      setError('Server error. Try again.');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 px-4 py-8 sm:py-16">
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

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Set New Password</h2>

        {message && <div className="text-green-600 mb-3 font-medium text-sm sm:text-base">{message}</div>}
        {error && <div className="text-red-600 mb-3 font-medium text-sm sm:text-base">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password Field */}
          <div className="relative">
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
                setMessage('');
              }}
              required
              className="peer w-full px-3 py-3 border border-sky-400 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder=" "
            />
            <label
              className={`absolute left-3 px-1 bg-white text-xs text-gray-500 transition-all ${
                password ? 'top-[-8px]' : 'top-3 text-sm'
              } peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-sky-600`}
            >
              New Password
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold transition duration-200"
          >
            Reset Password
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-700">
          <span
            onClick={() => navigate('/login')}
            className="text-sky-600 font-semibold cursor-pointer hover:underline"
          >
            Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
