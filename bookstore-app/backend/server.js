require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");

const { pool, waitForDb } = require("./db");
const bookRoutes = require("./routes/books");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const analyticsRoutes = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

// Create a default admin account on first boot if none exists
async function seedAdmin() {
  const username = process.env.ADMIN_DEFAULT_USERNAME || "admin";
  const password = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";

  const [rows] = await pool.query("SELECT id FROM admins WHERE username = ?", [username]);
  if (rows.length === 0) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO admins (username, password_hash) VALUES (?, ?)", [username, hash]);
    console.log(`Seeded default admin account: ${username} / ${password}`);
  }
}

async function start() {
  await waitForDb();
  await seedAdmin();
  app.listen(PORT, () => console.log(`Bookstore backend listening on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
