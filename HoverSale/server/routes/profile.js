const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');

const router = express.Router();

// Profile image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '')),
});
const upload = multer({ storage });

// ✅ GET profile with joined data from users + profiles
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT 
      users.username,
      users.email,
      COALESCE(profiles.full_name, '') as full_name,
      COALESCE(profiles.dob, '') as dob,
      COALESCE(profiles.gender, '') as gender,
      COALESCE(profiles.phone, '') as phone,
      COALESCE(profiles.address, '') as address,
      COALESCE(profiles.profile_pic, '') as profile_pic
    FROM users
    LEFT JOIN profiles ON users.id = profiles.user_id
    WHERE users.id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'DB error', error: err.sqlMessage });
    }
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);  // Always return the full data (username, email, and any profile data)
  });
});


// ✅ Create or update profile
router.post('/edit', upload.single('profile_pic'), (req, res) => {
  const {
    user_id,
    full_name,
    dob,
    gender,
    phone,
    address
  } = req.body;

  const profile_pic = req.file ? req.file.filename : null;

  // ✅ Check if user exists
  db.query('SELECT * FROM users WHERE id = ?', [user_id], (err, userResults) => {
    if (err) {
      console.error('User lookup failed:', err);
      return res.status(500).json({ message: 'DB error during user check' });
    }

    if (userResults.length === 0) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // ✅ Check if profile exists
    db.query('SELECT * FROM profiles WHERE user_id = ?', [user_id], (err, profileResults) => {
      if (err) {
        console.error('Profile check error:', err);
        return res.status(500).json({ message: 'DB error during profile check' });
      }

      if (profileResults.length === 0) {
        // ✅ INSERT
        const insertSql = `
          INSERT INTO profiles 
          (user_id, full_name, dob, gender, phone, address, profile_pic)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const insertValues = [
          user_id,
          full_name || '',
          dob || null,
          gender || '',
          phone || '',
          address || '',
          profile_pic || null
        ];

        db.query(insertSql, insertValues, (err) => {
          if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ message: 'Insert failed', error: err.sqlMessage });
          }
          res.json({ message: 'Profile created successfully' });
        });

      } else {
        // ✅ UPDATE
        const updateSql = `
          UPDATE profiles SET 
          full_name = ?, dob = ?, gender = ?, phone = ?, address = ?
          ${profile_pic ? ', profile_pic = ?' : ''}
          WHERE user_id = ?
        `;
        const updateValues = profile_pic
          ? [full_name, dob, gender, phone, address, profile_pic, user_id]
          : [full_name, dob, gender, phone, address, user_id];

        db.query(updateSql, updateValues, (err) => {
          if (err) {
            console.error('Update error:', err);
            return res.status(500).json({ message: 'Update failed', error: err.sqlMessage });
          }
          res.json({ message: 'Profile updated successfully' });
        });
      }
    });
  });
});

module.exports = router;
