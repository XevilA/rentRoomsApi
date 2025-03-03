const pool = require('../config/db');
const bcrypt = require('bcrypt');

const getUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const createUser = async (email, password, fullName) => {
    const hashedPassword = await bcrypt.hash(password, 10);  // เข้ารหัสรหัสผ่าน
    const query = 'INSERT INTO users (email, password, full_name) VALUES ($1, $2, $3)';
    await pool.query(query, [email, hashedPassword, fullName]);
    console.log('User added successfully');
  };
  
module.exports = {
  getUserByEmail,
  createUser
};
