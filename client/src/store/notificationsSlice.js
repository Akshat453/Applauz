import { createSlice } from '@reduxjs/toolkit';
import { clearSession } from './authSlice';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    unreadCount: 0,
  },
  reducers: {
    setUnreadCount(state, action) {
      state.unreadCount = action.payload ?? 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearSession, (state) => {
      state.unreadCount = 0;
    });
  },
});

export const { setUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
