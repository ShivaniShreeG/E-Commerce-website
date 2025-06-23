import React, { useEffect, useState } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

const BannerCarousel = ({ topOffset = 70 }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/banners')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch banners');
        return res.json();
      })
      .then(data => {
        console.log('Banners received:', data);
        setBanners(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching banners:', err);
        setError('Unable to load banners');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: topOffset }}>Loading banners...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: topOffset, color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ marginTop: `${topOffset}px` }}>
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        showIndicators={true}
        interval={3000}
        transitionTime={800}
      >
        {banners.map(banner => (
          <div
            key={banner.id}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f4f4f4',
            }}
          >
            <img
              src={banner.image_data} // 👈 use base64 image data
              alt={`Banner ${banner.id}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
