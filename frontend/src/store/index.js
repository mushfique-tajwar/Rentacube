import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import listingSlice from './slices/listingSlice';
import bookingSlice from './slices/bookingSlice';
import reviewSlice from './slices/reviewSlice';
import adminSlice from './slices/adminSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    listings: listingSlice,
    bookings: bookingSlice,
    reviews: reviewSlice,
    admin: adminSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Export types for TypeScript support
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
