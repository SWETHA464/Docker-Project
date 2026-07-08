const express = require("express");
const { pool } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders - public, customer places an order
// body: { customer_name, phone, address, items: [{ book_id, quantity }] }
router.post("/", async (req, res) => {
  const { customer_name, phone, address, items } = req.body;

  if (!customer_name || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "customer_name, phone, address and items are required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch current prices from DB (never trust client-side prices)
    const bookIds = items.map((i) => i.book_id);
    const [books] = await conn.query(
      `SELECT id, name, price FROM books WHERE id IN (${bookIds.map(() => "?").join(",")}) AND is_available = TRUE`,
      bookIds
    );

    if (books.length !== items.length) {
      throw new Error("One or more selected books are unavailable");
    }

    const priceMap = Object.fromEntries(books.map((b) => [b.id, b]));
    let total = 0;
    for (const item of items) {
      total += priceMap[item.book_id].price * item.quantity;
    }

    const [orderResult] = await conn.query(
      `INSERT INTO orders (customer_name, phone, address, status, total_amount)
       VALUES (?, ?, ?, 'Pending', ?)`,
      [customer_name, phone, address, total]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      const book = priceMap[item.book_id];
      await conn.query(
        `INSERT INTO order_items (order_id, book_id, book_name, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, book.id, book.name, item.quantity, book.price]
      );
    }

    await conn.commit();
    res.status(201).json({ order_id: orderId, total_amount: total });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(400).json({ error: err.message || "Failed to place order" });
  } finally {
    conn.release();
  }
});

// GET /api/orders - admin only, list all orders with their items
router.get("/", requireAdmin, async (req, res) => {
  try {
    const [orders] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    const [items] = await pool.query("SELECT * FROM order_items");

    const itemsByOrder = {};
    for (const item of items) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    }

    const result = orders.map((o) => ({ ...o, items: itemsByOrder[o.id] || [] }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PUT /api/orders/:id/status - admin only, update order status
router.put("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body;
  const valid = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${valid.join(", ")}` });
  }
  try {
    const [result] = await pool.query("UPDATE orders SET status=? WHERE id=?", [status, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;
