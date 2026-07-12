import { useDispatch, useSelector } from 'react-redux';
import { clearSession, loginUser } from '../store/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const status = useSelector((state) => state.auth.status);
  const error = useSelector((state) => state.auth.error);

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.rejected.match(result)) {
      throw new Error(result.payload || 'Unable to sign in.');
    }
    return result.payload;
  };

  const logout = () => {
    dispatch(clearSession());
  };

  return {
    user,
    accessToken,
    login,
    logout,
    isAuthenticated: Boolean(user && accessToken),
    isLoading: status === 'loading',
    error,
  };
}
