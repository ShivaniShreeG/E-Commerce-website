import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import BASE_URL from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const navigate = useNavigate();

  // ✅ Fetch logo (like login/register pages)
  useEffect(() => {
    fetch(`${BASE_URL}/api/logos`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLogoUrl(data[0].image_url);
        } else {
          setLogoUrl('https://yourfallbacklogo.com/logo.png'); // fallback
        }
      })
      .catch(() => setLogoUrl('https://yourfallbacklogo.com/logo.png'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.endsWith('.com')) {
      setError('Email must end with .com');
      setMessage('');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.text();
      if (response.ok) {
        setMessage(result);
        setError('');
      } else {
        setError(result);
        setMessage('');
      }
    } catch (err) {
      setError('Failed to connect to server');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 px-4">
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src={logoUrl}
            alt=""
            className="h-14 object-contain rounded-full shadow hover:scale-105 transition-transform duration-300"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Reset Password
        </h2>

        {message && (
          <div className="mb-4 text-green-600 font-medium text-center">{message}</div>
        )}
        {error && (
          <div className="mb-4 text-red-600 font-medium text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setMessage('');
              setError('');
            }}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-sky-400"
          />

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="submit"
              className="w-full sm:w-1/2 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition duration-200"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full sm:w-1/2 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
