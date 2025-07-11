import api from './api';

const reviewService = {
  // Create review
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response;
  },

  // Get reviews
  getReviews: async (params = {}) => {
    const response = await api.get('/reviews', { params });
    return response;
  },

  // Get my reviews
  getMyReviews: async (params = {}) => {
    const response = await api.get('/reviews/my-reviews', { params });
    return response;
  },

  // Update review
  updateReview: async (id, data) => {
    const response = await api.put(`/reviews/${id}`, data);
    return response;
  },

  // Delete review
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response;
  },

  // Vote on review
  voteReview: async (id, vote) => {
    const response = await api.patch(`/reviews/${id}/vote`, { vote });
    return response;
  },
};

export default reviewService;
