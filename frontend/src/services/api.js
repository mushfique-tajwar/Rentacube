import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000'
});

// Export base URL for constructing absolute asset URLs in components
export const API_BASE = api.defaults.baseURL;

export const UserAPI = {
  register: (data) => api.post('/users/add', data),
  login: (data) => api.post('/users/login', data),
  list: () => api.get('/users'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  requestRenter: (data) => api.post('/users/request-renter', data),
  pendingRenters: () => api.get('/users/admin/pending-renters', { params: { adminUsername: 'admin' } }),
  approveRenter: (id, status) => api.put(`/users/admin/approve/${id}`, { status, adminUsername: 'admin' }),
  getProfile: (username) => api.get(`/users/profile/${encodeURIComponent(username)}`)
};

export const ListingAPI = {
  create: (formData) => api.post('/listings/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  all: (params) => api.get('/listings', { params }),
  byId: (id) => api.get(`/listings/${id}`),
  byOwner: (owner) => api.get(`/listings/owner/${owner}`),
  update: (id, data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    return api.put(`/listings/update/${id}`, data, { headers });
  },
  toggleActive: (id, owner) => api.put(`/listings/toggle/${id}`, { owner }),
  softDelete: (id, owner) => api.delete(`/listings/${id}`, { data: { owner } })
};

export const BookingAPI = {
  create: (data) => api.post('/bookings/create', data),
  forUser: (username) => api.get(`/bookings/user/${username}`),
  updateStatus: (id, status) => api.put(`/bookings/status/${id}`, { status }),
  pay: (id, { method, ref }) => api.put(`/bookings/pay/${id}`, { method, ref }),
  settle: (id) => api.put(`/bookings/settle/${id}`),
  autoComplete: () => api.post('/bookings/auto-complete')
};

export const ReviewAPI = {
  create: (data) => api.post('/reviews/create', data),
  forListing: (listingId) => api.get(`/reviews/listing/${listingId}`),
  forRenter: (username) => api.get(`/reviews/renter/${username}`)
};

export default api;
