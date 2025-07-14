import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import BASE_URL from '../api';

const UPIPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, orderId, name, email, phone } = location.state || {};

  const [upiUrl, setUpiUrl] = useState('');
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

    const fetchUpi = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/pay/upi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            amount,
            txnNote: `Order ${orderId}`,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setUpiUrl(data.upiUrl);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'QR Error',
            text: data.error || 'Failed to generate QR',
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: 'Unable to generate QR code.',
        });
      }
    };

    fetchUpi();
  }, [amount, orderId, name, navigate]);

  const handleConfirmPayment = () => {
    Swal.fire({
      icon: 'success',
      title: 'Payment Confirmed',
      text: 'Your payment was successfully marked!',
    });
    setPaymentConfirmed(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-pink-400 to-orange-300 px-4 py-12">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">UPI Payment</h2>
        <p className="mb-6 text-gray-600">Scan this QR using your UPI app:</p>

        {!paymentConfirmed && upiUrl && (
          <div className="relative mx-auto w-64 mb-6">
            <QRCode
              value={upiUrl}
              size={256}
              className="rounded-lg"
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-md shadow-md">
              <img
                src="/logo1.png"
                alt="HoverSale"
                className="w-12 h-12 object-contain rounded"
              />
            </div>
          </div>
        )}

        <div className="text-left text-sm text-gray-700 space-y-1 mb-6">
          <p><strong>Amount:</strong> ₹{amount}</p>
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Phone:</strong> {phone}</p>
        </div>

        {!paymentConfirmed ? (
          <button
            onClick={handleConfirmPayment}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition duration-300"
          >
            I Have Paid
          </button>
        ) : (
          <div className="mt-4 text-center">
            <h3 className="text-green-600 text-xl font-bold">✅ Payment Successful</h3>
            <p className="text-gray-700 mt-1">Paid to HoverSale</p>
            <button
              onClick={() => navigate('/orders')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition duration-300"
            >
              View Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UPIPayment;
