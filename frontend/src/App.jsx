import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
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
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/admin/*" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <AdminPortal />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="app public-app">
      <header className="site-header">
        <div className="header-inner">
        <Link className="brand transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-md" to="/" aria-label="ShopSphere home">
          <span className="brand-icon">S</span>

          <span>
            <strong>ShopSphere</strong>
            <small>Lanka Mart</small>
          </span>
        </Link>

        <nav className="navigation flex gap-1" aria-label="Main navigation">
          {[{ path: "/", label: "Products" }, { path: "/categories", label: "Categories" }, { path: "/inventory", label: "Inventory" }].map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} className={`relative px-3 py-2 rounded-md transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${isActive ? 'text-emerald-800 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`} to={link.path}>
                {link.label}
                {isActive && (
                  <motion.div layoutId="navIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <Link className="admin-button transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none" to="/admin">
          Admin Portal
        </Link>
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25, ease: "easeOut" }}><CataloguePage /></motion.div>} />
            <Route path="/categories" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25, ease: "easeOut" }}><CategoriesPage /></motion.div>} />
            <Route path="/inventory" element={<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25, ease: "easeOut" }}><InventoryPage /></motion.div>} />
          </Routes>
        </AnimatePresence>
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
