const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config(); // Load .env variables early

const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');
const cartRoutes = require('./routes/cart');
const payRoutes = require('./routes/payment');
const addressRoutes = require('./routes/address');
const bannerRoutes = require('./routes/banners');



const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productRoutes);~
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/pay', payRoutes);
app.use('/api/user-addresses', addressRoutes);  // this matches your fetch path
app.use('/api/banners', bannerRoutes);

// ✅ Health check root route
app.get('/', (req, res) => {
  res.send('✅ Backend API Running');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
