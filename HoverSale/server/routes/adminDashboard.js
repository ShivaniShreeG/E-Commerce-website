const express = require('express');
const router = express.Router();
const db = require('../db');

// GET Admin Dashboard Summary
router.get('/', (req, res) => {
  const summary = {};

  db.query(`SELECT COUNT(*) AS userCount FROM users`, (err, userResults) => {
    if (err) {
      console.error('❌ Error fetching users:', err);
      return res.status(500).json({ error: 'Error fetching users' });
    }
    summary.users = userResults[0].userCount;

    db.query(`SELECT COUNT(*) AS productCount FROM products`, (err, productResults) => {
      if (err) {
        console.error('❌ Error fetching products:', err);
        return res.status(500).json({ error: 'Error fetching products' });
      }
      summary.products = productResults[0].productCount;

      db.query(`SELECT COUNT(*) AS orderCount FROM orders`, (err, orderResults) => {
        if (err) {
          console.error('❌ Error fetching orders:', err);
          return res.status(500).json({ error: 'Error fetching orders' });
        }
        summary.orders = orderResults[0].orderCount;

        db.query(
          `SELECT IFNULL(SUM(total_price), 0) AS revenue FROM orders WHERE payment_status = 'Paid'`,
          (err, revenueResults) => {
            if (err) {
              console.error('❌ Error fetching revenue:', err);
              return res.status(500).json({ error: 'Error fetching revenue' });
            }
            summary.revenue = revenueResults[0].revenue;

            console.log('📊 Admin Dashboard Summary (no low stock count):', summary);
            res.json(summary);
          }
        );
      });
    });
  });
});

// ✅ Low stock products (quantity between 1-4)
router.get('/low-stock-products', (req, res) => {
  const sql = `SELECT id, name, quantity, image_url FROM products WHERE quantity > 0 AND quantity < 5`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching low stock products:', err);
      return res.status(500).json({ error: 'Error fetching low stock products' });
    }

    res.json(results);
  });
});

// ✅ Out of stock products
router.get('/out-of-stock-products', (req, res) => {
  const sql = `SELECT id, name, quantity, image_url FROM products WHERE quantity = 0`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching out-of-stock products:', err);
      return res.status(500).json({ error: 'Error fetching out-of-stock products' });
    }

    res.json(results);
  });
});

module.exports = router;
