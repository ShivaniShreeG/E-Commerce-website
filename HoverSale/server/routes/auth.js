// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();
// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// REGISTER
router.post('/register', async (req, res) => {
  const { username, email, phone, password, address } = req.body;

  // Validate required fields
  if (!username || !email || !phone || !password || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate .com email
  if (!email.endsWith('.com')) {
    return res.status(400).json({ message: 'Email must end with .com' });
  }

  try {
    // First check if the email already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('❌ Error checking email:', err);
        return res.status(500).json({ message: 'Registration failed', error: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into DB
      const sql = 'INSERT INTO users (username, email, phone, password, address) VALUES (?, ?, ?, ?, ?)';
      const values = [username, email, phone, hashedPassword, address];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error('❌ Error inserting user:', err);
          return res.status(500).json({ message: 'Registration failed', error: err.message });
        }

        console.log('✅ User registered with ID:', result.insertId);
        res.status(200).json({ message: 'Registration successful' });
      });
    });

  } catch (error) {
    console.error('❌ Error hashing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "All fields required" });

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0) {
      return res.status(401).json({ message: "Email not found" });
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // ✅ Success
    res.json({ message: "Login successful", user: { id: user.id, username: user.username, email: user.email } });
  });
});



// Forgot Password Route
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email || !email.endsWith('.com')) {
    return res.status(400).json({ message: 'Valid .com email is required' });
  }
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
  if (err) return res.status(500).json({ message: 'Database error' });

  if (results.length === 0) {
    // To prevent enumeration attacks, respond as if email exists
    return res.status(200).json({ message: 'Reset link sent to your email' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  const sql = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
  db.query(sql, [token, expiry, email], (err, result) => {
    if (err) return res.status(500).send('Database error');

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Link',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error sending email');
      }
      return res.status(200).json('Reset link sent to your email' );
    });
  });
});
});

// --- Reset Password ---
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?', [token, Date.now()], async (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.length === 0) return res.status(400).json({ error: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?',
      [hashedPassword, token],
      (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update password' });
        res.status(200).json({ message: 'Password updated successfully' });
      }
    );
  });
});


module.exports = router;
