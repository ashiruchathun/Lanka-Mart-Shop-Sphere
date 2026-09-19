import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import CataloguePage from "./pages/CataloguePage";
import CategoriesPage from "./pages/CategoriesPage";
import InventoryPage from "./pages/InventoryPage";
import AdminPortal from "./pages/admin/AdminPortal";
import "./App.css";

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="app">
        <Routes>
          <Route path="/admin/*" element={<AdminPortal />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-icon">S</span>

          <span>
            <strong>ShopSphere</strong>
            <small>Lanka Mart</small>
          </span>
        </Link>

        <nav className="navigation" aria-label="Main navigation">
          <Link className={location.pathname === "/" ? "active" : ""} to="/">
            Products
          </Link>
          <Link className={location.pathname === "/categories" ? "active" : ""} to="/categories">
            Categories
          </Link>
          <Link className={location.pathname === "/inventory" ? "active" : ""} to="/inventory">
            Inventory
          </Link>
        </nav>

        <Link className="admin-button" to="/admin">
          Admin Portal
        </Link>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<CataloguePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
        </Routes>
      </main>

      <footer>
        <div>
          <strong>ShopSphere</strong>
          <p>Product and Catalogue Management System</p>
        </div>

        <p>© 2026 Lanka Mart. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;