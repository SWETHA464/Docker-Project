import { Link, useLocation } from "react-router-dom";

export default function Navbar({ cartCount, onCartClick }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          Inkwell
        </Link>
        {!isAdmin && (
          <div className="nav-links">
            <Link to="/" className={pathname === "/" ? "active" : ""}>Books</Link>
            <Link to="/admin/login">Admin</Link>
            <button className="cart-pill" onClick={onCartClick}>
              🧾 Cart {cartCount > 0 ? `(${cartCount})` : ""}
            </button>
          </div>
        )}
        {isAdmin && (
          <div className="nav-links">
            <Link to="/">Back to store</Link>
          </div>
        )}
      </div>
    </div>
  );
}
