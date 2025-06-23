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

  const headingStyle = {
    textAlign: 'center',
    marginTop: '40px',
    marginBottom: '10px',
    fontSize: '28px',
    color: '#333',
    fontWeight: '600',
  };

  const gridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '20px',
    gap: '25px',
  };

  const cardBaseStyle = {
    width: '220px',
    backgroundColor: 'white',
    borderRadius: '10px',
    textAlign: 'center',
    textDecoration: 'none',
    color: '#000',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <Navbar />
      <BannerCarousel />

      <h2 style={headingStyle}>Explore Categories</h2>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading categories...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'red' }}>{error}</p>
      ) : (
        <div style={gridStyle}>
          {categories.map((cat, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <Link
                key={cat.id}
                to={`/products/${cat.name}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  ...cardBaseStyle,
                  boxShadow: isHovered
                    ? '0 6px 18px rgba(0, 0, 0, 0.2)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <img
                  src={cat.image_url}
                  alt={`Category: ${cat.name}`}
                  style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                />
                <h3 style={{ padding: '10px 0' }}>{cat.name}</h3>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
