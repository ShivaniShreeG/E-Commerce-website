import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BannerCarousel from '../components/BannerCarousel';
import BASE_URL from '../api';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/categories`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch categories', err);
        setError('Failed to load categories.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-sky-100 min-h-screen">
      <Navbar />
      <BannerCarousel />

      <h2 className="text-center mt-10 mb-6 text-3xl text-gray-800 font-bold tracking-wide">
        Explore Categories
      </h2>

      {loading ? (
        <p className="text-center text-lg mt-6 text-gray-600">Loading categories...</p>
      ) : error ? (
        <p className="text-center mt-6 text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6 pb-12">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products/${cat.name}`}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-full h-44 bg-gray-100 overflow-hidden">
                <img
   src={cat.image_url}
  alt={cat.name}
  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
/>

              </div>
              <div className="p-5 text-center">
                <h3 className="text-lg font-semibold text-gray-800">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
