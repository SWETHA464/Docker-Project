import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Shop from "./pages/Shop";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminOrders from "./pages/AdminOrders";
import AdminBooks from "./pages/AdminBooks";
import Analytics from "./pages/Analytics";

export default function App() {
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = Object.values(cart).reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <Routes>
        <Route
          path="/"
          element={
            <Shop cart={cart} setCart={setCart} cartOpen={cartOpen} setCartOpen={setCartOpen} />
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="orders" element={<AdminOrders />} />
          <Route path="menu" element={<AdminBooks />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="dashboard" element={<AdminOrders />} />
        </Route>
      </Routes>
    </>
  );
}
