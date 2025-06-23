const express = require('express');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const router = express.Router();
const db = require('../db'); // MySQL connection

// GET all banners with resized base64 image data
router.get('/', (req, res) => {
  const query = 'SELECT * FROM banners ';
  db.query(query, async (err, results) => {
    if (err) {
      console.error('Error fetching banners:', err);
      return res.status(500).json({ error: 'Failed to fetch banners' });
    }

    const bannerDir = path.join(__dirname, '..', 'images', 'banners');

    const bannersWithImages = await Promise.all(
      results.map(async (banner) => {
        try {
          const requestedFile = path.basename(banner.image_url);

          // Case-insensitive match for filename
          const files = fs.readdirSync(bannerDir);
          const matchedFile = files.find(file => file.toLowerCase() === requestedFile.toLowerCase());

          if (!matchedFile) throw new Error(`File not found: ${requestedFile}`);

          const ext = path.extname(matchedFile).replace('.', '').toLowerCase(); // e.g., png
          const imagePath = path.join(bannerDir, matchedFile);

          // Resize the image to 1200x350 using sharp
          const resizedBuffer = await sharp(imagePath)
            .resize(1200, 350, {
              fit: 'cover',      // crop and center
              position: 'center'
            })
            .toFormat(ext === 'jpg' ? 'jpeg' : ext) // ensure sharp understands format
            .toBuffer();

          const base64Image = `data:image/${ext};base64,${resizedBuffer.toString('base64')}`;

          return {
            id: banner.id,
            created_at: banner.created_at,
            image_data: base64Image
          };

        } catch (err) {
          console.error(`❌ Failed for banner ID ${banner.id}:`, err.message);
          return {
            id: banner.id,
            created_at: banner.created_at,
            image_data: null
          };
        }
      })
    );

    res.json(bannersWithImages);
  });
});

module.exports = router;
