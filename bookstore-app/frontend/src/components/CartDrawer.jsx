export default function CartDrawer({ open, onClose, cart, onAdd, onRemove, onCheckout }) {
  if (!open) return null;

  const items = Object.values(cart);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-header">
          <h3>Your Order</h3>
          <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>Inkwell Bookstore</div>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart">Your cart is empty. Add a book to get started 📚</div>
        ) : (
          <>
            {items.map((item) => (
              <div className="receipt-line" key={item.id}>
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-meta">₹{item.price} × {item.qty}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="qty-btn" onClick={() => onRemove(item)}>−</button>
                  <button className="qty-btn" onClick={() => onAdd(item)}>+</button>
                </div>
              </div>
            ))}
            <div className="receipt-total">
              <span>Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} onClick={onCheckout}>
              Proceed to checkout
            </button>
          </>
        )}
        <button className="btn btn-outline" style={{ width: "100%", marginTop: 10 }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
