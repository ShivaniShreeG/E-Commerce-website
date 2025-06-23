const express = require('express');
const router = express.Router();
const db = require('../db');

// Get cart items for a user (only in-stock)
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT c.*, p.name, p.price, p.image_url, p.quantity as stock 
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ? AND p.quantity > 0
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Add or update cart item
router.post('/', (req, res) => {
  const { userId, productId, quantity } = req.body;
  const checkQuery = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?';
  db.query(checkQuery, [userId, productId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) {
      const updateQuery = 'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?';
      db.query(updateQuery, [quantity, userId, productId], (err) => {
        if (err) return res.status(500).json({ error: 'Update error' });
        res.json({ message: 'Cart updated' });
      });
    } else {
      const insertQuery = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
      db.query(insertQuery, [userId, productId, quantity], (err) => {
        if (err) return res.status(500).json({ error: 'Insert error' });
        res.json({ message: 'Item added to cart' });
      });
    }
  });
});

// Remove cart item
router.delete('/', (req, res) => {
  const { userId, productId } = req.body;
  const deleteQuery = 'DELETE FROM cart WHERE user_id = ? AND product_id = ?';
  db.query(deleteQuery, [userId, productId], (err) => {
    if (err) return res.status(500).json({ error: 'Delete error' });
    res.json({ message: 'Item removed from cart' });
  });
});

// Update quantity
router.put('/update', (req, res) => {
  const { userId, productId, quantity } = req.body;
  const updateQuery = 'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?';
  db.query(updateQuery, [quantity, userId, productId], (err) => {
    if (err) return res.status(500).json({ error: 'Update error' });
    res.json({ message: 'Quantity updated successfully' });
  });
});


module.exports = router;
