import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Categories
export const getCategories = () => axios.get(`${API_BASE}/categories`).then(res => res.data);
export const createCategory = (data) => axios.post(`${API_BASE}/categories`, data).then(res => res.data);
export const updateCategory = (id, data) => axios.put(`${API_BASE}/categories/${id}`, data).then(res => res.data);
export const deleteCategory = (id) => axios.delete(`${API_BASE}/categories/${id}`).then(res => res.data);

// Admin Products
export const getProducts = () => axios.get(`${API_BASE}/admin/products`).then(res => res.data);
export const getProductById = (id) => axios.get(`${API_BASE}/admin/products/${id}`).then(res => res.data);
export const createProduct = (data) => axios.post(`${API_BASE}/admin/products`, data).then(res => res.data);
export const updateProduct = (id, data) => axios.put(`${API_BASE}/admin/products/${id}`, data).then(res => res.data);
export const deactivateProduct = (id) => axios.delete(`${API_BASE}/admin/products/${id}`).then(res => res.data);
export const activateProduct = (id) => axios.patch(`${API_BASE}/admin/products/${id}/activate`).then(res => res.data);
