import api from './api';

const bookingService = {
  // Create booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response;
  },

  // Get my bookings
  getMyBookings: async (params = {}) => {
    const response = await api.get('/bookings/my-bookings', { params });
    return response;
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response;
  },

  // Update booking status
  updateBookingStatus: async (id, status) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response;
  },

  // Cancel booking
  cancelBooking: async (id, reason) => {
    const response = await api.patch(`/bookings/${id}/cancel`, { reason });
    return response;
  },

  // Extend booking
  extendBooking: async (id, data) => {
    const response = await api.patch(`/bookings/${id}/extend`, data);
    return response;
  },
};

export default bookingService;
