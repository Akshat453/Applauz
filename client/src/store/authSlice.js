import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient, { setAccessTokenGetter } from '../api/axiosClient';

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Something went wrong.';
}

export const loginUser = createAsyncThunk('auth/loginUser', async ({ email, password }, { rejectWithValue, dispatch }) => {
  try {
    const response = await axiosClient.post('/auth/login', { email, password });
    dispatch(setSession({ user: response.data.user, accessToken: response.data.accessToken }));
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setSession(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.error = null;
      setAccessTokenGetter(() => action.payload.accessToken);
    },
    clearSession(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'idle';
      state.error = null;
      setAccessTokenGetter(() => null);
    },
    setUser(state, action) {
      state.user = state.user ? { ...state.user, ...action.payload } : action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to sign in.';
      });
  },
});

export const { setSession, clearSession, setUser } = authSlice.actions;
export default authSlice.reducer;
