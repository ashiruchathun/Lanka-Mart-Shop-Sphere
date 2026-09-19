import { Routes, Route, NavLink, Link } from 'react-router-dom';
import AdminProductList from './AdminProductList';
import AdminProductForm from './AdminProductForm';
import AdminCategoryManager from './AdminCategoryManager';

const navClass = ({ isActive }) =>
  `inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold transition-colors ${
    isActive ? 'bg-white/15 text-white' : 'text-emerald-100 hover:bg-white/10 hover:text-white'
  }`;

export default function AdminPortal() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8f5] text-slate-900">
      <header className="border-b border-emerald-950/20 bg-[#12432c] text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/admin" className="flex items-center gap-3 no-underline" aria-label="ShopSphere Admin home">
            <span className="grid size-11 place-items-center rounded-xl bg-white text-xl font-extrabold text-[#12432c]">S</span>
            <span className="flex flex-col leading-tight"><strong className="text-lg tracking-tight text-white">ShopSphere</strong><small className="text-xs text-emerald-100">Management portal</small></span>
          </Link>
          <nav className="order-3 flex w-full items-center gap-1 border-t border-white/15 pt-3 sm:order-0 sm:w-auto sm:border-0 sm:pt-0" aria-label="Admin navigation">
            <NavLink end to="/admin" className={navClass}>Products</NavLink>
            <NavLink to="/admin/categories" className={navClass}>Categories</NavLink>
          </nav>
          <Link to="/" className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-4 text-sm font-semibold text-white no-underline hover:bg-white/10">View storefront <span className="ml-2" aria-hidden="true">↗</span></Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Routes>
          <Route index element={<AdminProductList />} />
          <Route path="products" element={<AdminProductList />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategoryManager />} />
        </Routes>
      </main>
      <footer className="border-t border-emerald-900/10 bg-white px-4 py-5 text-center text-sm text-slate-600">
        ShopSphere Admin · Lanka Mart
      </footer>
    </div>
  );
}
