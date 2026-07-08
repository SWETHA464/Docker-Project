const express = require("express");
const { pool } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/books - public, list all available books (customers)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM books ORDER BY category, name"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch catalog" });
  }
});

// POST /api/books - admin only, add a book
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, author, description, category, price, image_url, is_available } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }
    const [result] = await pool.query(
      `INSERT INTO books (name, author, description, category, price, image_url, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, author || "", description || "", category || "Fiction", price, image_url || "", is_available ?? true]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add book" });
  }
});

// PUT /api/books/:id - admin only, update a book
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { name, author, description, category, price, image_url, is_available } = req.body;
    const [result] = await pool.query(
      `UPDATE books SET name=?, author=?, description=?, category=?, price=?, image_url=?, is_available=?
       WHERE id=?`,
      [name, author, description, category, price, image_url, is_available, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

// DELETE /api/books/:id - admin only
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM books WHERE id=?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

module.exports = router;
