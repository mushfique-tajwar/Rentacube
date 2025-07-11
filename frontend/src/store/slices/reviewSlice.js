import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reviewService from '../../services/reviewService';

// Initial state
const initialState = {
  reviews: [],
  currentReview: null,
  myReviews: [],
  loading: false,
  error: null,
  message: null,
};

// Async thunks
export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewService.createReview(reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reviewService.getReviews(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMyReviews = createAsyncThunk(
  'reviews/fetchMyReviews',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reviewService.getMyReviews(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await reviewService.updateReview(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reviewService.deleteReview(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Review slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setCurrentReview: (state, action) => {
      state.currentReview = action.payload;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.reviews.unshift(action.payload.review);
        state.myReviews.unshift(action.payload.review);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create review';
      })
      // Fetch reviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews || [];
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch reviews';
      })
      // Fetch my reviews
      .addCase(fetchMyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.myReviews = action.payload.reviews || [];
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch my reviews';
      })
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const updatedReview = action.payload.review;
        
        // Update in reviews array
        const reviewIndex = state.reviews.findIndex(
          (review) => review._id === updatedReview._id
        );
        if (reviewIndex !== -1) {
          state.reviews[reviewIndex] = updatedReview;
        }
        
        // Update in myReviews array
        const myReviewIndex = state.myReviews.findIndex(
          (review) => review._id === updatedReview._id
        );
        if (myReviewIndex !== -1) {
          state.myReviews[myReviewIndex] = updatedReview;
        }
        
        // Update current review
        if (state.currentReview?._id === updatedReview._id) {
          state.currentReview = updatedReview;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update review';
      })
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const deletedId = action.payload.id;
        
        // Remove from reviews array
        state.reviews = state.reviews.filter(
          (review) => review._id !== deletedId
        );
        
        // Remove from myReviews array
        state.myReviews = state.myReviews.filter(
          (review) => review._id !== deletedId
        );
        
        // Clear current review if it's the deleted one
        if (state.currentReview?._id === deletedId) {
          state.currentReview = null;
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete review';
      });
  },
});

export const {
  clearError,
  clearMessage,
  setCurrentReview,
  clearCurrentReview,
} = reviewSlice.actions;

export default reviewSlice.reducer;
