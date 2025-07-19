const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db'); // your MySQL connection
require('dotenv').config();

// Admin Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const query = 'SELECT * FROM admin WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // On success, send admin ID and name
    res.json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email,
        isAdmin: true
      }
    });
  });
});
router.get('/users', (req, res) => {
  const userQuery = `
    SELECT 
      u.id AS user_id,
      u.email,
      p.full_name,
      p.dob,
      p.gender,
      p.phone,
      p.address AS profile_address,
      p.profile_pic,
      p.created_at,
      GROUP_CONCAT(a.address SEPARATOR '; ') AS all_addresses
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    LEFT JOIN address a ON u.id = a.user_id
    GROUP BY u.id
  `;

  db.query(userQuery, (err, results) => {
    if (err) {
      console.error('Error fetching users for admin:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    res.json({ users: results });
  });
});


module.exports = router;
