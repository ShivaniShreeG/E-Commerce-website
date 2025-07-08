// PlaceOrder.js
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const productId = searchParams.get('productId');
  const price = parseFloat(searchParams.get('price'));
  const quantity = parseInt(searchParams.get('quantity')) || 1;
  const cartItems = useMemo(() => location.state?.cartItems || [], [location.state]);
  const userId = localStorage.getItem('userId');

  const [profile, setProfile] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [showNewAddressInput, setShowNewAddressInput] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [totalPrice, setTotalPrice] = useState(0);

  // ✅ Fetch profile and saved addresses
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/profile/${userId}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setSelectedAddress(data.address || '');
      })
      .catch(err => console.error('Failed to load profile', err));

    fetch(`http://localhost:5000/api/user-addresses/${userId}`)
      .then(res => res.json())
      .then(data => setSavedAddresses(data || []))
      .catch(err => console.error('Failed to fetch addresses', err));
  }, [userId]);

  // ✅ Calculate total
  useEffect(() => {
    if (cartItems.length > 0) {
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      setTotalPrice(Number(total.toFixed(2)));
    } else if (productId && price) {
      setTotalPrice(Number((price * quantity).toFixed(2)));
    }
  }, [cartItems, price, quantity, productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.error('Please select or enter an address');
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Place Order?',
      text: 'Do you want to confirm this order?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, confirm',
    });

    if (!confirmResult.isConfirmed) return;

    const orderData = {
      userId,
      name: profile.full_name,
      phone: profile.phone,
      email: profile.email,
      address: selectedAddress,
      paymentMethod,
      totalPrice,
      items: cartItems.length > 0
        ? cartItems.map(item => ({
            productId: item.product_id,
            quantity: item.quantity,
            price: item.price,
          }))
        : [{ productId, quantity, price }],
    };

    try {
      const res = await fetch('http://localhost:5000/api/order/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        toast.error(result.error || '❌ Order placement failed');
        return;
      }

      // ✅ Save new address if applicable
      if (showNewAddressInput && newAddress.trim()) {
        await fetch('http://localhost:5000/api/user-addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, address: newAddress }),
        });
      }

      if (paymentMethod === 'UPI' || paymentMethod === 'Credit Card') {
        toast.success(`✅ Order placed! Redirecting to ${paymentMethod}...`);
        setTimeout(() => {
          navigate('/razorpay-payment', {
            state: {
              amount: totalPrice,
              orderId: result.orderId,
              name: profile.full_name,
              email: profile.email,
              phone: profile.phone,
            },
          });
        }, 1500);
        return;
      }

      // ✅ Remove items from cart if placed
      if (cartItems.length > 0) {
        const productIds = cartItems.map(item => item.product_id);
        await fetch('http://localhost:5000/api/cart/remove-items', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productIds }),
        });
      }

      toast.success("✅ Order placed successfully!");
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      console.error('Order error:', err);
      toast.error('An error occurred while placing the order');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Place Your Order</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formSection}>
          <label><strong>Choose Delivery Address:</strong></label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {profile.address && (
              <label style={styles.checkboxLabel}>
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddress === profile.address}
                  onChange={() => setSelectedAddress(profile.address)}
                />
                Primary Address: {profile.address}
              </label>
            )}
            {savedAddresses.map((addr, idx) => (
              <label key={idx} style={styles.checkboxLabel}>
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddress === addr}
                  onChange={() => setSelectedAddress(addr)}
                />
                {addr}
              </label>
            ))}
            <button type="button" onClick={() => setShowNewAddressInput(!showNewAddressInput)} style={styles.addNewBtn}>
              {showNewAddressInput ? 'Cancel' : '+ Add New Address'}
            </button>
            {showNewAddressInput && (
              <textarea
                value={newAddress}
                onChange={e => {
                  setNewAddress(e.target.value);
                  setSelectedAddress(e.target.value);
                }}
                required
                placeholder="Enter new address"
                style={styles.textarea}
              />
            )}
          </div>

          <label><strong>Payment Method:</strong></label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={styles.select}>
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="UPI">UPI (via Razorpay)</option>
            <option value="Credit Card">Credit Card (via Razorpay)</option>
          </select>
        </div>

        <div style={styles.summarySection}>
          <h3>Order Summary</h3>
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <p key={index}>
                <strong>{item.name}</strong> - ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
              </p>
            ))
          ) : (
            <>
              <p><strong>Product ID:</strong> {productId}</p>
              <p><strong>Quantity:</strong> {quantity}</p>
              <p><strong>Price:</strong> ₹{price}</p>
            </>
          )}
          <p style={styles.total}><strong>Total:</strong> ₹{totalPrice}</p>
          <button type="submit" style={styles.button}>Confirm Order</button>
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

// ✅ Styles (unchanged)
const styles = {
  container: { padding: '40px 20px', backgroundColor: '#f9f3ec', minHeight: '100vh' },
  heading: { textAlign: 'center', marginBottom: '30px', color: '#333' },
  form: {
    maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px',
    justifyContent: 'space-between', backgroundColor: '#fff', padding: '30px',
    borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  formSection: { flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '15px' },
  textarea: { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minHeight: '80px' },
  select: { padding: '10px', borderRadius: '6px', border: '1px solid #ccc' },
  summarySection: {
    flex: '1 1 45%', padding: '20px', backgroundColor: '#f6f6f6', borderRadius: '10px',
    fontSize: '16px',
  },
  total: { fontSize: '18px', fontWeight: 'bold', marginTop: '20px' },
  button: {
    marginTop: '20px', padding: '12px 24px', backgroundColor: '#007bff', color: '#fff',
    fontWeight: 'bold', fontSize: '16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
  },
  addNewBtn: {
    backgroundColor: '#28a745', color: '#fff', padding: '10px', border: 'none',
    borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold',
  },
  checkboxLabel: {
    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px',
  },
};

export default PlaceOrder;
