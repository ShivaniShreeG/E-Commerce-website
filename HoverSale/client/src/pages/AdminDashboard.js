import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import BASE_URL from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    users: 0,
    products: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);

  useEffect(() => {
  fetch(`${BASE_URL}/api/admin/dashboard/low-stock-products`)
    .then(res => res.json())
    .then(data => {
      console.log('Low Stock Products:', data);
      data.forEach(product => {
  console.log('🖼️ Image URL:', `${BASE_URL}/${product.image_url}`);
});

      setLowStockProducts(data);
    })
    .catch(err => console.error('❌ Error fetching low stock products:', err));


    fetch(`${BASE_URL}/api/admin/dashboard/out-of-stock-products`)
      .then(res => res.json())
      .then(data => setOutOfStockProducts(data))
      .catch(err => console.error('❌ Error fetching out of stock products:', err));

    fetch(`${BASE_URL}/api/admin/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error fetching dashboard stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <h2 className="text-xl font-semibold text-gray-600">Loading dashboard...</h2>
      </AdminLayout>
    );
  }

  

  return (
    <AdminLayout>
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Welcome Admin</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.orders}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{stats.users}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-bold text-yellow-500 mt-2">{stats.products}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-red-500 mt-2">
            ₹{(stats.revenue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-10">
  <h3 className="text-xl font-semibold text-orange-600 mb-4">Low Stock Products (Qty &lt; 5)</h3>
  {lowStockProducts.length === 0 ? (
    <p className="text-gray-500">All products sufficiently stocked.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {lowStockProducts.map((product) => (
        <div key={product.id} className="bg-yellow-50 border border-yellow-300 p-4 rounded-xl shadow flex items-center gap-4">
          <img
  src={`${product.image_url}`}
  alt={product.name}
  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
/>



          <div>
            <h4 className="text-lg font-semibold text-gray-700">{product.name}</h4>
            <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>


      <div className="mt-10">
  <h3 className="text-xl font-semibold text-red-600 mb-4">Out of Stock Products</h3>
  {outOfStockProducts.length === 0 ? (
    <p className="text-gray-500">No products are out of stock.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {outOfStockProducts.map((product) => (
        <div key={product.id} className="bg-red-50 border border-red-300 p-4 rounded-xl shadow flex items-center gap-4">
          <img
  src={`${product.image_url}`}
  alt={product.name}
  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
/>



          <div>
            <h4 className="text-lg font-semibold text-gray-700">{product.name}</h4>
            <p className="text-sm text-red-600 font-medium">Out of Stock</p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

    </AdminLayout>
  );
};

export default AdminDashboard;
