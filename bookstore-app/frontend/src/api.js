// All requests go through /api, which nginx proxies to the backend container.
// In local `npm run dev` (outside Docker) you can set VITE_API_BASE to point
// straight at http://localhost:5000/api instead.
const BASE = import.meta.env.VITE_API_BASE || "/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? authHeaders() : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  getBooks: () => request("/books"),
  addBook: (book) => request("/books", { method: "POST", body: book, auth: true }),
  updateBook: (id, book) => request(`/books/${id}`, { method: "PUT", body: book, auth: true }),
  deleteBook: (id) => request(`/books/${id}`, { method: "DELETE", auth: true }),

  placeOrder: (order) => request("/orders", { method: "POST", body: order }),
  getOrders: () => request("/orders", { auth: true }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: "PUT", body: { status }, auth: true }),

  login: (username, password) => request("/auth/login", { method: "POST", body: { username, password } }),

  getSummary: () => request("/analytics/summary", { auth: true }),
  getPopularItems: () => request("/analytics/popular-items", { auth: true }),
  getRevenueTrend: () => request("/analytics/revenue-trend", { auth: true }),
  getOrderStatusBreakdown: () => request("/analytics/order-status", { auth: true }),
};
