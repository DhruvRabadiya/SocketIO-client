import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Auth Functions ---
export const registerUser = (userData) =>
  apiClient.post("/user/register", userData);
export const loginUser = (credentials) =>
  apiClient.post("/user/login", credentials);

// --- New User Functions ---
export const getAllUsers = () => apiClient.get("/user/all");
export const getUserById = (userId) => apiClient.get(`/user/${userId}`);


export const getChatHistory = (roomName) => apiClient.get(`/user/roomname/${roomName}`);