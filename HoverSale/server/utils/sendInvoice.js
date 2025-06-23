const nodemailer = require('nodemailer');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const generateInvoicePDF = require('./generateInvoice');

const sendInvoice = async (orderId, userId, status) => {
  try {
    const orderQuery = `
      SELECT o.id AS order_id, o.order_group_id, o.name, o.email, o.address, o.phone, o.payment_method, o.status,
             oi.product_id, oi.quantity, oi.price AS unit_price,
             p.name AS product_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.order_group_id = (
        SELECT order_group_id FROM orders WHERE id = ?
      ) AND o.user_id = ?
    `;

    const products = await new Promise((resolve, reject) => {
      db.query(orderQuery, [orderId, userId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!products || products.length === 0)
      return { success: false, error: "No order items found." };

    const { name, email, address, phone, payment_method } = products[0];

    // Calculate total and rows
    let grandTotal = 0;

    const productRows = products.map(p => {
      const total = p.unit_price * p.quantity;
      grandTotal += total;

      return `
        <tr>
          <td>${p.product_name}</td>
          <td align="center">${p.quantity}</td>
          <td align="right">₹${total.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const pdfPath = await generateInvoicePDF({
      orderId,
      name,
      email,
      address,
      phone,
      payment_method,
      status,
      products: products.map(p => ({
        name: p.product_name,
        quantity: p.quantity,
        total_price: p.unit_price * p.quantity
      })),
      grand_total: grandTotal
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"HoverSale" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Order [${orderId}] is ${status}`,
      html: `
        <div style="text-align:center;">
          <img src="cid:logo" alt="HoverSale Logo" style="max-width: 150px;" />
        </div>
        <h2>HoverSale Invoice</h2>
        <p><strong>Status:</strong> ${status}</p>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for shopping with <strong>HoverSale</strong>!</p>
        <table cellpadding="8" cellspacing="0" width="100%" style="border-collapse: collapse; font-size: 14px;">
          <tr style="background-color: #f8f8f8;">
            <th align="left">Product</th>
            <th align="center">Quantity</th>
            <th align="right">Price</th>
          </tr>
          ${productRows}
          <tr>
            <td colspan="2" align="right"><strong>Total:</strong></td>
            <td align="right"><strong>₹${grandTotal.toFixed(2)}</strong></td>
          </tr>
        </table>
        <p><strong>Payment Method:</strong> ${payment_method}</p>
        <p><strong>Address:</strong><br />${address}</p>
        <p>We've attached your invoice PDF with this email.</p>
        <p>— The HoverSale Team</p>
      `,
      attachments: [
        {
          filename: `Invoice-${orderId}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf'
        },
        {
          filename: 'logo.png',
          path: path.join(__dirname, '../assets/logo1.png'),
          cid: 'logo'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
};

module.exports = sendInvoice;
