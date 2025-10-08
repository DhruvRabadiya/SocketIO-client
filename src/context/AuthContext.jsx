import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import { loginUser, registerUser, getUserGroups } from "../services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (token) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
        auth: { token },
      });
      setSocket(newSocket);

      newSocket.on("online_users", (userIds) => {
        setOnlineUsers(userIds);
      });

      getUserGroups()
        .then((res) => setGroups(res.data.groups))
        .catch(console.error);

      try {
        const decodedToken = jwtDecode(token);
        setUser({
          id: decodedToken.id || decodedToken._id,
          username: decodedToken.username,
        });
      } catch (error) {
        console.error("Invalid token:", error);
        setToken(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }

      return () => {
        newSocket.off("online_users");
        newSocket.disconnect();
      };
    } else {
      setUser(null);
      setSocket(null);
      setOnlineUsers([]);
      setGroups([]);
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

  const updateGroups = (updater) => {
    if (typeof updater === "function") {
      setGroups(updater);
    } else {
      setGroups(updater);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        socket,
        onlineUsers,
        groups,
        updateGroups,
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
