import { configureStore } from '@reduxjs/toolkit';
import playlistReducer from './playlistSlice'; // Import your playlist logic

const store = configureStore({
  reducer: {
    playlist: playlistReducer, // Register playlist slice
  },
  // Optional: Adding middleware and devTools configurations
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Can adjust depending on data handling needs
    }),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development mode
});

export default store;