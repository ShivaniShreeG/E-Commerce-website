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

// OTP generator and store
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpStore = {}; // { email: { code, expires } }

// Stylish OTP email
const otpHtml = (otp) => `
  <div style="font-family:'Segoe UI',sans-serif; background:#f2f4f8; padding:40px;">
    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color:#007bff;">🔐 HoverSale Email Verification</h2>
      <p>Hello,</p>
      <p>Use the following OTP to verify your email:</p>
      <div style="font-size:32px; font-weight:bold; color:#007bff; text-align:center; margin:20px 0;">${otp}</div>
      <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
      <p style="margin-top:30px;">Thanks,<br><strong>HoverSale Team</strong> 🛒</p>
    </div>
  </div>
`;

// Stylish Reset Email
const resetHtml = (resetLink) => `
  <div style="font-family:'Segoe UI',sans-serif; background:#f2f4f8; padding:40px;">
    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color:#dc3545;">🔁 Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested to reset your password. Click the button below to continue:</p>
      <div style="text-align:center; margin:30px 0;">
        <a href="${resetLink}" style="background:#dc3545; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">Reset Password</a>
      </div>
      <p>This link expires in <strong>1 hour</strong>. If you didn’t request this, ignore this email.</p>
      <p style="margin-top:30px;">Regards,<br><strong>HoverSale Team</strong> 🛒</p>
    </div>
  </div>
`;

// ✅ Send OTP
router.post('/send-otp', (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) return res.status(400).json({ message: 'Phone and email are required' });

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const otp = generateOtp();
    otpStore[email] = { code: otp, expires: Date.now() + 5 * 60 * 1000 };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      html: otpHtml(otp),
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('❌ Email send error:', err);
        return res.status(500).json({ message: 'Failed to send OTP' });
      }
      console.log(`✅ OTP ${otp} sent to ${email}`);
      res.status(200).json({ success: true, message: 'OTP sent to your email' });
    });
  });
});

// ✅ Verify OTP & Register (auto-insert into profiles)
router.post('/verify-otp', async (req, res) => {
  const { name, email, phone, password, confirmPassword, address, otp } = req.body;

  if (!name || !email || !phone || !password || !confirmPassword || !address || !otp)
    return res.status(400).json({ message: 'All fields are required' });

  if (password !== confirmPassword)
    return res.status(400).json({ message: 'Passwords do not match' });

  const stored = otpStore[email];
  if (!stored || stored.code !== otp || stored.expires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, phone, password, address) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, email, phone, hashedPassword, address], (err, result) => {
      if (err) return res.status(500).json({ message: 'Registration failed' });

      const userId = result.insertId;
      const profileSql = 'INSERT INTO profiles (user_id, full_name, phone, address) VALUES (?, ?, ?, ?)';
      db.query(profileSql, [userId, name, phone, address], (profileErr) => {
        if (profileErr) {
          console.error('Profile insert failed:', profileErr);
          return res.status(500).json({ message: 'Profile insert failed' });
        }

        delete otpStore[email];
        res.status(200).json({ success: true, message: 'Registered successfully', userId });
      });
    });
  });
});

// ✅ Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'All fields required' });

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(401).json({ message: 'Email not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
    });
  });
});

// ✅ Forgot Password (with dynamic frontend URL)
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email || !email.endsWith('.com')) {
    return res.status(400).json({ message: 'Valid .com email is required' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    db.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [token, expiry, email],
      (err) => {
        if (err) return res.status(500).send('Database error');

        // ✅ Use dynamic frontend URL from request or fallback to env
        const origin = req.headers.origin ;
        const resetLink = `${origin}/reset-password/${token}`;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Reset Your HoverSale Password',
          html: resetHtml(resetLink),
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) return res.status(500).send('Error sending reset email');
          res.status(200).json('Reset link sent to your email');
        });
      }
    );
  });
});

// ✅ Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  db.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
    [token, Date.now()],
    async (err, result) => {
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
    }
  );
});

module.exports = router;
