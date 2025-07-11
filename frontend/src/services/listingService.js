import api from './api';

const listingService = {
  // Get all listings
  getListings: async (params = {}) => {
    const response = await api.get('/listings', { params });
    return response;
  },

  // Get listing by ID
  getListingById: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response;
  },

  // Create listing
  createListing: async (listingData) => {
    const response = await api.post('/listings', listingData);
    return response;
  },

  // Update listing
  updateListing: async (id, data) => {
    const response = await api.put(`/listings/${id}`, data);
    return response;
  },

  // Delete listing
  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response;
  },

  // Get my listings
  getMyListings: async (params = {}) => {
    const response = await api.get('/listings/my-listings', { params });
    return response;
  },

  // Search listings
  searchListings: async (params = {}) => {
    const response = await api.get('/listings/search', { params });
    return response;
  },

  // Upload images
  uploadImages: async (formData) => {
    const response = await api.post('/listings/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};

export default listingService;
