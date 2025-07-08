import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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
        const res = await fetch('http://localhost:5000/api/pay/upi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            amount,
            txnNote: `Order ${orderId}`
          })
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
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>UPI Payment</h2>
      <p>Scan this QR using your UPI app:</p>

      {!paymentConfirmed && (
  <div style={{ position: 'relative', width: '256px', margin: '0 auto' }}>
    {upiUrl && (
      <>
        <QRCode
          value={upiUrl}
          size={256}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
        />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '4px',
          borderRadius: '8px'
        }}>
          <img
            src="/logo1.png"
            alt="HoverSale"
            style={{
              width: '48px',
              height: '48px',
              objectFit: 'contain',
              borderRadius: '6px'
            }}
          />
        </div>
      </>
    )}
  </div>
)}

      <p><strong>Amount:</strong> ₹{amount}</p>
      <p><strong>Order ID:</strong> {orderId}</p>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Phone:</strong> {phone}</p>

      {!paymentConfirmed ? (
        <button onClick={handleConfirmPayment} style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          marginTop: '20px',
          cursor: 'pointer'
        }}>
          I Have Paid
        </button>
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

export default UPIPayment;
