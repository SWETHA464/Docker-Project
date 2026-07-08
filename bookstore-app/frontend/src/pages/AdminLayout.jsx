import { Navigate, NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const token = localStorage.getItem("admin_token");
  if (!token) return <Navigate to="/admin/login" replace />;

  function logout() {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
  }

  return (
    <div className="admin-shell">
      <div className="admin-sidebar">
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? "active" : "")}>
          📦 Orders
        </NavLink>
        <NavLink to="/admin/menu" className={({ isActive }) => (isActive ? "active" : "")}>
          📚 Catalog
        </NavLink>
        <NavLink to="/admin/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
          📊 Analytics
        </NavLink>
        <button
          className="btn btn-outline"
          style={{ marginTop: 24, width: "100%", color: "var(--parchment)", borderColor: "rgba(247,239,225,0.3)" }}
          onClick={logout}
        >
          Log out
        </button>
      </div>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
