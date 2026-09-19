import { Routes, Route, Link, useLocation } from "react-router-dom";
import AdminProductList from "./AdminProductList";
import AdminProductForm from "./AdminProductForm";
import AdminCategoryManager from "./AdminCategoryManager";
import "../../App.css";

export default function AdminPortal() {
  const location = useLocation();

  return (
    <div className="app">
      <header className="site-header" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
        <Link className="brand" to="/admin" style={{ color: 'white' }}>
          <span className="brand-icon" style={{ backgroundColor: '#333' }}>A</span>
          <span>
            <strong>ShopSphere Admin</strong>
            <small>Management Portal</small>
          </span>
        </Link>

        <nav className="navigation" aria-label="Admin navigation">
          <Link 
            className={location.pathname === "/admin" || location.pathname.startsWith("/admin/products") ? "active" : ""} 
            to="/admin"
            style={{ color: 'white' }}
          >
            Products
          </Link>
          <Link 
            className={location.pathname === "/admin/categories" ? "active" : ""} 
            to="/admin/categories"
            style={{ color: 'white' }}
          >
            Categories
          </Link>
        </nav>

        <Link className="admin-button" to="/" style={{ backgroundColor: '#444' }}>
          Exit Admin
        </Link>
      </header>

      <main style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<AdminProductList />} />
          <Route path="/products/new" element={<AdminProductForm />} />
          <Route path="/products/:id/edit" element={<AdminProductForm />} />
          <Route path="/categories" element={<AdminCategoryManager />} />
        </Routes>
      </main>

      <footer style={{ backgroundColor: '#1a1a1a', color: '#999', marginTop: 'auto' }}>
        <div>
          <strong>ShopSphere Admin</strong>
          <p>Secure Management Area</p>
        </div>
        <p>© 2026 Lanka Mart. All rights reserved.</p>
      </footer>
    </div>
  );
}
