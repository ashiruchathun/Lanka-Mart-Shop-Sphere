import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getCatalogProducts = (params) => {
  return axios.get(`${API_BASE}/products`, { params }).then(res => res.data);
};

export const getCatalogProductById = (id) => {
  return axios.get(`${API_BASE}/products/${id}`).then(res => res.data);
};
