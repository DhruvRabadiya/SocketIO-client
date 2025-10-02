import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // <-- 1. Import the decoder
import { loginUser, registerUser } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const decodedToken = jwtDecode(storedToken);
        setUser({ id: decodedToken.id, username: decodedToken.username });
      }
    } catch (error) {
      console.error("Invalid token found in localStorage", error);
      setToken(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await loginUser(credentials);
    const receivedToken = data.token;

    const decodedToken = jwtDecode(receivedToken);

    setToken(receivedToken);
    setUser({ username: decodedToken.username });

    localStorage.setItem("token", receivedToken);
  };

  const register = (userData) => registerUser(userData);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
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
