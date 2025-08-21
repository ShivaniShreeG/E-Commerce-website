import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaHeart, FaTrash, FaShoppingCart, FaBolt } from 'react-icons/fa';
import BASE_URL from '../api';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/api/wishlist/${userId}`)
      .then(res => res.json())
      .then(data => setWishlist(data))
      .catch(err => console.error('Failed to fetch wishlist:', err));
  }, [userId]);
  useEffect(() => {
  // wishlist fetch is already here
  fetch(`${BASE_URL}/api/cart/${userId}`)
    .then(res => res.json())
    .then(data => setCartItems(data))
    .catch(err => console.error('Failed to fetch cart:', err));
}, [userId]);

  const isInCart = (productId) => {
  return cartItems.some(item => item.product_id === productId);
};
const handleRemoveFromCart = async (productId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/cart`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId }),
    });

    if (res.ok) {
      setCartItems(prev => prev.filter(item => item.product_id !== productId));
      Swal.fire('Removed!', 'Item removed from cart.', 'success');
    } else {
      Swal.fire('Error!', 'Failed to remove from cart.', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error!', 'Something went wrong.', 'error');
  }
};

  const handleRemove = async (productId) => {
    const confirm = await Swal.fire({
      title: 'Remove from wishlist?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`${BASE_URL}/api/wishlist`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId }),
        });

        if (res.ok) {
          setWishlist(prev => prev.filter(item => item.id !== productId));
          Swal.fire('Removed!', 'Item removed from wishlist.', 'success');
        } else {
          Swal.fire('Error!', 'Failed to remove item.', 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error!', 'Something went wrong.', 'error');
      }
    }
  };

  const handleAddToCart = async (item) => {
    try {
      const res = await fetch(`${BASE_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: item.id,
          quantity: 1
        })
      });

      if (res.ok) {
        Swal.fire('Added!', 'Item added to cart.', 'success');
      } else {
        Swal.fire('Error!', 'Failed to add item to cart.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error!', 'Something went wrong.', 'error');
    }
  };

  const handleBuyNow = (item) => {
    Swal.fire({
      title: `Buy "${item.name}" now?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Buy Now',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/placeorder?productId=${item.id}&price=${item.price}&quantity=1`, {
          state: {
            fromWishlist: true,
            cartItems: [{
              product_id: item.id,
              productName: item.name,
              productImage: item.image_url,
              price: item.price,
              quantity: 1
            }]
          }
        });
      }
    });
  };

  return (
    <div className="bg-sky-100 min-h-screen py-16 px-4">
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-8">
        <FaHeart className="inline mr-2 text-red-500" /> Your Wishlist
      </h2>

      {wishlist.length === 0 ? (
        <div className="text-center text-gray-600">
          <img
            src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
            alt="empty wishlist"
            className="w-40 mx-auto mb-4"
          />
          <p>Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md p-4 relative"
            >
              <img
                src={`${item.image_url}`}
                alt={item.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
              <p className="text-gray-700 mb-2">Price: ₹{item.price}</p>

              <div className="flex justify-between mt-4 items-center">
                {item.quantity === 0 ? (
                  <span className="text-red-600 font-bold">Out of Stock</span>
                ) : (
                  <>
                    {isInCart(item.id) ? (
  <button
    className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 flex items-center gap-1"
    onClick={() => handleRemoveFromCart(item.id)}
  >
    <FaShoppingCart /> Remove from Cart
  </button>
) : (
  <button
    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
    onClick={() => handleAddToCart(item)}
  >
    <FaShoppingCart /> Add to Cart
  </button>
)}

                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                      onClick={() => handleBuyNow(item)}
                    >
                      <FaBolt /> Buy Now
                    </button>
                  </>
                )}
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  onClick={() => handleRemove(item.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
