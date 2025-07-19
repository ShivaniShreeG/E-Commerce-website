import React, { useEffect, useState } from 'react';
import BASE_URL from '../api';
import AdminLayout from '../components/AdminLayout';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!name || !image) return alert('Name and image required');

    const formData = new FormData();
    formData.append('file', image);

    try {
      const uploadRes = await fetch(`${BASE_URL}/api/upload/categories`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.url) return alert('Image upload failed');

      const body = {
        name,
        image_url: uploadData.url,
      };

      const endpoint = editId
        ? `${BASE_URL}/api/admin/categories/${editId}`
        : `${BASE_URL}/api/admin/categories`;

      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) return alert(data.error);

      setName('');
      setImage(null);
      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await fetch(`${BASE_URL}/api/admin/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setName(cat.name);
  };

  const cancelEdit = () => {
    setEditId(null);
    setName('');
    setImage(null);
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Categories</h2>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="border border-gray-300 px-4 py-2 rounded-md w-full sm:w-60"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="border border-gray-300 px-4 py-2 rounded-md w-full sm:w-64 bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {editId ? 'Update' : 'Upload'}
            </button>
            {editId && (
              <button
                onClick={cancelEdit}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-lg shadow-md border overflow-hidden flex flex-col"
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{cat.name}</h3>
                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-md w-full"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md w-full"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
