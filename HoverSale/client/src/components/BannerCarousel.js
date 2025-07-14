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
    return (
      <div className={`text-center mt-[${topOffset}px] text-lg text-gray-600`}>
        Loading banners...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center mt-[${topOffset}px] text-red-600`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`mt-[${topOffset}px]`}>
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        showIndicators={true}
        interval={3000}
        transitionTime={800}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full h-full flex justify-center items-center overflow-hidden bg-gray-100"
          >
            <img
              src={banner.image_data}
              alt={`Banner ${banner.id}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
