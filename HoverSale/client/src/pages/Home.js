import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BannerCarousel from '../components/BannerCarousel';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
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
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <BannerCarousel />

      <h2 className="text-center mt-10 mb-4 text-3xl text-gray-800 font-semibold">
        Explore Categories
      </h2>

      {loading ? (
        <p className="text-center mt-6">Loading categories...</p>
      ) : error ? (
        <p className="text-center mt-6 text-red-500">{error}</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 p-6">
          {categories.map((cat, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <Link
                key={cat.id}
                to={`/products/${cat.name}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`w-[220px] rounded-lg bg-white text-center overflow-hidden shadow-md transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer`}
              >
                <img
                  src={cat.image_url}
                  alt={`Category: ${cat.name}`}
                  className="w-full h-36 object-cover"
                />
                <h3 className="py-3 text-lg font-medium text-gray-700">{cat.name}</h3>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
