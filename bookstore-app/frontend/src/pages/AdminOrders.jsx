import { useEffect, useState } from "react";
import { api } from "../api";

const STATUSES = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api.getOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function changeStatus(id, status) {
    try {
      await api.updateOrderStatus(id, status);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Orders</h2>
      <p style={{ opacity: 0.6, marginBottom: 20 }}>
        {orders.length} total orders. Update status as the fulfillment team progresses each order.
      </p>
      {error && <p style={{ color: "var(--burgundy)" }}>{error}</p>}
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                    <div style={{ opacity: 0.6, fontSize: "0.8rem" }}>{o.phone}</div>
                    <div style={{ opacity: 0.6, fontSize: "0.8rem" }}>{o.address}</div>
                  </td>
                  <td>
                    {o.items.map((it) => (
                      <div key={it.id} style={{ fontSize: "0.85rem" }}>
                        {it.quantity}× {it.book_name}
                      </div>
                    ))}
                  </td>
                  <td>₹{Number(o.total_amount).toFixed(0)}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      className={`status-badge status-${o.status.replace(/\s/g, "-")}`}
                      style={{ border: "none" }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p style={{ opacity: 0.6, padding: 20 }}>No orders yet.</p>}
        </div>
      )}
    </div>
  );
}
