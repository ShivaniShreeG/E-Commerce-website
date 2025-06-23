// routes/address.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust the path to your db.js

// Save a new address
router.post('/', (req, res) => {
  const { userId, address } = req.body;
  if (!userId || !address) {
    return res.status(400).json({ error: 'Missing userId or address' });
  }

  const query = `INSERT INTO address (user_id, address) VALUES (?, ?)`;
  db.query(query, [userId, address], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save address' });
    res.json({ success: true });
  });
});

// Get all addresses for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `SELECT address FROM address WHERE user_id = ?`;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch addresses' });
    const addresses = results.map(row => row.address);
    res.json(addresses);
  });
});

module.exports = router;
