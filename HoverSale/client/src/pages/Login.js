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
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Login</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            style={styles.input}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            style={styles.input}
            onChange={handleChange}
            required
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>

        <p style={styles.linkText}>
          Don't have an account?{" "}
          <span onClick={() => navigate('/register')} style={styles.link}>
            Register
          </span>
        </p>
        <p style={styles.linkText}>
          <span onClick={() => navigate('/forgot-password')} style={styles.link}>
            Forgot Password?
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    background: "linear-gradient(to right, #ff758c, #ffb88c)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: "40px 30px",
    borderRadius: "12px",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "400px",
    boxSizing: "border-box",
    textAlign: "center",
  },
  heading: {
    marginBottom: "25px",
    fontSize: "26px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
    backgroundColor: "#f9f9f9",
    outline: "none",
  },
  button: {
    width: "50%",
    padding: "12px",
    backgroundColor: "#ff6b81",
    color: "white",
    border: "none",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  linkText: {
    textAlign: "center",
    marginTop: "12px",
    fontSize: "14px",
    color: "#333",
  },
  link: {
    color: "#ff6b81",
    cursor: "pointer",
    fontWeight: "bold",
  },
  success: {
    color: "green",
    marginBottom: "15px",
  },
  error: {
    color: "red",
    marginBottom: "15px",
  },
};

export default Login;
