import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { loginUser, registerUser } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (token) {
        const decodedToken = jwtDecode(token);
        setUser({
          id: decodedToken.id || decodedToken._id,
          username: decodedToken.username,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, [token]);
  const login = async (credentials) => {
    const { data } = await loginUser(credentials);
    const receivedToken = data.token;
    localStorage.setItem("token", receivedToken);
    setToken(receivedToken);
  };

  const register = (userData) => registerUser(userData);

  // The logout function is also simpler.
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
