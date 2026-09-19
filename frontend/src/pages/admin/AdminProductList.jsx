import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deactivateProduct, activateProduct } from '../../api/adminProducts';

const money = (value) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(Number(value) || 0);

function Actions({ product, pendingId, onToggle }) {
  const active = Number(product.is_active) === 1;
  return (
    <div className="flex flex-wrap gap-2 md:justify-end">
      <Link to={`/admin/products/${product.product_id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 no-underline hover:bg-slate-50">Edit</Link>
      <button type="button" disabled={pendingId === product.product_id} onClick={() => onToggle(product)}
        className={`min-h-10 rounded-lg px-3 text-sm font-semibold disabled:opacity-50 ${active ? 'bg-rose-50 text-rose-800 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>
        {pendingId === product.product_id ? 'Saving…' : active ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  );
}

export default function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState(null);

  async function fetchProducts() {
    setLoading(true);
    setError('');
    try { setProducts(await getProducts()); }
    catch (err) { setError(err.response?.data?.message || 'Products could not be loaded. Check the backend and try again.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchProducts(); }, []);

  async function handleToggle(product) {
    const active = Number(product.is_active) === 1;
    if (!window.confirm(`${active ? 'Deactivate' : 'Activate'} ${product.product_name}?`)) return;
    setPendingId(product.product_id);
    setError('');
    try {
      if (active) await deactivateProduct(product.product_id);
      else await activateProduct(product.product_id);
      setProducts(await getProducts());
    } catch (err) {
      setError(err.response?.data?.message || 'The status could not be updated. Please try again.');
    } finally { setPendingId(null); }
  }

  const visible = products.filter((p) => [p.product_name, p.sku, p.category_name].some((value) => String(value || '').toLowerCase().includes(search.trim().toLowerCase())));

  return (
    <section aria-labelledby="admin-products-title">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Products / Management</p>
          <h1 id="admin-products-title" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Product catalogue</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Manage listings, prices and product visibility in one place.</p>
        </div>
        <Link to="/admin/products/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#155b3a] px-5 text-sm font-bold text-white no-underline shadow-sm hover:bg-[#0e452c]">+ Add product</Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
          <p className="text-sm font-semibold text-slate-700">{loading ? 'Loading products…' : `${visible.length} of ${products.length} products`}</p>
          <label className="w-full sm:w-72">
            <span className="sr-only">Search products by name, SKU or category</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products or SKU" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-700 focus:outline-none" />
          </label>
        </div>
        {error && <div role="alert" className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}<button type="button" onClick={fetchProducts} className="font-bold underline">Retry</button></div>}
        {loading ? <div role="status" className="p-12 text-center text-slate-600">Loading your products…</div> : visible.length === 0 ? (
          <div className="p-12 text-center"><p className="font-semibold text-slate-900">{search ? 'No matches found' : 'No products yet'}</p><p className="mt-1 text-sm text-slate-600">{search ? 'Try a different search.' : 'Add a product to get started.'}</p></div>
        ) : <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600"><tr>
                <th scope="col" className="px-5 py-4">Product</th><th scope="col" className="px-5 py-4">SKU</th><th scope="col" className="px-5 py-4">Category</th><th scope="col" className="px-5 py-4">Price</th><th scope="col" className="px-5 py-4">Status</th><th scope="col" className="px-5 py-4 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">{visible.map((product) => <tr key={product.product_id} className="hover:bg-emerald-50/50">
                <td className="max-w-56 px-5 py-4 font-semibold text-slate-900">{product.product_name}</td>
                <td className="px-5 py-4 font-mono text-xs text-slate-600">{product.sku}</td>
                <td className="px-5 py-4 text-slate-700">{product.category_name}</td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{money(product.price)}</td>
                <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${Number(product.is_active) === 1 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-700'}`}>{Number(product.is_active) === 1 ? 'Active' : 'Inactive'}</span></td>
                <td className="px-5 py-4"><Actions product={product} pendingId={pendingId} onToggle={handleToggle} /></td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="divide-y divide-slate-200 md:hidden">{visible.map((product) => <article key={product.product_id} className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3"><h2 className="text-base font-bold text-slate-900">{product.product_name}</h2><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${Number(product.is_active) === 1 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-700'}`}>{Number(product.is_active) === 1 ? 'Active' : 'Inactive'}</span></div>
            <p className="text-sm text-slate-600">{product.category_name} · <span className="font-mono">{product.sku}</span></p>
            <p className="font-bold text-slate-900">{money(product.price)}</p>
            <Actions product={product} pendingId={pendingId} onToggle={handleToggle} />
          </article>)}</div>
        </>}
      </div>
    </section>
  );
}
