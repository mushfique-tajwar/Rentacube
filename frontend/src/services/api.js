import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000'
});

export const UserAPI = {
  register: (data) => api.post('/users/add', data),
  login: (data) => api.post('/users/login', data),
  list: () => api.get('/users')
};

export const ListingAPI = {
  create: (formData) => api.post('/listings/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  all: (params) => api.get('/listings', { params }),
  byId: (id) => api.get(`/listings/${id}`)
};

export default api;
