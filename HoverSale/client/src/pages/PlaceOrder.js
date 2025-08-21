import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import { FaMapMarkerAlt, FaPlus, FaRupeeSign, FaTruck, FaCreditCard } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import BASE_URL from '../api';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const userId = localStorage.getItem('userId');

  const productId = searchParams.get('productId');
  const price = parseFloat(searchParams.get('price')) || 0;
  const quantityFromUrl = parseInt(searchParams.get('quantity')) || 1;

  const fromCart = state?.fromCart || false;
  const fromWishlist = state?.fromWishlist || false;
  const fromReorder = state?.fromReorder || false;

  const cartItems = useMemo(() => state?.cartItems || [], [state]);
  const reorderItems = useMemo(() => state?.items || [], [state]);

  const [profile, setProfile] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [showNewAddressInput, setShowNewAddressInput] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!userId) return;
    fetch(`${BASE_URL}/api/profile/${userId}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setSelectedAddress(data.address || '');
      });

    fetch(`${BASE_URL}/api/user-addresses/${userId}`)
      .then(res => res.json())
      .then(addrs => setSavedAddresses(addrs || []));
  }, [userId]);

  useEffect(() => {
    let total = 0;
    if (fromCart && cartItems.length) {
      total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    } else if (fromReorder && reorderItems.length) {
      total = reorderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    } else if ((fromWishlist || productId) && price) {
      total = price * quantityFromUrl;
    }
    setTotalPrice(Number(total.toFixed(2)));
  }, [cartItems, reorderItems, productId, price, quantityFromUrl, fromCart, fromReorder, fromWishlist]);

  const gatherItems = () => {
    if (fromCart && cartItems.length) return cartItems;
    if (fromReorder && reorderItems.length) return reorderItems;
    if (fromWishlist && state?.cartItems?.length) return state.cartItems;
    if (productId) {
      return [{
        product_id: productId,
        productName: state?.productName || `Product ${productId}`,
        productImage: state?.productImage || '',
        price,
        quantity: quantityFromUrl,
      }];
    }
    return [];
  };
  const handleRazorpayPayment = async (orderId) => {
  try {
    // 1. Get Razorpay Key
    const { data: keyData } = await fetch(`${BASE_URL}/payments/razorpay-key`).then(res => res.json());

    // 2. Create Razorpay Order
    const { data: razorOrder } = await fetch(`${BASE_URL}/payments/razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: totalPrice }),
    }).then(res => res.json());

    // 3. Open Razorpay Checkout
    const options = {
      key: keyData.key,
      amount: razorOrder.amount,
      currency: "INR",
      name: "HoverSale",
      description: "Product Payment",
      order_id: razorOrder.id,
      handler: async function (response) {
        // Verify payment with backend
        const verifyRes = await fetch(`${BASE_URL}/payments/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId,
            amount: totalPrice,
          }),
        });

        const result = await verifyRes.json();

        if (result.success) {
          toast.success("Payment successful & order confirmed!");
          setTimeout(() => navigate('/orders'), 1500);
        } else {
          toast.error("Payment verification failed.");
        }
      },
      prefill: {
        name: profile.full_name,
        email: profile.email,
        contact: profile.phone,
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Razorpay error:", err);
    toast.error("Failed to initiate Razorpay");
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddress) return toast.error('Please select or enter an address');

    const confirm = await Swal.fire({
      title: 'Place Order?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    });

    if (!confirm.isConfirmed) return;

    const items = gatherItems().map(item => ({
  productId: item.product_id,
  quantity: item.quantity,
  price: item.price,
  productName: item.productName || item.product_name || '',
  productImage: item.productImage || item.product_image || ''
}));

    const orderData = {
      userId,
      name: profile.full_name,
      phone: profile.phone,
      email: profile.email,
      address: selectedAddress,
      paymentMethod,
      totalPrice,
      items
    };

    try {
      const res = await fetch(`${BASE_URL}/api/order/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Order placement failed');
        return;
      }

      if (showNewAddressInput && newAddress.trim()) {
        await fetch(`${BASE_URL}/api/user-addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, address: newAddress }),
        });
      }

      // ✅ Corrected value check
      if (paymentMethod === 'Online Payment (Razorpay)') {
        toast.success('Order placed! Redirecting to payment...');
        setTimeout(() => {
          navigate('/razorpay-payment', {
            state: {
              amount: totalPrice,
              orderId: result.orderId,
              name: profile.full_name,
              email: profile.email,
              phone: profile.phone,
            }
          });
        }, 1200);
        return;
      }

      if (fromCart) {
  const ids = gatherItems().map(i => i.product_id);
  await fetch(`${BASE_URL}/api/cart`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, productIds: ids }),
  });
}

if (fromWishlist && productId) {
  await fetch(`${BASE_URL}/api/wishlist`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, productId }),
  });
}


      toast.success('Order placed successfully!');
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order');
    }
  };

  const renderOrderItems = () => {
    const items = gatherItems();
    return items.map((item, idx) => (
      <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded shadow-sm">
        {item.productImage && (
          <img
            src={`${item.productImage}`}
            alt={item.productName}
            className="w-16 h-16 object-cover rounded"
          />
        )}
        <div className="text-sm">
          <p className="font-semibold">{item.productName}</p>
          <p>₹{item.price} × {item.quantity}</p>
          <p className="font-medium">Total: ₹{(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-sky-100 min-h-screen py-10 px-4">
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">🛒 Place Your Order</h2>
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div>
            <label className="font-semibold flex items-center gap-2 mb-2 text-lg">
              <FaMapMarkerAlt className="text-blue-500"/> Delivery Address
            </label>
            <div className="space-y-2">
              {profile.address && (
                <label className="flex gap-2 items-start text-sm">
                  <input
                    type="radio"
                    checked={selectedAddress === profile.address}
                    onChange={() => setSelectedAddress(profile.address)}
                  />
                  {profile.address}
                </label>
              )}
              {savedAddresses.map((addr, i) => (
                <label key={i} className="flex gap-2 items-start text-sm">
                  <input
                    type="radio"
                    checked={selectedAddress === addr}
                    onChange={() => setSelectedAddress(addr)}
                  />
                  {addr}
                </label>
              ))}
              <button
                type="button"
                className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                onClick={() => setShowNewAddressInput(prev => !prev)}
              >
                <FaPlus /> {showNewAddressInput ? 'Cancel' : 'Add New Address'}
              </button>
              {showNewAddressInput && (
                <textarea
                  className="w-full border p-2 rounded text-sm mt-2"
                  placeholder="Enter new address"
                  value={newAddress}
                  onChange={e => {
                    setNewAddress(e.target.value);
                    setSelectedAddress(e.target.value);
                  }}
                />
              )}
            </div>
          </div>

          <div>
            <label className="font-semibold flex items-center gap-2 mb-2 text-lg">
              <FaCreditCard className="text-blue-500"/> Payment Method
            </label>
            <select
              className="w-full border p-2 rounded text-sm"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Online Payment (Razorpay)">Online Payment (Razorpay)</option>
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-1/2 bg-gray-100 p-5 rounded-lg shadow-inner space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><FaTruck className="text-blue-600" /> Order Summary</h3>
          {renderOrderItems()}
          <p className="text-lg font-bold pt-3 border-t border-gray-300 flex items-center gap-2">
            <FaRupeeSign className="text-green-600" /> Grand Total: ₹{totalPrice.toFixed(2)}
          </p>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-green-700 font-semibold">
            ✅ Confirm Order
          </button>
          <button
    type="button"
    onClick={() => navigate(-1)}
    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-red-700 font-semibold"
  >
    ❌ Cancel
  </button>

        </div>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PlaceOrder;
