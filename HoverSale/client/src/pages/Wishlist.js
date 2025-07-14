import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import BASE_URL from '../api';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/api/wishlist/${userId}`)
      .then(res => res.json())
      .then(data => setWishlist(data))
      .catch(err => {
        console.error("Error fetching wishlist:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load wishlist.',
        });
      });
  }, [userId]);

  const handleBuyNow = (productId, price) => {
    Swal.fire({
      title: 'Proceed to Buy?',
      text: 'Do you want to place an order for this item?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Buy Now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/placeorder?productId=${productId}&price=${price}&quantity=1`);
      }
    });
  };

  const handleRemove = (productId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This item will be removed from your wishlist.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${BASE_URL}/api/wishlist`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId }),
        })
          .then(res => res.json())
          .then(() => {
            setWishlist(prev => prev.filter(item => item.id !== productId));
            Swal.fire({
              icon: 'success',
              title: 'Removed',
              text: 'Item removed from wishlist.',
              timer: 1500,
              showConfirmButton: false,
            });
          })
          .catch(err => {
            console.error('Error removing wishlist item:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to remove item.',
            });
          });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-300 to-rose-200">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Your Wishlist</h2>

        {wishlist.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">Your wishlist is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {wishlist.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
                <img
                  src={`${BASE_URL}/${item.image_url}`}
                  alt={item.name}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                  className="w-full h-52 object-cover rounded-xl mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <p className="text-base font-bold text-gray-800 mb-4">₹{item.price}</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleBuyNow(item.id, item.price)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
