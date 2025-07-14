import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

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
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
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
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-pink-500 to-orange-300 font-sans">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-6">Reset Password</h2>

        {message && (
          <div className="mb-4 font-semibold text-green-600">{message}</div>
        )}
        {error && (
          <div className="mb-4 font-semibold text-red-600">{error}</div>
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
    className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
  />

  {/* Buttons in a flex row with gap */}
  <div className="flex justify-center gap-4">
    <button
      type="submit"
      className="w-1/2 py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition duration-200"
    >
      Send Reset Link
    </button>

    <button
      type="button"
      onClick={() => navigate('/')}
      className="w-1/2 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
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
