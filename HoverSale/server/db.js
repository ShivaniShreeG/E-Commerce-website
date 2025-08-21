// backend/db.js
const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,     // ✅ include port
  connectionLimit: 10            // ✅ allow multiple connections
});

connection.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to Clever Cloud MySQL");
    conn.release();
  }
});

module.exports = connection;
