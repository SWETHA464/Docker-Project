import { useEffect, useState } from "react";
import { api } from "../api";
import BookCard from "../components/BookCard";
import CartDrawer from "../components/CartDrawer";

export default function Shop({ cart, setCart, cartOpen, setCartOpen }) {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [form, setForm] = useState({ customer_name: "", phone: "", address: "" });
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    api.getBooks()
      .then((data) => setBooks(data.filter((b) => b.is_available)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function addToCart(book) {
    setCart((prev) => {
      const existing = prev[book.id];
      return {
        ...prev,
        [book.id]: {
          id: book.id,
          name: book.name,
          price: Number(book.price),
          qty: existing ? existing.qty + 1 : 1,
        },
      };
    });
  }

  function removeFromCart(book) {
    setCart((prev) => {
      const existing = prev[book.id];
      if (!existing) return prev;
      if (existing.qty <= 1) {
        const copy = { ...prev };
        delete copy[book.id];
        return copy;
      }
      return { ...prev, [book.id]: { ...existing, qty: existing.qty - 1 } };
    });
  }

  const filtered = filter === "All" ? books : books.filter((b) => b.category === filter);
  const cartCount = Object.values(cart).reduce((s, i) => s + i.qty, 0);

  async function submitOrder(e) {
    e.preventDefault();
    setPlacing(true);
    setError("");
    try {
      const items = Object.values(cart).map((i) => ({ book_id: i.id, quantity: i.qty }));
      const result = await api.placeOrder({ ...form, items });
      setConfirmation(result);
      setCart({});
      setCheckoutOpen(false);
      setCartOpen(false);
      setForm({ customer_name: "", phone: "", address: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Curated shelves &middot; Delivered fast</div>
          <h1>Great reads, ordered in seconds.</h1>
          <p>
            Pick your favourites from the catalog below, send the order straight to our
            fulfillment team, and track it in real time. No app download, no fuss.
          </p>
        </div>
        <div className="hero-display">
          <div className="hero-display-label">Freshly restocked</div>
        </div>
      </div>

      <div className="section-title">
        <h2>Our Catalog</h2>
        <div className="menu-filters">
          {["All", "Fiction", "Non-Fiction"].map((f) => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p>Loading catalog...</p>}
      {error && !checkoutOpen && <p style={{ color: "var(--burgundy)" }}>{error}</p>}

      <div className="book-grid">
        {filtered.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            qtyInCart={cart[book.id]?.qty || 0}
            onAdd={addToCart}
            onRemove={removeFromCart}
          />
        ))}
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onCheckout={() => setCheckoutOpen(true)}
      />

      {checkoutOpen && (
        <div className="cart-overlay" onClick={() => setCheckoutOpen(false)}>
          <div className="login-card" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
            <h3>Delivery details</h3>
            <form onSubmit={submitOrder}>
              <div className="form-field">
                <label>Full name</label>
                <input required value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Phone</label>
                <input required value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Delivery address</label>
                <textarea required rows={3} value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              {error && <p style={{ color: "var(--burgundy)" }}>{error}</p>}
              <button className="btn btn-primary" style={{ width: "100%" }} disabled={placing}>
                {placing ? "Placing order..." : "Place order"}
              </button>
            </form>
          </div>
        </div>
      )}

      {confirmation && (
        <div className="cart-overlay" onClick={() => setConfirmation(null)}>
          <div className="login-card" onClick={(e) => e.stopPropagation()}>
            <h3>🎉 Order placed!</h3>
            <p>Order #{confirmation.order_id} confirmed. Total: ₹{confirmation.total_amount}</p>
            <p style={{ opacity: 0.7, fontSize: "0.88rem" }}>
              Our team has received your order and will start packing it shortly.
            </p>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setConfirmation(null)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
