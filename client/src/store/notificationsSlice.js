import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';
import { clearSession } from './authSlice';

const initialState = {
  items: [],
  unreadCount: 0,
  total: 0,
  status: 'idle',
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, limit = 10 } = {}) => {
    const response = await axiosClient.get('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notificationId) => {
    const response = await axiosClient.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async () => {
    const response = await axiosClient.patch('/notifications/read-all');
    return response.data;
  },
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        if (state.status === 'idle') {
          state.status = 'loading';
        }
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.items ?? [];
        state.unreadCount = action.payload.unreadCount ?? 0;
        state.total = action.payload.total ?? 0;
        state.status = 'succeeded';
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const updatedNotification = action.payload;
        state.items = state.items.map((item) => (
          item.id === updatedNotification.id ? updatedNotification : item
        ));
        state.unreadCount = state.items.filter((item) => !item.is_read).length;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, is_read: true }));
        state.unreadCount = 0;
      })
      .addCase(clearSession, () => initialState);
  },
});

export default notificationsSlice.reducer;
