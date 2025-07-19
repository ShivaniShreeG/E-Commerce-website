import React, { useEffect, useState } from 'react';
import BASE_URL from '../api';
import AdminLayout from '../components/AdminLayout';

const AdminAssetsPage = () => {
  const [banners, setBanners] = useState([]);
  const [logos, setLogos] = useState([]);
  const [selectedType, setSelectedType] = useState('banner');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editId, setEditId] = useState(null);

  const fetchAssets = async () => {
    try {
      const [bannerRes, logoRes] = await Promise.all([
        fetch(`${BASE_URL}/api/banners`),
        fetch(`${BASE_URL}/api/logos`)
      ]);
      const bannerData = await bannerRes.json();
      const logoData = await logoRes.json();
      setBanners(bannerData);
      setLogos(logoData);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file");
    const formData = new FormData();
    formData.append('file', selectedFile);

    const endpoint = selectedType === 'banner' ? 'banners' : 'logos';
    const url = editId
      ? `${BASE_URL}/api/${endpoint}/${editId}`
      : `${BASE_URL}/api/${endpoint}/upload`;

    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (data.error) return alert(data.error);
      setSelectedFile(null);
      setEditId(null);
      fetchAssets();
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Delete this item?")) return;
    const endpoint = type === 'banner' ? 'banners' : 'logos';
    await fetch(`${BASE_URL}/api/${endpoint}/${id}`, {
      method: 'DELETE'
    });
    fetchAssets();
  };

  const startEdit = (id) => {
    setEditId(id);
  };

  const cancelEdit = () => {
    setEditId(null);
    setSelectedFile(null);
  };

  const assetsToDisplay = selectedType === 'banner' ? banners : logos;

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
          Manage {selectedType === 'banner' ? 'Banners' : 'Logos'}
        </h2>

        {/* Type Toggle */}
        <div className="mb-4 flex gap-3 flex-wrap">
          <button
            onClick={() => {
              setSelectedType('banner');
              cancelEdit();
            }}
            className={`px-4 py-2 rounded text-sm ${
              selectedType === 'banner' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Banners
          </button>
          <button
            onClick={() => {
              setSelectedType('logo');
              cancelEdit();
            }}
            className={`px-4 py-2 rounded text-sm ${
              selectedType === 'logo' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Logos
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="file"
            onChange={handleFileChange}
            className="border rounded px-3 py-2 w-full sm:w-64"
          />
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              {editId ? 'Update' : 'Upload'}
            </button>
            {editId && (
              <button
                onClick={cancelEdit}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Grid Display */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {assetsToDisplay.map((item) => (
            <div
              key={item.id}
              className="bg-white border rounded-lg shadow-sm overflow-hidden"
            >
              <img
                src={item.image_url}
                alt=""
                className="w-full h-32 sm:h-40 object-contain bg-gray-100"
              />
              <div className="p-3 flex flex-col sm:flex-row justify-center items-center sm:gap-4 gap-2">
  <button
    onClick={() => startEdit(item.id)}
    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 text-sm w-24"
  >
    Edit
  </button>
  <button
    onClick={() => handleDelete(selectedType, item.id)}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm w-24"
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

export default AdminAssetsPage;
