const express = require('express');
const multer = require('multer');
const db = require('../db');
const { getStorage } = require('../utils/cloudinary');

const router = express.Router();

// ✅ Upload logo to Cloudinary "logos" folder
router.post('/upload', (req, res) => {
  const storage = getStorage('logos'); // <-- CHANGED from 'logo' to 'logos'
  const upload = multer({ storage }).single('file');

  upload(req, res, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const image_url = req.file.path;
    const sql = `INSERT INTO logos (image_url) VALUES (?)`;

    db.query(sql, [image_url], (error, result) => {
      if (error) return res.status(500).json({ error });
      res.json({
        message: '✅ Logo uploaded successfully',
        id: result.insertId,
        image_url,
      });
    });
  });
});

// ✅ Get latest logo
// ✅ Get latest logo (wrapped as array to support .map on frontend)
router.get('/', (req, res) => {
  const sql = `SELECT * FROM logos ORDER BY created_at DESC LIMIT 1`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Wrap in array if exists, else send empty array
    res.json(results.length ? [results[0]] : []);
  });
});


// ✅ Delete logo by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM logos WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '🗑️ Logo deleted successfully' });
  });
});

module.exports = router;
