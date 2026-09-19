import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/adminProducts';

export default function AdminCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadCategories() {
    setLoading(true);
    setError('');
    try { setCategories(await getCategories()); }
    catch (err) { setError(err.response?.data?.message || 'Categories could not be loaded.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadCategories(); }, []);

  function resetForm() { setForm({ name: '', description: '' }); setEditingId(null); }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const data = { name: form.name.trim(), category_name: form.name.trim(), description: form.description.trim() };
      if (editingId != null) await updateCategory(editingId, data);
      else await createCategory(data);
      setMessage(editingId != null ? 'Category updated.' : 'Category added.');
      resetForm();
      await loadCategories();
    } catch (err) { setError(err.response?.data?.message || 'Category could not be saved.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(category) {
    const id = category.category_id ?? category.id;
    if (!window.confirm(`Delete ${category.category_name ?? category.name}? Products in this category may prevent deletion.`)) return;
    setError(''); setMessage('');
    try { await deleteCategory(id); setMessage('Category deleted.'); await loadCategories(); }
    catch (err) { setError(err.response?.data?.message || 'Category could not be deleted. It may contain products.'); }
  }

  const staggerList = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariant = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <section aria-labelledby="categories-title">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Categories / Management</p>
        <h1 id="categories-title" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Manage categories</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Organize the collections customers browse in the store.</p>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.div key="error" initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-900">
            {error} {loading === false && <button type="button" onClick={loadCategories} className="ml-2 font-bold underline">Retry</button>}
          </motion.div>
        )}
        {message && (
          <motion.p key="message" initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            {message}
          </motion.p>
        )}
      </AnimatePresence>
      
      <div className="grid gap-6 lg:grid-cols-[minmax(290px,380px)_minmax(0,1fr)] lg:items-start">
        <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-900">{editingId != null ? 'Edit category' : 'Add a category'}</h2><p className="mt-1 text-sm text-slate-600">Use a clear name that shoppers will recognize.</p>
          <label htmlFor="category-name" className="mt-6 block text-sm font-semibold text-slate-800">Category name <span className="text-rose-700">*</span></label>
          <input id="category-name" type="text" required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Electronics" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:border-emerald-700 focus:outline-none transition-colors" />
          <label htmlFor="category-description" className="mt-5 block text-sm font-semibold text-slate-800">Description</label>
          <textarea id="category-description" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the products in this category" className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:border-emerald-700 focus:outline-none transition-colors" />
          <div className="mt-6 flex flex-wrap gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving} className="min-h-11 rounded-xl bg-[#155b3a] px-5 text-sm font-bold text-white hover:bg-[#0e452c] disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : editingId != null ? 'Save changes' : 'Add category'}
            </motion.button>
            <AnimatePresence>
              {editingId != null && (
                <motion.button initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} type="button" onClick={resetForm} className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
                  Cancel
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.form>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-bold text-slate-900">Current categories</h2><p className="text-sm text-slate-600">{loading ? 'Loading…' : `${categories.length} categories`}</p></div>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="status" className="p-8 text-sm text-slate-600">Loading categories…</motion.p>
            ) : categories.length === 0 ? (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-sm text-slate-600">No categories yet.</motion.p>
            ) : (
              <motion.ul key="list" variants={staggerList} initial="hidden" animate="show" className="divide-y divide-slate-100">
                <AnimatePresence>
                  {categories.map((category) => {
                    const id = category.category_id ?? category.id;
                    return (
                      <motion.li layout variants={itemVariant} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} key={id} className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-emerald-50/50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900">{category.category_name ?? category.name}</h3>
                          <p className="mt-1 text-sm leading-5 text-slate-600">{category.description || 'No description provided.'}</p>
                        </div>
                        <div className="flex gap-2">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => { setForm({ name: category.category_name ?? category.name ?? '', description: category.description ?? '' }); setEditingId(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors">Edit</motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => handleDelete(category)} className="min-h-10 rounded-lg bg-rose-50 px-3 text-sm font-semibold text-rose-800 hover:bg-rose-100 transition-colors">Delete</motion.button>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
