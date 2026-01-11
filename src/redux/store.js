import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import deviceReducer from './deviceSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    device: deviceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
