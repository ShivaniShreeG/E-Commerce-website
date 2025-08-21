const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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
const adminAuthRoutes = require('./routes/adminAuth');
const adminCategoriesRoutes = require('./routes/adminCategories');
const adminProductRoutes = require('./routes/adminProducts'); // ✅ add if not already
const adminDashboardRoutes = require('./routes/adminDashboard');
const adminOrdersRoutes = require('./routes/adminOrders');
const uploadRoutes = require('./routes/upload');
const logoRoute = require('./routes/logo');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // or restrict to your frontend domain
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// ✅ All Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', payRoutes);
app.use('/api/user-addresses', addressRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/categories', adminCategoriesRoutes);
app.use('/api/admin/products', adminProductRoutes); // ✅
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/logos', logoRoute);

app.get('/', (req, res) => {
  res.send('✅ Backend API Running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
