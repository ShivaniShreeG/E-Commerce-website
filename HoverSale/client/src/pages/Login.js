import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Login response:", data);

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
    <div className="h-screen flex justify-center items-center bg-gradient-to-r from-pink-400 to-orange-300">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login</h2>

        {error && <div className="text-red-600 mb-3 font-medium">{error}</div>}
        {success && <div className="text-green-600 mb-3 font-medium">{success}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none"
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-1/2 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-medium transition"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-700">
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-pink-500 font-semibold cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
        <p className="mt-2 text-sm text-gray-700">
          <span
            onClick={() => navigate('/forgot-password')}
            className="text-pink-500 font-semibold cursor-pointer hover:underline"
          >
            Forgot Password?
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
