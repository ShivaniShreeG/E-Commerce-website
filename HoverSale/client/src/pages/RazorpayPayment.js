import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import BASE_URL from '../api';

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
      const keyRes = await fetch(`${BASE_URL}/api/payment/razorpay-key`);
      const keyData = await keyRes.json();

      const res = await fetch(`${BASE_URL}/api/payment/razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();

      const options = {
        key: keyData.key,
        amount: data.amount,
        currency: data.currency,
        name: 'HoverSale',
        description: `Order #${orderId}`,
        order_id: data.id,
        handler: async function (response) {
          const verifyRes = await fetch(`${BASE_URL}/api/payment/verify-payment`, {
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
            setPaymentConfirmed(true);
            setTimeout(() => {
              navigate('/orders');
            }, 3000);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Verification Failed',
              text: verifyData.message || 'Payment verification failed!',
            }).then(() => navigate('/orders'));
          }
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: '#0ea5e9', // Tailwind blue-500
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Razorpay Error',
        text: 'Failed to initiate Razorpay payment.',
      }).then(() => navigate('/orders'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      {!paymentConfirmed ? (
        <div className="text-center">
          <p className="text-xl font-semibold text-blue-600 animate-pulse">
            💳 Processing your payment via Razorpay...
          </p>
          <p className="text-sm text-gray-500 mt-2">Please do not refresh or close this tab.</p>
        </div>
      ) : (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg text-center max-w-sm w-full">
          <h2 className="text-green-600 text-3xl font-bold mb-2">✅ Payment Successful</h2>
          <p className="text-gray-800 font-medium">Your order has been placed!</p>
          <p className="text-gray-500 text-sm mt-2">Redirecting to your orders page...</p>
        </div>
      )}
    </div>
  );
};

export default RazorpayPayment;
