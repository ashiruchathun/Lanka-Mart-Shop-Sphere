import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getCategories, createProduct, updateProduct, getProductById } from '../../api/adminProducts';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    product_name: '', 
    sku: '', 
    category_id: '', 
    description: '', 
    price: '', 
    quantity_in_stock: 0,
    reorder_level: 5,
    image_url: '', 
    is_active: 1
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCategories(), isEditMode ? getProductById(id) : Promise.resolve(null)])
      .then(([categoryList, data]) => {
        if (cancelled) return;
        setCategories(categoryList);
        if (data) setFormData({
          product_name: data.product_name || '',
          sku: data.sku || '',
          category_id: data.category_id || categoryList.find(c => c.category_name === data.category_name)?.category_id || '',
          description: data.description || '',
          price: data.price ?? '',
          quantity_in_stock: data.quantity_in_stock ?? 0,
          reorder_level: data.reorder_level ?? 5,
          image_url: data.image_url || '',
          is_active: data.is_active ?? 1
        });
      })
      .catch(err => {
        if (cancelled) return;
        console.error(err);
        setError('Unable to load product details or categories. Please check the backend and try again.');
      });
    return () => { cancelled = true; };
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    let parsedValue = value;
    if (type === 'number' && value !== '') {
      parsedValue = name === 'price' ? parseFloat(value) : parseInt(value, 10);
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.product_name || !formData.sku || formData.price === '' || !formData.category_id) {
      setError('Please fill in all mandatory fields (Name, SKU, Price, Category).');
      return;
    }
    
    if (formData.price < 0) {
      setError('Price cannot be negative.');
      return;
    }
    
    if (formData.quantity_in_stock < 0) {
      setError('Quantity in stock cannot be negative.');
      return;
    }
    
    if (formData.reorder_level < 0) {
      setError('Reorder level cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateProduct(id, formData);
        setSuccess('Product updated successfully!');
        setTimeout(() => navigate('/admin/products'), 1500);
      } else {
        await createProduct(formData);
        setSuccess('Product created successfully!');
        setFormData({ 
          product_name: '', sku: '', category_id: '', description: '', 
          price: '', quantity_in_stock: 0, reorder_level: 5, image_url: '', is_active: 1 
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save product. Please check the data format.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formStagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };
  const formVariant = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto p-5 sm:p-8 lg:p-10 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-wrap justify-between items-center mb-8 border-b border-gray-100 pb-5 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
          <p className="text-gray-500 mt-1">{isEditMode ? 'Update existing product information.' : 'Create a new product in the catalog.'}</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/products')} 
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
        >
          &larr; Back to List
        </motion.button>
      </div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.div key="error" initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md shadow-sm overflow-hidden">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3"><p className="text-sm font-medium">{error}</p></div>
            </div>
          </motion.div>
        )}
        
        {success && (
          <motion.div key="success" initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-r-md shadow-sm overflow-hidden">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3"><p className="text-sm font-medium">{success}</p></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form variants={formStagger} initial="hidden" animate="show" onSubmit={handleSubmit} className="space-y-6">
        <motion.div variants={formVariant} className="bg-[#f8faf8] p-5 sm:p-6 rounded-xl border border-gray-200 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
              <input type="text" id="product_name" name="product_name" value={formData.product_name} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-colors" placeholder="e.g. Premium Green Tea" />
            </div>
            
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">SKU <span className="text-red-500">*</span></label>
              <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm font-mono text-sm transition-colors" placeholder="e.g. GRO-TEA-001" />
            </div>
            
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm bg-white transition-colors">
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-colors" placeholder="Provide a detailed description..."></textarea>
          </div>
        </motion.div>
        
        <motion.div variants={formVariant} className="bg-[#f8faf8] p-5 sm:p-6 rounded-xl border border-gray-200 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Pricing & Inventory</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (LKR) <span className="text-red-500">*</span></label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Rs.</span>
                </div>
                <input type="number" step="0.01" min="0" id="price" name="price" value={formData.price} onChange={handleChange} required
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-colors" placeholder="0.00" />
              </div>
            </div>
            
            <div>
              <label htmlFor="quantity_in_stock" className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="1" id="quantity_in_stock" name="quantity_in_stock" value={formData.quantity_in_stock} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-colors" />
            </div>
            
            <div>
              <label htmlFor="reorder_level" className="block text-sm font-medium text-gray-700 mb-1">Reorder Level <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="1" id="reorder_level" name="reorder_level" value={formData.reorder_level} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-colors" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={formVariant} className="bg-[#f8faf8] p-5 sm:p-6 rounded-xl border border-gray-200 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Media & Status</h3>
          
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" id="image_url" name="image_url" value={formData.image_url} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-colors" placeholder="https://example.com/image.jpg or /uploads/product.jpg" />
          </div>

          {isEditMode && (
            <div>
              <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select id="is_active" name="is_active" value={formData.is_active} onChange={handleChange}
                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm bg-white transition-colors">
                <option value={1}>Active (Visible to customers)</option>
                <option value={0}>Inactive (Hidden)</option>
              </select>
            </div>
          )}
        </motion.div>

        <motion.div variants={formVariant} className="pt-6 flex flex-wrap justify-end gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => navigate('/admin/products')} className="mr-4 px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
            Cancel
          </motion.button>
          <motion.button whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }} type="submit" disabled={isSubmitting} className="px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-[#155b3a] hover:bg-[#0e452c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
