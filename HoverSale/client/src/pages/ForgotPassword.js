import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import BASE_URL from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reset Password</h2>

        {message && (
          <div className="mb-4 text-green-600 font-medium">{message}</div>
        )}
        {error && (
          <div className="mb-4 text-red-600 font-medium">{error}</div>
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

          <div className="flex justify-center gap-4">
            <button
              type="submit"
              className="w-1/2 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition duration-200"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-1/2 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
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
