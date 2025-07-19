const express = require('express');
const db = require('../db');
const router = express.Router();

// ✅ Get all products
router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, result) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(result);
  });
});

// ✅ Add new product
router.post('/', (req, res) => {
  const { name, description, price, quantity, category_id, image_url } = req.body;

  if (!name || !price || !quantity || !category_id || !image_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO products (name, description, price, quantity, category_id, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, description, price, quantity, category_id, image_url], (err, result) => {
    if (err) {
      console.error('Error adding product:', err);
      return res.status(500).json({ error: 'Failed to add product' });
    }
    res.json({ message: 'Product added', id: result.insertId });
  });
});

// ✅ Update product
router.put('/:id', (req, res) => {
  const { name, description, price, quantity, category_id, image_url } = req.body;
  const productId = req.params.id;

  // Validate required fields
  if (!name || !price || !quantity || !category_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Build dynamic SQL fields
  const fields = ['name = ?', 'description = ?', 'price = ?', 'quantity = ?', 'category_id = ?'];
  const values = [name, description, price, quantity, category_id];

  // Optional image_url
  if (image_url) {
    fields.push('image_url = ?');
    values.push(image_url);
  }

  const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
  values.push(productId);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ error: 'Failed to update product' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated' });
  });
});

// ✅ Delete product
router.delete('/:id', (req, res) => {
  const productId = req.params.id;

  db.query('DELETE FROM products WHERE id = ?', [productId], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: 'Failed to delete product' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  });
});

module.exports = router;
