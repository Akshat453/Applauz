import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import notificationsReducer from './notificationsSlice';
import pointsReducer from './pointsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    points: pointsReducer,
    notifications: notificationsReducer,
  },
});
