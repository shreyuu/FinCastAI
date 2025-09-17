import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2';

console.log('DB_USER:', process.env.DB_USER); // Add this line

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'stockuser',
//   database: process.env.DB_NAME || 'stock_app',
//   password: process.env.DB_PASS || 'stockpass123',
// });

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'stockuser',
  database: 'stock_app',
  password: 'stockpass123',
});

export default connection;
