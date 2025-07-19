const express = require('express');
const db = require('../db');
const router = express.Router();

// ✅ 1. Get counts by order status
router.get('/stats', (req, res) => {
  const sql = `SELECT status, COUNT(*) AS count FROM orders GROUP BY status`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch order stats' });
    const formatted = {};
    results.forEach(row => {
      const status = row.status?.trim();
      formatted[status] = row.count;
    });
    res.json(formatted);
  });
});

// ✅ 2. Get all PENDING orders
router.get('/pending', (req, res) => {
  const sql = `
    SELECT id, user_id, total_price, order_date, name, phone, status
    FROM orders
    WHERE status = 'Pending'
    ORDER BY order_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch pending orders' });
    res.json(results);
  });
});

// ✅ 3. Admin can update full order details (status, tracking, courier, delivery date)
router.put('/:id/status', (req, res) => {
  const {
    status,
    tracking_id,
    estimated_delivery,
    courier_name,
    courier_tracking_url
  } = req.body;
  const id = req.params.id;

  const checkSql = `SELECT status FROM orders WHERE id = ?`;
  db.query(checkSql, [id], (err, result) => {
    if (err || result.length === 0)
      return res.status(404).json({ error: 'Order not found' });

    const currentStatus = result[0].status?.trim();
    if (currentStatus === 'Canceled') {
      return res.status(400).json({ error: 'Cannot update a canceled order' });
    }

    const updateSql = `
      UPDATE orders
      SET
        status = ?,
        tracking_id = ?,
        estimated_delivery = ?,
        courier_name = ?,
        courier_tracking_url = ?,
        status_updated_at = NOW()
      WHERE id = ?
    `;

    db.query(updateSql, [
      status,
      tracking_id || null,
      estimated_delivery || null,
      courier_name || null,
      courier_tracking_url || null,
      id
    ], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Failed to update order' });
      }
      res.json({ message: 'Order updated successfully' });
    });
  });
});

// ✅ 4. Get all orders with their items (joined and formatted)
router.get('/orders-with-items', (req, res) => {
  const ordersSql = `SELECT * FROM orders ORDER BY order_date DESC`;
  const itemsSql = `SELECT * FROM order_items`;

  db.query(ordersSql, (err, orders) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch orders' });

    db.query(itemsSql, (err2, items) => {
      if (err2) return res.status(500).json({ error: 'Failed to fetch order items' });

      const grouped = {};
      items.forEach(item => {
        if (!grouped[item.order_id]) grouped[item.order_id] = [];
        grouped[item.order_id].push(item);
      });

      const fullOrders = orders.map(order => ({
        ...order,
        order_date: isValidDate(order.order_date) ? new Date(order.order_date).toISOString() : null,
        status_updated_at: isValidDate(order.status_updated_at) ? new Date(order.status_updated_at).toISOString() : null,
        estimated_delivery: isValidDate(order.estimated_delivery) ? new Date(order.estimated_delivery).toISOString() : null,
        items: grouped[order.id] || []
      }));

      res.json(fullOrders);
    });
  });
});

// Helper to validate date
function isValidDate(date) {
  const d = new Date(date);
  return date && !isNaN(d.getTime());
}
router.put('/:id/payment-status', (req, res) => {
  const { payment_status } = req.body;
  const sql = `UPDATE orders SET payment_status = ? WHERE id = ?`;

  db.query(sql, [payment_status, req.params.id], (err, result) => {
    if (err) {
      console.error('Payment status update error:', err);
      return res.status(500).json({ error: 'Failed to update payment status' });
    }
    res.json({ message: 'Payment status updated' });
  });
});

module.exports = router;
