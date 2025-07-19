import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import BASE_URL from '../api';
import { useNavigate } from 'react-router-dom';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: 1,
    category_id: '',
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const previewUrlRef = useRef(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      navigate('/admin-login');
    } else {
      fetchProducts();
      fetchCategories();
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [preview]);

  const fetchProducts = async () => {
    try {
      setError(null);
      const res = await fetch(`${BASE_URL}/api/admin/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      setError(null);
      const res = await fetch(`${BASE_URL}/api/admin/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPreview(url);
      setForm({ ...form, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.price <= 0 || form.quantity <= 0) {
      alert('Price and quantity must be positive numbers');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (form.image) {
        const imageData = new FormData();
        imageData.append('file', form.image);

        const uploadRes = await fetch(`${BASE_URL}/api/upload/products`, {
          method: 'POST',
          body: imageData,
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error('Image upload failed: ' + errText);
        }

        const uploadResult = await uploadRes.json();
        imageUrl = uploadResult.url;
      }

      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        category_id: form.category_id,
        image_url: imageUrl || undefined, // Use existing image URL if not changed
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${BASE_URL}/api/admin/products/${editingId}`
        : `${BASE_URL}/api/admin/products`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to save product');
      }

      setForm({
        name: '',
        description: '',
        price: '',
        quantity: 1,
        category_id: '',
        image: null,
      });
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPreview(null);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category_id: product.category_id,
      image: null,
    });
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    setPreview(product.image_url);
    previewUrlRef.current = null;
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center sm:text-left">
          Manage Products
        </h1>

        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

        {/* Product Form */}
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700">Name</span>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2 rounded w-full"
                required
                disabled={loading}
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Price</span>
              <input
                type="number"
                placeholder="Price"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="border p-2 rounded w-full"
                required
                disabled={loading}
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Quantity</span>
              <input
                type="number"
                placeholder="Quantity"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="border p-2 rounded w-full"
                required
                disabled={loading}
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Category</span>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="border p-2 rounded w-full"
                required
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-gray-700">Description</span>
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="3"
              className="w-full border p-2 rounded"
              disabled={loading}
            ></textarea>
          </label>

          <label className="block">
            <span className="text-gray-700">Image</span>
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
          </label>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="h-32 object-contain mt-2 mx-auto sm:mx-0"
            />
          )}

          <button
            type="submit"
            className="block w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
          </button>
        </form>

        {/* Product List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded shadow p-4 flex flex-col">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-40 w-full object-cover rounded"
              />
              <h3 className="font-bold mt-2">{product.name}</h3>
              <p className="text-sm text-gray-600 flex-1">{product.description}</p>
              <p className="text-green-700 font-bold mt-1">₹{product.price}</p>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => handleEdit(product)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(product.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
