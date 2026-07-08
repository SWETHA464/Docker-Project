import { useEffect, useState } from "react";
import { api } from "../api";

const EMPTY = { name: "", author: "", description: "", category: "Fiction", price: "", image_url: "", is_available: true };

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    api.getBooks().then(setBooks).catch((err) => setError(err.message));
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.updateBook(editingId, form);
      } else {
        await api.addBook(form);
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function editBook(b) {
    setForm({
      name: b.name,
      author: b.author || "",
      description: b.description,
      category: b.category,
      price: b.price,
      image_url: b.image_url || "",
      is_available: !!b.is_available,
    });
    setEditingId(b.id);
  }

  async function removeBook(id) {
    if (!confirm("Remove this book from the catalog?")) return;
    try {
      await api.deleteBook(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Catalog Management</h2>
      <p style={{ opacity: 0.6, marginBottom: 20 }}>Add, edit or remove books from the live catalog.</p>

      <div className="card">
        <h3 style={{ fontSize: "1.05rem" }}>{editingId ? "Edit book" : "Add a new book"}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-field">
              <label>Title</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Author</label>
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Price (₹)</label>
              <input required type="number" step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Fiction</option>
                <option>Non-Fiction</option>
              </select>
            </div>
            <div className="form-field">
              <label>Available</label>
              <select value={form.is_available ? "yes" : "no"}
                onChange={(e) => setForm({ ...form, is_available: e.target.value === "yes" })}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Cover photo URL (optional)</label>
            <input placeholder="https://... leave blank to use the default icon" value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          {error && <p style={{ color: "var(--burgundy)" }}>{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary">{editingId ? "Save changes" : "Add book"}</button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={() => { setForm(EMPTY); setEditingId(null); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Title</th><th>Category</th><th>Price</th><th>Available</th><th></th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.name}</div>
                  {b.author && <div style={{ opacity: 0.7, fontSize: "0.8rem" }}>by {b.author}</div>}
                  <div style={{ opacity: 0.6, fontSize: "0.8rem" }}>{b.description}</div>
                </td>
                <td>{b.category}</td>
                <td>₹{Number(b.price).toFixed(0)}</td>
                <td>{b.is_available ? "Yes" : "No"}</td>
                <td>
                  <button className="btn btn-outline" style={{ padding: "6px 12px", marginRight: 8 }} onClick={() => editBook(b)}>Edit</button>
                  <button className="btn btn-outline" style={{ padding: "6px 12px" }} onClick={() => removeBook(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
