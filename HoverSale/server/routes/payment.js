const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
require('dotenv').config();

const OWNER_UPI_ID = process.env.OWNER_UPI_ID || 'defaultupi@bank'; // fallback
const payeeNam = "HoverSale";
const txnNot = "Payment for HoverSale order";

// Utility to construct UPI URL
function generateUpiUrl({ upiId, payeeName, amount, txnNote }) {
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeNam)}&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNot)}`;
}

// Route to get UPI QR Code
router.post('/upi', async (req, res) => {
  const { name, amount, txnNote } = req.body;

  if (!name || !amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Missing or invalid payment details.' });
  }

  try {
    const upiUrl = generateUpiUrl({
      upiId: OWNER_UPI_ID,
      name,
      amount,
      txnNote: txnNote || 'HoverSale Order Payment'
    });

    const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
      width: 300,
      margin: 1
    });

    res.json({ qrCode: qrCodeDataUrl, upiUrl });
  } catch (err) {
    console.error('QR Code Generation Error:', err);
    res.status(500).json({ error: 'Failed to generate QR code.' });
  }
});

module.exports = router;
