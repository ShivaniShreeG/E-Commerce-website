const express = require('express');
const multer = require('multer');
const { getStorage } = require('../utils/cloudinary');
const router = express.Router();

// Dynamic route: pass folder name in URL
router.post('/:folder', (req, res, next) => {
  const folder = req.params.folder;

  const storage = getStorage(folder);
  const upload = multer({ storage }).single('file');

  upload(req, res, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const { path, filename, mimetype } = req.file;

    res.json({
      message: 'Uploaded successfully',
      url: path,
      filename,
      type: mimetype,
    });
  });
});

module.exports = router;
