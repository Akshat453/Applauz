import axiosClient from '../api/axiosClient';
import { setUser } from '../store/authSlice';
import { setPointsBalance } from '../store/pointsSlice';

export async function syncAuthenticatedProfile(dispatch) {
  const response = await axiosClient.get('/users/me');
  dispatch(setUser(response.data));
  dispatch(setPointsBalance(response.data.pointsBalance));
  return response.data;
}
