import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCartPlus, FaHeart, FaShoppingBag, FaMinus, FaPlus } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import BASE_URL from '../api';

const ProductsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [navbarHeight, setNavbarHeight] = useState(0);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetch(`${BASE_URL}/api/products/${category}`)
      .then(res => res.json())
      .then(data => {
        const inStockProducts = data.filter(product => product.quantity > 0);
        const defaultQuantities = {};
        inStockProducts.forEach(p => defaultQuantities[p.id] = 1);
        setProducts(Array.isArray(inStockProducts) ? inStockProducts : []);
        setQuantities(defaultQuantities);
        setLoading(false);
      })
      .catch(err => {
        console.error("Product fetch error:", err);
        setLoading(false);
      });

    if (userId) {
      fetch(`${BASE_URL}/api/wishlist/${userId}`)
        .then(res => res.json())
        .then(data => {
          const wishlistSet = new Set(data.map(item => item.id));
          setWishlistItems(wishlistSet);
        })
        .catch(err => console.error("Wishlist fetch error:", err));

      fetch(`${BASE_URL}/api/cart/${userId}`)
        .then(res => res.json())
        .then(data => {
          const cartSet = new Set(data.map(item => item.product_id));
          setCartItems(cartSet);
        })
        .catch(err => console.error("Cart fetch error:", err));
    }
  }, [category, userId]);

  const promptLogin = () => {
    Swal.fire({
      title: 'Login Required',
      text: 'You need to be logged in to perform this action.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Login',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/login');
      }
    });
  };

  const handleQuantityChange = (id, delta, stock) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.min(Math.max((prev[id] || 1) + delta, 1), stock),
    }));
  };

  const handleAddToCart = (id) => {
    if (!userId) return promptLogin();

    const inCart = cartItems.has(id);
    const method = inCart ? 'DELETE' : 'POST';

    fetch(`${BASE_URL}/api/cart`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId: id, quantity: quantities[id] || 1 }),
    })
      .then(res => res.json())
      .then(() => {
        const updated = new Set(cartItems);
        inCart ? updated.delete(id) : updated.add(id);
        setCartItems(updated);
        Swal.fire({
          icon: 'success',
          title: inCart ? 'Removed from Cart' : 'Added to Cart',
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false,
        });
      })
      .catch(err => console.error("Cart update error:", err));
  };

  const handleAddToWishlist = (id) => {
    if (!userId) return promptLogin();

    const inWishlist = wishlistItems.has(id);
    const method = inWishlist ? 'DELETE' : 'POST';

    fetch(`${BASE_URL}/api/wishlist`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId: id }),
    })
      .then(res => res.json())
      .then(() => {
        const updated = new Set(wishlistItems);
        inWishlist ? updated.delete(id) : updated.add(id);
        setWishlistItems(updated);
        Swal.fire({
          icon: 'success',
          title: inWishlist ? 'Removed from Wishlist' : 'Added to Wishlist',
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false,
        });
      })
      .catch(err => console.error("Wishlist update error:", err));
  };

  const handleBuyNow = (product) => {
    if (!userId) return promptLogin();

    const quantity = quantities[product.id] || 1;
    Swal.fire({
      title: 'Proceed to Buy?',
      text: `You're about to buy ${quantity} item(s).`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Buy Now',
    }).then(result => {
      if (result.isConfirmed) {
        navigate(`/placeorder?productId=${product.id}&price=${product.price}&quantity=${quantity}`, {
          state: {
            productImage: product.image_url,
            productName: product.name,
          },
        });
      }
    });
  };

  if (loading) return <p className="p-5 text-center text-gray-700">Loading products...</p>;
  if (products.length === 0) return <p className="p-5 text-center text-gray-600">No products found in this category.</p>;

  return (
    <>
      <Navbar onHeightChange={setNavbarHeight} />
      <div style={{ paddingTop: `${navbarHeight}px` }} className="pb-10 bg-sky-100 min-h-screen">
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8 px-4">
          Products in "{category}"
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-xl shadow-md text-center transition-transform duration-300 transform hover:-translate-y-2 hover:shadow-xl"
            >
              <img
                src={`${product.image_url}`}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-3"
              />
              <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{product.description}</p>
              <p className="text-red-600 font-bold text-base mb-2">₹{product.price}</p>

              <div className="flex justify-center gap-5 mb-2">
                <button
                  title="Add to Cart"
                  onClick={() => handleAddToCart(product.id)}
                  className={`text-xl ${cartItems.has(product.id) ? 'text-green-500' : 'text-gray-700'} hover:scale-125 transition`}
                >
                  <FaCartPlus />
                </button>
                <button
                  title="Add to Wishlist"
                  onClick={() => handleAddToWishlist(product.id)}
                  className={`text-xl ${wishlistItems.has(product.id) ? 'text-red-500' : 'text-gray-400'} hover:scale-125 transition`}
                >
                  <FaHeart />
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 mb-2">
                <button
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => handleQuantityChange(product.id, -1, product.quantity)}
                  title="Decrease Quantity"
                >
                  <FaMinus />
                </button>
                <span>{quantities[product.id]}</span>
                <button
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => handleQuantityChange(product.id, 1, product.quantity)}
                  title="Increase Quantity"
                >
                  <FaPlus />
                </button>
              </div>

              {product.quantity > 0 ? (
                <button
                  onClick={() => handleBuyNow(product)}
                  className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
                >
                  <FaShoppingBag /> Buy Now
                </button>
              ) : (
                <p className="text-red-600 mt-2 font-medium">Out of Stock</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
