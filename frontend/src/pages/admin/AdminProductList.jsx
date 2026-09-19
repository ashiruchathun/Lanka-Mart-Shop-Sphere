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
      // Handle the case where the API returns { success: true, data: [...] } instead of directly [...]
      setProducts(data.data || data);
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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
        <Link to="/admin/products/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Add New Product
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200 text-gray-700">
              <th className="p-3 font-semibold">SKU</th>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Category</th>
              <th className="p-3 font-semibold">Price</th>
              <th className="p-3 font-semibold text-center">Status</th>
              <th className="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.product_id} className="border-b border-gray-100 hover:bg-gray-50 text-gray-800">
                <td className="p-3 font-mono text-sm text-gray-500">{prod.sku}</td>
                <td className="p-3 font-medium">{prod.product_name}</td>
                <td className="p-3">{prod.category_name}</td>
                <td className="p-3">LKR {parseFloat(prod.price).toLocaleString()}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${prod.is_active === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {prod.is_active === 1 ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link to={`/admin/products/${prod.product_id}/edit`} className="text-blue-600 hover:text-blue-800 mr-3 font-medium">Edit</Link>
                  {prod.is_active === 1 ? (
                    <button onClick={() => handleDeactivate(prod.product_id)} className="text-orange-600 hover:text-orange-800 font-medium">Deactivate</button>
                  ) : (
                    <button onClick={() => handleActivate(prod.product_id)} className="text-green-600 hover:text-green-800 font-medium">Activate</button>
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
