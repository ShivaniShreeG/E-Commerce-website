import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const RazorpayPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, orderId, name, email, phone } = location.state || {};
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    if (!amount || !orderId || !name) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Payment',
        text: 'Invalid payment session!',
      }).then(() => navigate('/orders'));
      return;
    }

    triggerRazorpay();
    // eslint-disable-next-line
  }, []);

  const triggerRazorpay = async () => {
    try {
      // Step 1: Fetch Razorpay Key
      const keyRes = await fetch('http://localhost:5000/api/pay/razorpay-key');
      const keyData = await keyRes.json();

      // Step 2: Create Razorpay Order
      const res = await fetch('http://localhost:5000/api/pay/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();

      // Step 3: Open Razorpay Checkout
      const options = {
        key: keyData.key, // ✅ fetched from backend
        amount: data.amount,
        currency: data.currency,
        name: 'HoverSale',
        description: `Order #${orderId}`,
        order_id: data.id,
        handler: async function (response) {
          // Step 4: Verify Payment Signature
          const verifyRes = await fetch('http://localhost:5000/api/pay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
              amount,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            Swal.fire({
              icon: 'success',
              title: 'Payment Verified',
              text: `Razorpay ID: ${response.razorpay_payment_id}`,
            });
            setPaymentConfirmed(true);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Verification Failed',
              text: verifyData.message || 'Payment verification failed!',
            }).then(() => navigate('/orders'));
          }
        },
        prefill: { name, email, contact: phone },
        theme: { color: '#3399cc' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Razorpay Error', text: 'Failed to initiate Razorpay payment.' });
    }
  };

  return (
    <div style={{ padding: '30px', textAlign: 'center' }}>
      {!paymentConfirmed ? (
        <p>Processing payment via Razorpay...</p>
      ) : (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#28a745' }}>✅ Payment Successful</h3>
          <p><strong>Paid to HoverSale</strong></p>
          <button onClick={() => navigate('/orders')} style={{
            marginTop: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            View Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default RazorpayPayment;
