import { createSlice } from '@reduxjs/toolkit';
import { clearSession, loginUser, setUser } from './authSlice';

const pointsSlice = createSlice({
  name: 'points',
  initialState: {
    balance: 0,
  },
  reducers: {
    setPointsBalance(state, action) {
      state.balance = action.payload ?? 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.balance = action.payload.user?.pointsBalance ?? 0;
      })
      .addCase(setUser, (state, action) => {
        if (typeof action.payload?.pointsBalance === 'number') {
          state.balance = action.payload.pointsBalance;
        }
      })
      .addCase(clearSession, (state) => {
        state.balance = 0;
      });
  },
});

export const { setPointsBalance } = pointsSlice.actions;
export default pointsSlice.reducer;
