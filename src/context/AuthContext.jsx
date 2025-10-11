import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import {
  loginUser,
  registerUser,
  getUserGroups,
  saveFcmToken,
  removeFcmToken,
} from "../services/api";
import { getFcmToken, onForegroundMessage } from "../firebase/firebase";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
        auth: { token },
      });
      setSocket(newSocket);
      newSocket.on("online_users", (userIds) => setOnlineUsers(userIds));

      getUserGroups()
        .then((res) => setGroups(res.data.groups))
        .catch(console.error);

      const setupNotifications = async () => {
        const fcmToken = await getFcmToken();
        if (fcmToken) {
          await saveFcmToken(fcmToken);
        }
      };
      setupNotifications();

      onForegroundMessage().then((payload) => {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
              onClick={() => {
                navigate(
                  payload.data.type === "group"
                    ? `/group/${payload.data.conversationId}`
                    : `/chat/${payload.data.senderId}`
                );
                toast.dismiss(t.id);
              }}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {payload.notification.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {payload.notification.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ),
          { duration: 5000 }
        );
      });

      try {
        const decodedToken = jwtDecode(token);
        setUser({
          id: decodedToken.id || decodedToken._id,
          username: decodedToken.username,
        });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setToken(null);
      } finally {
        setLoading(false);
      }
      return () => {
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
  const logout = async () => {
    try {
      const fcmToken = await getFcmToken();
      if (fcmToken) {
        await removeFcmToken(fcmToken);
      }
    } catch (error) {
      console.error("Failed to remove FCM token on logout.", error);
    } finally {
      // Proceed with logout regardless of whether token removal was successful
      localStorage.removeItem("token");
      setToken(null);
    }
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
