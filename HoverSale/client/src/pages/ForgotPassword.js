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
    marginBottom: '10px',
  };

  const secondaryButton = {
    ...buttonStyle,
    backgroundColor: '#ff6b81',
  };

  const messageStyle = {
    marginBottom: '15px',
    fontWeight: 'bold',
    color: message ? 'green' : 'red',
  };

  return (
    <div style={pageStyle}>
      <div style={boxStyle}>
        <h2>Reset Password</h2>
        {message && <div style={messageStyle}>{message}</div>}
        {error && <div style={{ ...messageStyle, color: 'red' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
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
            style={inputStyle}
          />
          <div>
          <button type="submit" style={buttonStyle}>
            Send Reset Link
          </button>
          </div>
          <button type="button" onClick={() => navigate('/')} style={secondaryButton}>
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
