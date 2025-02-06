import { configureStore } from '@reduxjs/toolkit';
import playlistReducer from './playlistSlice';

const store = configureStore({
  reducer: {
    playlist: playlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;