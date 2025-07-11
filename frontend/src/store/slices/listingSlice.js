import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import listingService from '../../services/listingService';

// Initial state
const initialState = {
  listings: [],
  currentListing: null,
  myListings: [],
  searchResults: [],
  filters: {
    category: '',
    location: '',
    priceRange: [0, 1000],
    dateRange: [null, null],
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },
  loading: false,
  error: null,
  message: null,
};

// Async thunks
export const fetchListings = createAsyncThunk(
  'listings/fetchListings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await listingService.getListings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchListingById = createAsyncThunk(
  'listings/fetchListingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await listingService.getListingById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createListing = createAsyncThunk(
  'listings/createListing',
  async (listingData, { rejectWithValue }) => {
    try {
      const response = await listingService.createListing(listingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateListing = createAsyncThunk(
  'listings/updateListing',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await listingService.updateListing(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteListing = createAsyncThunk(
  'listings/deleteListing',
  async (id, { rejectWithValue }) => {
    try {
      const response = await listingService.deleteListing(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyListings = createAsyncThunk(
  'listings/fetchMyListings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await listingService.getMyListings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchListings = createAsyncThunk(
  'listings/searchListings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await listingService.searchListings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Listing slice
const listingSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setCurrentListing: (state, action) => {
      state.currentListing = action.payload;
    },
    clearCurrentListing: (state) => {
      state.currentListing = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch listings
      .addCase(fetchListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload.listings || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch listings';
      })
      // Fetch listing by ID
      .addCase(fetchListingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentListing = action.payload.listing;
      })
      .addCase(fetchListingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch listing';
      })
      // Create listing
      .addCase(createListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.myListings.unshift(action.payload.listing);
      })
      .addCase(createListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create listing';
      })
      // Update listing
      .addCase(updateListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateListing.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const updatedListing = action.payload.listing;
        
        // Update in listings array
        const listingIndex = state.listings.findIndex(
          (listing) => listing._id === updatedListing._id
        );
        if (listingIndex !== -1) {
          state.listings[listingIndex] = updatedListing;
        }
        
        // Update in myListings array
        const myListingIndex = state.myListings.findIndex(
          (listing) => listing._id === updatedListing._id
        );
        if (myListingIndex !== -1) {
          state.myListings[myListingIndex] = updatedListing;
        }
        
        // Update current listing
        if (state.currentListing?._id === updatedListing._id) {
          state.currentListing = updatedListing;
        }
      })
      .addCase(updateListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update listing';
      })
      // Delete listing
      .addCase(deleteListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const deletedId = action.payload.id;
        
        // Remove from listings array
        state.listings = state.listings.filter(
          (listing) => listing._id !== deletedId
        );
        
        // Remove from myListings array
        state.myListings = state.myListings.filter(
          (listing) => listing._id !== deletedId
        );
        
        // Clear current listing if it's the deleted one
        if (state.currentListing?._id === deletedId) {
          state.currentListing = null;
        }
      })
      .addCase(deleteListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete listing';
      })
      // Fetch my listings
      .addCase(fetchMyListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.loading = false;
        state.myListings = action.payload.listings || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch my listings';
      })
      // Search listings
      .addCase(searchListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchListings.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.listings || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(searchListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Search failed';
      });
  },
});

export const {
  clearError,
  clearMessage,
  setCurrentListing,
  clearCurrentListing,
  setFilters,
  clearFilters,
  setPagination,
} = listingSlice.actions;

export default listingSlice.reducer;
