import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategories, createProduct, updateProduct, getProductById } from '../../api/adminProducts';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '', sku: '', category_id: '', description: '', price: '', image_url: '', status: 'active'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    if (isEditMode) {
      getProductById(id)
        .then(data => {
          setFormData({
            name: data.name,
            sku: data.sku,
            category_id: data.category_id,
            description: data.description || '',
            price: data.price,
            image_url: data.image_url || '',
            status: data.status
          });
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load product details.');
        });
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validation
    if (!formData.name || !formData.sku || !formData.price || !formData.category_id) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      if (isEditMode) {
        await updateProduct(id, formData);
        setSuccess('Product updated successfully!');
        setTimeout(() => navigate('/admin/products'), 1500);
      } else {
        await createProduct(formData);
        setSuccess('Product created successfully!');
        setFormData({ name: '', sku: '', category_id: '', description: '', price: '', image_url: '', status: 'active' });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
        <button onClick={() => navigate('/admin/products')} className="text-gray-500 hover:text-gray-800 text-sm font-medium">← Back to List</button>
      </div>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-200">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR) *</label>
            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select name="category_id" value={formData.category_id} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input type="url" name="image_url" value={formData.image_url} onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        {isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        <div className="pt-4">
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition">
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
