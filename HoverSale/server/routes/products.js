const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust if your DB config is elsewhere

// Route: Get products by category name (case-insensitive)
router.get('/:category', (req, res) => {
  const categoryName = req.params.category;

  const sql = `
    SELECT p.*
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE LOWER(c.name) = LOWER(?)
  `;

  db.query(sql, [categoryName], (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(200).json([]); // send empty array if no products
    }

    res.status(200).json(results);
  });
});

module.exports = router;
