const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "Sindhu@2007",
  database: "blood_donation",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Proper function name
async function testDbConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Database connected successfully");
    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

module.exports = { pool, testDbConnection };
