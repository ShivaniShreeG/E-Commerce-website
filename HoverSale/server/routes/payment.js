const express = require('express');
const router = express.Router();
const db = require('../db');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
router.post('/razorpay-order', async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100), // ₹ to paise
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`,
    });

    res.json(order); // will return order.id, currency, amount
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// ✅ Verify Razorpay Signature and update DB
// backend/routes/payment.js
router.post('/verify-payment', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
    amount,
  } = req.body;

  const crypto = require('crypto');

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    try {
      // Update the orders table as paid
      await db.query(
        'UPDATE orders SET payment_status = ?, razorpay_payment_id = ? WHERE id = ?',
        ['Paid', razorpay_payment_id, orderId]
      );

      return res.json({ success: true, message: 'Payment verified and order updated.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database update failed.' });
    }
  } else {
    return res.status(400).json({ success: false, message: 'Invalid signature, verification failed.' });
  }
});


// ✅ Send Razorpay Key to Frontend
router.get('/razorpay-key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
