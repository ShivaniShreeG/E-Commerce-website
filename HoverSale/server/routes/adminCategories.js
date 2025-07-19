const express = require('express');
const db = require('../db');
const router = express.Router();

// ✅ GET all categories
router.get('/', (req, res) => {
  db.query('SELECT * FROM categories ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// ✅ POST: Add category (expects image to be uploaded first via /api/upload/categories)
router.post('/', (req, res) => {
  const { name, image_url } = req.body;

  if (!name || !image_url) {
    return res.status(400).json({ error: 'Name and image_url are required' });
  }

  const sql = 'INSERT INTO categories (name, image_url) VALUES (?, ?)';
  db.query(sql, [name, image_url], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database insert failed' });
    res.json({ message: 'Category added', id: result.insertId });
  });
});

// ✅ PUT: Update category
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, image_url } = req.body;

  if (!name && !image_url) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  const sql = image_url
    ? 'UPDATE categories SET name = ?, image_url = ? WHERE id = ?'
    : 'UPDATE categories SET name = ? WHERE id = ?';

  const params = image_url ? [name, image_url, id] : [name, id];

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: 'Category updated' });
  });
});

// ✅ DELETE category
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM categories WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ message: 'Category deleted' });
  });
});

module.exports = router;
