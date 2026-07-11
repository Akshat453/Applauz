import { useMemo, useState } from "react";
import axiosClient, { setAccessTokenGetter } from "../api/axiosClient";
import AuthContext from "./auth-context";

function getLoginErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to log in right now. Please try again."
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await axiosClient.post("/auth/login", {
        email,
        password,
      });

      setAccessTokenGetter(() => response.data.accessToken);
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
    } catch (error) {
      throw new Error(getLoginErrorMessage(error));
    }
  };

  const logout = () => {
    setAccessTokenGetter(() => null);
    setAccessToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      login,
      logout,
    }),
    [accessToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
