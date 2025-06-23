import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCartPlus, FaHeart } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';

const ProductsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${category}`)
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
      fetch(`http://localhost:5000/api/wishlist/${userId}`)
        .then(res => res.json())
        .then(data => {
          const wishlistSet = new Set(data.map(item => item.id));
          setWishlistItems(wishlistSet);
        })
        .catch(err => console.error("Wishlist fetch error:", err));

      fetch(`http://localhost:5000/api/cart/${userId}`)
        .then(res => res.json())
        .then(data => {
          const cartSet = new Set(data.map(item => item.product_id));
          setCartItems(cartSet);
        })
        .catch(err => console.error("Cart fetch error:", err));
    }
  }, [category, userId]);

  const promptLogin = (callback) => {
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
    if (!userId) return promptLogin(() => handleAddToCart(id));

    const inCart = cartItems.has(id);
    const method = inCart ? 'DELETE' : 'POST';

    fetch(`http://localhost:5000/api/cart`, {
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
    if (!userId) return promptLogin(() => handleAddToWishlist(id));

    const inWishlist = wishlistItems.has(id);
    const method = inWishlist ? 'DELETE' : 'POST';

    fetch(`http://localhost:5000/api/wishlist`, {
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

  const handleBuyNow = (id, price) => {
    if (!userId) return promptLogin(() => handleBuyNow(id, price));

    const quantity = quantities[id] || 1;
    Swal.fire({
      title: 'Proceed to Buy?',
      text: `You're about to buy ${quantity} item(s).`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Buy Now',
    }).then(result => {
      if (result.isConfirmed) {
        navigate(`/placeorder?productId=${id}&price=${price}&quantity=${quantity}`);
      }
    });
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading products...</p>;
  if (products.length === 0) return <p style={{ padding: '20px' }}>No products found in this category.</p>;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>Products in "{category}"</h2>
        <div style={styles.grid}>
          {products.map(product => (
            <div key={product.id} style={styles.card} className="product-card">
              <img
                src={`http://localhost:5000/${product.image_url}`}
                alt={product.name}
                style={styles.image}
              />
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.description}>{product.description}</p>
              <p style={styles.price}>Price: ₹{product.price}</p>

              <div style={styles.iconRow}>
                <FaCartPlus
                  style={styles.icon}
                  onClick={() => handleAddToCart(product.id)}
                  color={cartItems.has(product.id) ? 'green' : 'black'}
                  title="Add to Cart"
                />
                <FaHeart
                  style={styles.icon}
                  onClick={() => handleAddToWishlist(product.id)}
                  color={wishlistItems.has(product.id) ? 'red' : 'gray'}
                  title="Add to Wishlist"
                />
              </div>

              <div style={styles.quantity}>
                <button onClick={() => handleQuantityChange(product.id, -1, product.quantity)}>-</button>
                <span>{quantities[product.id]}</span>
                <button onClick={() => handleQuantityChange(product.id, 1, product.quantity)}>+</button>
              </div>

              {product.quantity > 0 ? (
                <button style={styles.buyBtn} onClick={() => handleBuyNow(product.id, product.price)}>
                  Buy Now
                </button>
              ) : (
                <div style={{ color: 'red', marginTop: '10px' }}>Out of Stock</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .product-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </>
  );
};

// (same `styles` object from previous code)


const styles = {
  container: {
    paddingTop: '70px',
    paddingBottom: '40px',
    background: 'linear-gradient(to right, #ff758c, #ffb88c)',
    minHeight: '100vh',
  },
  title: {
    textAlign: 'center',
    fontSize: '1.8rem',
    marginBottom: '30px',
    color: '#222',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '25px',
    padding: '0 20px',
  },
  card: {
    backgroundColor: '#fff',
    width: '250px',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  productName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  description: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '6px',
  },
  price: {
    color: 'crimson',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginBottom: '10px',
  },
  iconRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '10px',
  },
  icon: {
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  quantity: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  buyBtn: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '8px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 'bold',
  },
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  promptBox: {
    background: '#fff',
    padding: '30px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  loginBtn: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '10px 20px',
    marginRight: '10px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: '#dc3545',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default ProductsPage;
