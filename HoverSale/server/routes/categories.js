const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/categories
router.get('/', (req, res) => {
  const query = 'SELECT * FROM categories';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    // URLs already full, no need to modify
    res.json(results);
  });
});

module.exports = router;
