import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.endsWith(".com")) {
      setMessage("Email must end with .com");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful. Redirecting to login page...");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  const styles = {
    wrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "linear-gradient(to right, #ff758c, #ffb88c)",
    },
    container: {
      backgroundColor: "white",
      padding: "20px 40px",
      borderRadius: "15px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      width: "360px",
      maxWidth: "90%",
      textAlign: "center",
    },
    heading: {
      marginTop: 0,
      marginBottom: "20px",
      color: "#333",
      fontSize: "24px",
    },
    input: {
      width: "80%",
      padding: "10px 15px",
      margin: "10px 0",
      border: "1px solid #ccc",
      borderRadius: "8px",
      fontSize: "14px",
      backgroundColor: "#f9f9f9",
      outline: "none",
    },
    button: {
      width: "50%",
      padding: "12px",
      backgroundColor: "#ff6b81",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "10px",
    },
    messageBox: {
      backgroundColor: "#fff",
      color: "green",
      padding: "4px",
      marginBottom: "15px",
      border: "1px solid #fff",
      borderRadius: "4px",
      textAlign: "center",
      fontWeight: "bold",
      fontSize:"14px",
    },
    loginLink: {
      textAlign: "center",
      marginTop: "15px",
      fontSize: "14px",
    },
    loginSpan: {
      cursor: "pointer",
      color: "#ff5e73",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Register</h2>
        {message && <div style={styles.messageBox}>{message}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="text" name="username" placeholder="Username" onChange={handleChange} required />
          <input style={styles.input} type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input style={styles.input} type="text" name="phone" placeholder="Phone" onChange={handleChange} required />
          <input style={styles.input} type="text" name="address" placeholder="Address" onChange={handleChange} required />
          <input style={styles.input} type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input style={styles.input} type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
          <button type="submit" style={styles.button}>Register</button>
        </form>
        <p style={styles.loginLink}>
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} style={styles.loginSpan}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
