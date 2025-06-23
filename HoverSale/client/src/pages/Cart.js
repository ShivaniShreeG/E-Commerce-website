import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/cart/${userId}`)
      .then(res => res.json())
      .then(data => {
        setCartItems(data);
        const initialSelection = {};
        data.forEach(item => {
          if (item.stock > 0) initialSelection[item.product_id] = true;
        });
        setSelectedItems(initialSelection);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch cart error:", err);
        setLoading(false);
      });
  }, [userId]);

  const updateQuantity = (productId, delta, stock) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product_id === productId
          ? { ...item, quantity: Math.min(Math.max(item.quantity + delta, 1), stock) }
          : item
      )
    );
  };

  const toggleSelect = (productId, stock) => {
    if (stock <= 0) return;
    setSelectedItems(prev => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleRemove = async (productId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Remove this item from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, remove it!'
    });

    if (confirm.isConfirmed) {
      fetch(`http://localhost:5000/api/cart`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId })
      })
        .then(() => {
          setCartItems(prev => prev.filter(item => item.product_id !== productId));
          setSelectedItems(prev => {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
          });
          Swal.fire('Removed!', 'Item has been removed.', 'success');
        })
        .catch(err => {
          console.error("Remove error:", err);
          Swal.fire('Error!', 'Failed to remove item.', 'error');
        });
    }
  };

  const handleBuyNowSingle = async (item) => {
    const confirm = await Swal.fire({
      title: `Buy "${item.name}" now?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Buy Now',
      cancelButtonText: 'Cancel',
    });

    if (confirm.isConfirmed) {
      navigate('/placeorder', { state: { cartItems: [item], fromCart: true } });
    }
  };

  const handleOrderNow = async () => {
    const itemsToOrder = cartItems.filter(item => selectedItems[item.product_id]);
    if (itemsToOrder.length === 0) {
      Swal.fire('No Items Selected', 'Please select at least one item to place an order.', 'info');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Confirm Order',
      text: `Place order for ${itemsToOrder.length} item(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, place order',
      cancelButtonText: 'Cancel',
    });

    if (confirm.isConfirmed) {
      navigate('/placeorder', { state: { cartItems: itemsToOrder, fromCart: true } });
    }
  };

  const totalPrice = cartItems.reduce((acc, item) =>
    selectedItems[item.product_id] ? acc + item.price * item.quantity : acc, 0);

  if (loading) return <p style={{ padding: '60px', textAlign: 'center' }}>Loading cart...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🛒 Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div style={styles.empty}>
          <img src="https://cdn-icons-png.flaticon.com/512/11329/11329460.png" alt="empty" style={{ width: '180px' }} />
          <p>No items in your cart.</p>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {cartItems.map(item => (
              <div key={item.product_id} style={styles.card}>
                {item.stock < 20 && item.stock > 0 && (
                  <div style={styles.stockTag}>Only {item.stock} left!</div>
                )}
                <div style={styles.row}>
                  <input
                    type="checkbox"
                    checked={!!selectedItems[item.product_id]}
                    disabled={item.stock <= 0}
                    onChange={() => toggleSelect(item.product_id, item.stock)}
                  />
                  <img src={`http://localhost:5000/${item.image_url}`} alt={item.name} style={styles.image} />
                  <div style={styles.details}>
                    <h3>{item.name}</h3>
                    <p>Price: ₹{item.price}</p>
                    <div style={styles.quantity}>
                      <button onClick={() => updateQuantity(item.product_id, -1, item.stock)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, 1, item.stock)}>+</button>
                    </div>
                    {item.stock === 0 && <p style={styles.outOfStock}>Out of stock</p>}
                    <p style={{ margin: '8px 0' }}>Subtotal: ₹{item.price * item.quantity}</p>
                    <div>
                      <button style={styles.buyNow} onClick={() => handleBuyNowSingle(item)}>Buy Now</button>
                      <button style={styles.remove} onClick={() => handleRemove(item.product_id)}>Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.totalSection}>
            <h3>Total Amount: ₹{totalPrice}</h3>
            <button onClick={handleOrderNow} style={styles.placeOrder}>Place Order</button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: '#fff8f0',
    padding: '80px 20px 40px',
    minHeight: '100vh',
  },
  heading: {
    textAlign: 'center',
    color: '#222',
    marginBottom: '30px',
  },
  empty: {
    textAlign: 'center',
    marginTop: '50px',
    color: '#777',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
  },
  card: {
    position: 'relative',
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  stockTag: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#ffc107',
    color: '#000',
    fontSize: '0.8rem',
    padding: '4px 8px',
    borderRadius: '5px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  image: {
    width: '100px',
    height: '100px',
    borderRadius: '10px',
    objectFit: 'cover',
    margin: '0 15px',
  },
  details: {
    flex: 1,
  },
  quantity: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
  },
  outOfStock: {
    color: '#dc3545',
    fontWeight: 'bold',
    marginTop: '8px',
  },
  buyNow: {
    marginTop: '10px',
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  remove: {
    marginTop: '10px',
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  totalSection: {
    maxWidth: '800px',
    margin: '40px auto 0',
    backgroundColor: '#fff',
    padding: '20px 30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'right',
  },
  placeOrder: {
    marginTop: '10px',
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default Cart;
