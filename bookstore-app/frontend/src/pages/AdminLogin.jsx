import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token } = await api.login(username, password);
      localStorage.setItem("admin_token", token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <h3>Admin Login</h3>
        <p style={{ opacity: 0.6, fontSize: "0.85rem", marginBottom: 20 }}>
          Manage the catalog, track orders and view sales analytics.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Username</label>
            <input required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p style={{ color: "var(--burgundy)", fontSize: "0.85rem" }}>{error}</p>}
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p style={{ opacity: 0.5, fontSize: "0.75rem", marginTop: 16 }}>
          Default: admin / admin123 (set via env vars)
        </p>
      </div>
    </div>
  );
}
