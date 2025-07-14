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
      const keyRes = await fetch('http://localhost:5000/api/pay/razorpay-key');
      const keyData = await keyRes.json();

      const res = await fetch('http://localhost:5000/api/pay/razorpay-order', {
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
    <div className="py-10 px-4 text-center min-h-screen bg-gray-50">
      {!paymentConfirmed ? (
        <p className="text-lg font-medium text-gray-600">Processing payment via Razorpay...</p>
      ) : (
        <div className="mt-10">
          <h3 className="text-green-600 text-2xl font-semibold">✅ Payment Successful</h3>
          <p className="text-gray-700 mt-2"><strong>Paid to HoverSale</strong></p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-md transition duration-300"
          >
            View Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default RazorpayPayment;
