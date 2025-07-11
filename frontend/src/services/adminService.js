import api from './api';

const adminService = {
  // Get users
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response;
  },

  // Get all listings
  getAllListings: async (params = {}) => {
    const response = await api.get('/admin/listings', { params });
    return response;
  },

  // Get all bookings
  getAllBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings', { params });
    return response;
  },

  // Get analytics
  getAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics', { params });
    return response;
  },

  // Update user status
  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response;
  },

  // Update listing status
  updateListingStatus: async (listingId, status) => {
    const response = await api.patch(`/admin/listings/${listingId}/status`, { status });
    return response;
  },

  // Get platform statistics
  getPlatformStats: async () => {
    const response = await api.get('/admin/stats');
    return response;
  },
};

export default adminService;
