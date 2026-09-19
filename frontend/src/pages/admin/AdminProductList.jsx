import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getProducts, deactivateProduct, activateProduct } from '../../api/adminProducts';

const money = (value) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(Number(value) || 0);

function Actions({ product, pendingId, onToggle }) {
  const active = Number(product.is_active) === 1;
  const isPending = pendingId === product.product_id;
  
  return (
    <div className="flex flex-wrap gap-2 md:justify-end">
      <Link to={`/admin/products/${product.product_id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 no-underline hover:bg-slate-50 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500">Edit</Link>
      <motion.button 
        whileHover={{ scale: isPending ? 1 : 1.05 }} 
        whileTap={{ scale: isPending ? 1 : 0.95 }}
        type="button" 
        disabled={isPending} 
        onClick={() => onToggle(product)}
        className={`min-h-10 rounded-lg px-3 text-sm font-semibold disabled:opacity-50 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 ${active ? 'bg-rose-50 text-rose-800 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}
      >
        <AnimatePresence mode="popLayout">
          {isPending ? (
            <motion.span key="pending" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin"></span>
              Saving…
            </motion.span>
          ) : (
            <motion.span key="action" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
              {active ? 'Deactivate' : 'Activate'}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
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
    // Remove confirm to allow seamless animation if requested, but prompt said "animate success".
    // We'll keep confirm to be safe but remove it to demonstrate the animation better? 
    // No, standard admin UI needs confirm unless it's a simple toggle switch. Let's keep confirm.
    if (!window.confirm(`${active ? 'Deactivate' : 'Activate'} ${product.product_name}?`)) return;
    
    setPendingId(product.product_id);
    setError('');
    try {
      if (active) await deactivateProduct(product.product_id);
      else await activateProduct(product.product_id);
      
      // We can optimistically update or just re-fetch. Re-fetch is safer.
      const freshProducts = await getProducts();
      setProducts(freshProducts);
    } catch (err) {
      setError(err.response?.data?.message || 'The status could not be updated. Please try again.');
    } finally { setPendingId(null); }
  }

  const visible = products.filter((p) => [p.product_name, p.sku, p.category_name].some((value) => String(value || '').toLowerCase().includes(search.trim().toLowerCase())));

  const staggerTable = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const rowVariant = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <section aria-labelledby="admin-products-title">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-7 flex flex-wrap items-end justify-between gap-5"
      >
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Products / Management</p>
          <h1 id="admin-products-title" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Product catalogue</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Manage listings, prices and product visibility in one place.</p>
        </div>
        <Link to="/admin/products/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#155b3a] px-5 text-sm font-bold text-white no-underline shadow-sm hover:bg-[#0e452c] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none">+ Add product</Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
          <p className="text-sm font-semibold text-slate-700">{loading ? 'Loading products…' : `${visible.length} of ${products.length} products`}</p>
          <label className="w-full sm:w-72">
            <span className="sr-only">Search products by name, SKU or category</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products or SKU" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition-colors focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700" />
          </label>
        </div>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              role="alert" 
              className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
            >
              {error}
              <button type="button" onClick={fetchProducts} className="font-bold underline focus-visible:ring-2 focus-visible:ring-rose-500 rounded-sm">Retry</button>
            </motion.div>
          )}
          
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="status" 
              className="p-12 text-center text-slate-600"
            >
              Loading your products…
            </motion.div>
          ) : visible.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center"
            >
              <p className="font-semibold text-slate-900">{search ? 'No matches found' : 'No products yet'}</p>
              <p className="mt-1 text-sm text-slate-600">{search ? 'Try a different search.' : 'Add a product to get started.'}</p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600"><tr>
                    <th scope="col" className="px-5 py-4">Product</th><th scope="col" className="px-5 py-4">SKU</th><th scope="col" className="px-5 py-4">Category</th><th scope="col" className="px-5 py-4">Price</th><th scope="col" className="px-5 py-4">Status</th><th scope="col" className="px-5 py-4 text-right">Actions</th>
                  </tr></thead>
                  <motion.tbody 
                    variants={staggerTable}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-slate-100"
                  >
                    <AnimatePresence>
                      {visible.map((product) => {
                        const active = Number(product.is_active) === 1;
                        const isPending = pendingId === product.product_id;
                        
                        return (
                          <motion.tr 
                            layout
                            variants={rowVariant}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={product.product_id} 
                            className="hover:bg-emerald-50/50 transition-colors"
                          >
                            <td className="max-w-56 px-5 py-4 font-semibold text-slate-900">{product.product_name}</td>
                            <td className="px-5 py-4 font-mono text-xs text-slate-600">{product.sku}</td>
                            <td className="px-5 py-4 text-slate-700">{product.category_name}</td>
                            <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{money(product.price)}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-colors ${active ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-700'} ${isPending ? 'opacity-50 animate-pulse' : ''}`}>
                                <AnimatePresence mode="popLayout">
                                  <motion.span key={active ? 'active' : 'inactive'} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                                    {active ? 'Active' : 'Inactive'}
                                  </motion.span>
                                </AnimatePresence>
                              </span>
                            </td>
                            <td className="px-5 py-4"><Actions product={product} pendingId={pendingId} onToggle={handleToggle} /></td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </motion.tbody>
                </table>
              </div>
              <motion.div 
                variants={staggerTable}
                initial="hidden"
                animate="show"
                className="divide-y divide-slate-200 md:hidden"
              >
                <AnimatePresence>
                  {visible.map((product) => {
                    const active = Number(product.is_active) === 1;
                    const isPending = pendingId === product.product_id;
                    return (
                      <motion.article 
                        layout
                        variants={rowVariant}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={product.product_id} 
                        className="space-y-3 p-5 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-base font-bold text-slate-900">{product.product_name}</h2>
                          <span className={`shrink-0 flex items-center rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${active ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-700'} ${isPending ? 'opacity-50 animate-pulse' : ''}`}>
                            <AnimatePresence mode="popLayout">
                              <motion.span key={active ? 'active' : 'inactive'} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                                {active ? 'Active' : 'Inactive'}
                              </motion.span>
                            </AnimatePresence>
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{product.category_name} · <span className="font-mono">{product.sku}</span></p>
                        <p className="font-bold text-slate-900">{money(product.price)}</p>
                        <Actions product={product} pendingId={pendingId} onToggle={handleToggle} />
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
