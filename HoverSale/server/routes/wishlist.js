const express = require('express');
const router = express.Router();
const db = require('../db');

// Get wishlist items for a user
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT p.* 
    FROM wishlist w 
    JOIN products p ON w.product_id = p.id 
    WHERE w.user_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching wishlist:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log("Wishlist results:", results);
    res.json(results);
  });
});

// Add item to wishlist
router.post('/', (req, res) => {
  const { userId, productId } = req.body;
  const sql = `INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)`;
  db.query(sql, [userId, productId], (err, result) => {
    if (err) {
      console.error('Error adding to wishlist:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Added to wishlist' });
  });
});

router.delete('/', (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: 'Missing userId or productId' });
  }

  const sql = 'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?';
  db.query(sql, [userId, productId], (err, result) => {
    if (err) {
      console.error('Error deleting from wishlist:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Removed from wishlist' });
  });
});

module.exports = router;
