import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const unwrapResponse = (res) => {
  if (res.data && typeof res.data === 'object' && res.data.success && res.data.data !== undefined) {
    return res.data.data;
  }
  return res.data;
};

// Categories
export const getCategories = () => axios.get(`${API_BASE}/categories`).then(unwrapResponse);
export const createCategory = (data) => axios.post(`${API_BASE}/categories`, data).then(unwrapResponse);
export const updateCategory = (id, data) => axios.put(`${API_BASE}/categories/${id}`, data).then(unwrapResponse);
export const deleteCategory = (id) => axios.delete(`${API_BASE}/categories/${id}`).then(unwrapResponse);

// Admin Products
export const getProducts = () => axios.get(`${API_BASE}/admin/products`).then(unwrapResponse);
export const getProductById = (id) => axios.get(`${API_BASE}/admin/products/${id}`).then(unwrapResponse);
export const createProduct = (data) => axios.post(`${API_BASE}/admin/products`, data).then(unwrapResponse);
export const updateProduct = (id, data) => axios.put(`${API_BASE}/admin/products/${id}`, data).then(unwrapResponse);
export const deactivateProduct = (id) => axios.delete(`${API_BASE}/admin/products/${id}`).then(unwrapResponse);
export const activateProduct = (id) => axios.patch(`${API_BASE}/admin/products/${id}/activate`).then(unwrapResponse);
