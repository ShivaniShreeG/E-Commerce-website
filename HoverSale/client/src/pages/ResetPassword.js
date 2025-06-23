import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
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

  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(to right, #ff758c, #ffb88c)',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  };

  const boxStyle = {
    backgroundColor: '#fff',
    padding: '40px 30px',
    borderRadius: '12px',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '15px',
    boxSizing: 'border-box',
  };

  const buttonStyle = {
    width: '50%',
    padding: '12px',
    backgroundColor: '#ff6b81',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  const messageStyle = {
    marginBottom: '15px',
    fontWeight: 'bold',
    color: message ? 'green' : 'red',
  };

  return (
    <div style={pageStyle}>
      <div style={boxStyle}>
        <h2>Set New Password</h2>

        {message && <div style={messageStyle}>{message}</div>}
        {error && <div style={{ ...messageStyle, color: 'red' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
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
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>Reset Password</button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
