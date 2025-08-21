const bcrypt = require('bcryptjs');
const db = require('./db'); // adjust path if needed

const email = 'g.shivanishree@gmail.com';      // change as needed
const password = '123456';          // your desired password
const name = 'Shivani';        // admin full name

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;

  const query = 'INSERT INTO admin (email, password, name) VALUES (?, ?, ?)';
  db.query(query, [email, hash, name], (err, result) => {
    if (err) {
      console.error('Failed to insert admin:', err.message);
    } else {
      console.log('✅ Admin created successfully!');
    }
    process.exit();
  });
});
