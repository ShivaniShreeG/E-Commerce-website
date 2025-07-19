const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getStorage = (folderName) => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderName, // e.g., 'profile', 'product', 'categories'
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
      resource_type: 'auto',
    },
  });
};

module.exports = { cloudinary, getStorage };
