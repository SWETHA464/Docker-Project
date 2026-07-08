const express = require("express");
const { pool } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/analytics/summary - admin only, top-level KPIs
router.get("/summary", requireAdmin, async (req, res) => {
  try {
    const [[totals]] = await pool.query(
      `SELECT
         COUNT(*) AS total_orders,
         COALESCE(SUM(total_amount), 0) AS total_revenue,
         COALESCE(AVG(total_amount), 0) AS avg_order_value
       FROM orders WHERE status != 'Cancelled'`
    );
    const [[today]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS today_revenue, COUNT(*) AS today_orders
       FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'Cancelled'`
    );
    res.json({ ...totals, ...today });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// GET /api/analytics/popular-items - best selling books by quantity
router.get("/popular-items", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT oi.book_name AS name, SUM(oi.quantity) AS total_sold,
              SUM(oi.quantity * oi.unit_price) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status != 'Cancelled'
       GROUP BY oi.book_name
       ORDER BY total_sold DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch popular items" });
  }
});

// GET /api/analytics/revenue-trend - revenue grouped by day (last 14 days)
router.get("/revenue-trend", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(created_at) AS date,
              SUM(total_amount) AS revenue,
              COUNT(*) AS orders
       FROM orders
       WHERE status != 'Cancelled' AND created_at >= (CURDATE() - INTERVAL 14 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch revenue trend" });
  }
});

// GET /api/analytics/order-status - breakdown of orders by status
router.get("/order-status", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM orders GROUP BY status`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order status breakdown" });
  }
});

module.exports = router;
