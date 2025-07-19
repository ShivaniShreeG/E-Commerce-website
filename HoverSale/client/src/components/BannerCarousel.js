import React, { useEffect, useState } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import BASE_URL from '../api';

const BannerCarousel = ({ topOffset = 70 }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/banners`)
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
      <div
        style={{ marginTop: `${topOffset}px` }}
        className="text-center text-lg text-gray-600"
      >
        Loading banners...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ marginTop: `${topOffset}px` }}
        className="text-center text-red-600"
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{ marginTop: `${topOffset}px` }}
      className="w-full max-w-screen-xl mx-auto"
    >
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        showIndicators={true}
        interval={3000}
        transitionTime={800}
        swipeable
        emulateTouch
        dynamicHeight={false}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full aspect-[3/1] sm:aspect-[16/5] md:aspect-[16/6] lg:aspect-[16/5] bg-gray-100 overflow-hidden"
          >
            <img
              src={banner.image_url}
              alt={`Banner ${banner.id}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
