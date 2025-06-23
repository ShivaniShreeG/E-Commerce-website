const express = require('express');
const router = express.Router();
const db = require('../db');
const sendInvoice = require('../utils/sendInvoice');
const { v4: uuidv4 } = require('uuid');

// ✅ Send Invoice Email Manually
router.post('/email-invoice', (req, res) => {
  const { orderId, userId } = req.body;
  if (!orderId || !userId) {
    return res.status(400).json({ error: "orderId and userId are required" });
  }

  const query = 'SELECT status FROM orders WHERE id = ? AND user_id = ?';
  db.query(query, [orderId, userId], async (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ error: "Order not found." });
    }

    try {
      const response = await sendInvoice(orderId, userId, result[0].status);
      if (!response.success) throw new Error(response.error);
      res.json({ message: "✅ Invoice sent" });
    } catch (e) {
      res.status(500).json({ error: "Failed to send invoice", details: e.message });
    }
  });
});

// ✅ Place Order
router.post('/place', (req, res) => {
  const { userId, name, phone, email, address, paymentMethod, items } = req.body;

  if (!userId || !items || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order request' });
  }

  const orderGroupId = uuidv4();
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderQuery = `
    INSERT INTO orders 
    (user_id, total_price, address, payment_method, status, order_date, order_group_id, name, phone, email)
    VALUES (?, ?, ?, ?, 'Pending', NOW(), ?, ?, ?, ?)
  `;

  db.query(orderQuery, [userId, totalPrice, address, paymentMethod, orderGroupId, name, phone, email], (err, orderResult) => {
    if (err) return res.status(500).json({ error: 'Failed to place order', details: err.message });

    const orderId = orderResult.insertId;
    const itemValues = items.map(item => [orderId, item.productId, item.quantity, item.price]);
    const itemQuery = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`;

    db.query(itemQuery, [itemValues], async (itemErr) => {
      if (itemErr) {
        return res.status(500).json({ error: 'Order items failed', details: itemErr.message });
      }

      const updatePromises = items.map(item => {
        return new Promise((resolve, reject) => {
          const updateStock = `UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?`;
          db.query(updateStock, [item.quantity, item.productId, item.quantity], (err, result) => {
            if (err || result.affectedRows === 0) {
              reject(new Error(`Stock update failed for product ${item.productId}`));
            } else {
              resolve();
            }
          });
        });
      });

      try {
  await Promise.all(updatePromises);

  const placeholders = items.map(() => '?').join(',');
  const productIds = items.map(i => i.productId);

  db.query(`DELETE FROM cart WHERE user_id = ? AND product_id IN (${placeholders})`, [userId, ...productIds]);

  // ✅ FIXED: Return orderId
  res.json({ message: '✅ Order placed successfully', orderId });

  // Send invoice (optional)
  const invoiceRes = await sendInvoice(orderId, userId, 'Pending');
  if (!invoiceRes.success) {
    console.error(`Invoice error:`, invoiceRes.error);
  }
} catch (stockErr) {
  return res.status(500).json({ error: 'Stock update failed', details: stockErr.message });
}
    });
  });
});

// ✅ Cancel Order with Status Check
router.patch('/:id/cancel', (req, res) => {
  const orderId = req.params.id;

  // Step 1: Fetch current status and user_id
  const fetchQuery = 'SELECT status, user_id FROM orders WHERE id = ?';
  db.query(fetchQuery, [orderId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to fetch order" });
    if (result.length === 0) return res.status(404).json({ error: "Order not found" });

    const { status, user_id } = result[0];

    // Step 2: Prevent canceling if already canceled or delivered
    if (status === 'Canceled') {
      return res.status(400).json({ error: "Order is already canceled" });
    }
    if (status === 'Delivered') {
      return res.status(400).json({ error: "Cannot cancel a delivered order" });
    }

    // Step 3: Proceed to cancel
    const cancelQuery = "UPDATE orders SET status = 'Canceled', status_updated_at = NOW() WHERE id = ?";
    db.query(cancelQuery, [orderId], (updateErr, updateResult) => {
      if (updateErr) return res.status(500).json({ error: "Cancel failed" });
      if (updateResult.affectedRows === 0) return res.status(404).json({ error: "Order not found during update" });

      res.json({ message: "✅ Order canceled" });

      // Step 4: Send invoice
      sendInvoice(orderId, user_id, 'Canceled').catch(e => {
        console.error("Cancel invoice failed:", e.message);
      });
    });
  });
});


router.post('/reorder/:orderId', (req, res) => {
  const { orderId } = req.params;

  // Step 1: Fetch original order and its items
  const orderInfoQuery = `
    SELECT o.user_id, o.address, o.payment_method, o.name, o.phone, o.email, 
           oi.product_id, oi.quantity, oi.price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ?
  `;

  db.query(orderInfoQuery, [orderId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Original order not found" });
    }

    const order = results[0];
    const items = results.map(row => ({
      product_id: row.product_id,
      quantity: row.quantity,
      price: row.price
    }));

    const total_price = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const orderGroupId = uuidv4();

    const insertOrder = `
      INSERT INTO orders 
      (order_group_id, user_id, total_price, payment_method, address, name, phone, email, status, order_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
    `;

    db.query(insertOrder, [
      orderGroupId, order.user_id, total_price, order.payment_method, order.address,
      order.name, order.phone, order.email
    ], (insertErr, result) => {
      if (insertErr) return res.status(500).json({ error: "Reorder failed", details: insertErr.message });

      const newOrderId = result.insertId;
      const values = items.map(i => [newOrderId, i.product_id, i.quantity, i.price]);
      db.query(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`, [values], async (err2) => {
        if (err2) return res.status(500).json({ error: "Reorder items failed", details: err2.message });

        res.json({ message: "✅ Reorder placed" });
        await sendInvoice(newOrderId, order.user_id, 'Pending').catch(e => console.error("Invoice error:", e.message));
      });
    });
  });
});

router.post('/reorder-custom', (req, res) => {
  const { user_id, name, email, phone, address, payment_method, items } = req.body;

  if (!user_id || !name || !email || !phone || !address || !payment_method || !items || !items.length) {
    return res.status(400).json({ error: "Incomplete reorder data" });
  }

  const total_price = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const query = `
    INSERT INTO orders 
    (order_group_id, user_id, total_price, payment_method, address, name, email, phone, status, order_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
  `;

  db.query(query, [uuidv4(), user_id, total_price, payment_method, address, name, email, phone], (err, result) => {
    if (err) return res.status(500).json({ error: "Reorder failed", details: err.message });

    const orderId = result.insertId;
    const values = items.map(i => [orderId, i.product_id, i.quantity, i.price]);

    db.query(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`, [values], async (err2) => {
      if (err2) return res.status(500).json({ error: "Items insert failed", details: err2.message });

      res.json({ message: "✅ Reorder placed" });

      await sendInvoice(orderId, user_id, 'Pending').catch(e => console.error("Invoice error:", e.message));
    });
  });
});


// ✅ Fetch All Orders for a User — FIXED IMAGE COLUMN
router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT o.id AS order_id, o.order_date, o.status, o.total_price, o.address,
       o.name, o.email, o.phone,
       oi.product_id, oi.quantity, oi.price,
       p.name AS product_name, p.image_url AS product_image
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.user_id = ?
ORDER BY o.order_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ message: 'Error fetching orders' });
    }

    const groupedOrders = {};
    results.forEach(row => {
      if (!groupedOrders[row.order_id]) {
  groupedOrders[row.order_id] = {
    id: row.order_id,
    order_date: row.order_date,
    status: row.status,
    total_price: row.total_price,
    address: row.address,
    name: row.name,
    email: row.email,
    phone: row.phone,
    items: []
  };
      }

      if (row.product_id) {
        groupedOrders[row.order_id].items.push({
          product_id: row.product_id,
          quantity: row.quantity,
          price: row.price,
          product_name: row.product_name,
          product_image: row.product_image
        });
      }
    });

    const ordersList = Object.values(groupedOrders);
    res.json({ orders: ordersList });
  });
});

// ✅ Update Order Status
router.patch('/:id/status', (req, res) => {
  const orderId = req.params.id;
  const { status, userId } = req.body;
  const valid = ['Shipped', 'Delivered', 'Emailed'];

  if (!valid.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  if (status === 'Emailed') {
    db.query('SELECT status FROM orders WHERE id = ?', [orderId], async (err, result) => {
      if (err || result.length === 0) return res.status(404).json({ error: "Order not found" });

      try {
        const response = await sendInvoice(orderId, userId, result[0].status);
        if (!response.success) throw new Error(response.error);
        res.json({ message: "✅ Invoice sent" });
      } catch (e) {
        res.status(500).json({ error: "Email failed", details: e.message });
      }
    });
  } else {
    const query = 'UPDATE orders SET status = ?, status_updated_at = NOW() WHERE id = ?';
    db.query(query, [status, orderId], (err, result) => {
      if (err || result.affectedRows === 0) return res.status(500).json({ error: "Update failed" });

      res.json({ message: `✅ Marked as ${status}` });
      sendInvoice(orderId, userId, status).catch(e => console.error(`${status} invoice failed:`, e.message));
    });
  }
});

module.exports = router;
