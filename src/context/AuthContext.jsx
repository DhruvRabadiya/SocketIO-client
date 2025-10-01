import React, { createContext, useState, useContext, useEffect } from "react";
import { loginUser, registerUser } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) setUser({ username: storedUsername });
    }
  }, [token]);

  const login = async (credentials) => {
    const { data } = await loginUser(credentials);
    setToken(data.token);
    setUser({ username: data.username });
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
  };

  const register = (userData) => registerUser(userData);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
