import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deactivateProduct, activateProduct } from '../../api/adminProducts';

export default function AdminProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const handleDeactivate = async (id) => {
    if (confirm('Are you sure you want to deactivate this product?')) {
      try {
        await deactivateProduct(id);
        fetchProducts();
      } catch (error) {
        console.error('Failed to deactivate product', error);
      }
    }
  };

  const handleActivate = async (id) => {
    if (confirm('Are you sure you want to activate this product?')) {
      try {
        await activateProduct(id);
        fetchProducts();
      } catch (error) {
        console.error('Failed to activate product', error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-lg mt-10 border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Product Catalogue</h2>
          <p className="text-gray-500 mt-1">Manage your store's inventory and product listings.</p>
        </div>
        <Link to="/admin/products/new" className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all shadow-sm">
          + Add New Product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <th className="p-4 font-semibold text-sm uppercase tracking-wider">SKU</th>
              <th className="p-4 font-semibold text-sm uppercase tracking-wider">Name</th>
              <th className="p-4 font-semibold text-sm uppercase tracking-wider">Category</th>
              <th className="p-4 font-semibold text-sm uppercase tracking-wider">Price</th>
              <th className="p-4 font-semibold text-sm uppercase tracking-wider text-center">Status</th>
              <th className="p-4 font-semibold text-sm uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.product_id} className="border-b border-gray-100 hover:bg-green-50 transition-colors text-gray-800">
                <td className="p-4 font-mono text-sm text-gray-500 whitespace-nowrap">{prod.sku}</td>
                <td className="p-4 font-semibold text-gray-900">{prod.product_name}</td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {prod.category_name}
                  </span>
                </td>
                <td className="p-4 font-medium text-gray-700 whitespace-nowrap">LKR {parseFloat(prod.price).toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${prod.is_active === 1 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${prod.is_active === 1 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {prod.is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <Link to={`/admin/products/${prod.product_id}/edit`} className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-2 transition-colors">
                    Edit
                  </Link>
                  {prod.is_active === 1 ? (
                    <button onClick={() => handleDeactivate(prod.product_id)} className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                      Deactivate
                    </button>
                  ) : (
                    <button onClick={() => handleActivate(prod.product_id)} className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">No products available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
