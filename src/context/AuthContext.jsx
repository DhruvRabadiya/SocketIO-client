import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import { loginUser, registerUser } from "../services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // State for online users list

  useEffect(() => {
    try {
      if (token) {
        const decodedToken = jwtDecode(token);
        setUser({
          id: decodedToken.id || decodedToken._id,
          username: decodedToken.username,
        });
        const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
          auth: { token },
        });
        setSocket(newSocket);

        // Listen for the online users list from the server
        newSocket.on("online_users", (userIds) => {
          setOnlineUsers(userIds);
        });

        return () => {
          newSocket.off("online_users");
          newSocket.disconnect();
          setSocket(null);
        };
      } else {
        setUser(null);
        setSocket(null);
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
    localStorage.setItem("token", data.token);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const register = (userData) => registerUser(userData);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        socket,
        onlineUsers,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
