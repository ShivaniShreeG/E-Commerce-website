import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BASE_URL from '../api';

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        setMessage('Password reset successful');
        setError('');
        setTimeout(() => navigate('/'), 3000);
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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-400 to-orange-300 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Set New Password</h2>

        {message && <div className="text-green-600 font-semibold mb-4">{message}</div>}
        {error && <div className="text-red-600 font-semibold mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
              setMessage('');
            }}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            type="submit"
            className="w-1/2 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-md transition duration-300"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
