const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "book_user",
  password: process.env.DB_PASSWORD || "book_pass",
  database: process.env.DB_NAME || "book_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Retry helper so the backend doesn't crash if MySQL isn't ready yet
async function waitForDb(retries = 15, delayMs = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await pool.getConnection();
      conn.release();
      console.log("Connected to MySQL");
      return;
    } catch (err) {
      console.log(`MySQL not ready (attempt ${i}/${retries}): ${err.message}`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error("Could not connect to MySQL after multiple retries");
}

module.exports = { pool, waitForDb };
