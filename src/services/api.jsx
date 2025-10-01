import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Use your env variable
  headers: { "Content-Type": "application/json" },
});

export const registerUser = (userData) =>
  apiClient.post("/user/register", userData);
export const loginUser = (credentials) =>
  apiClient.post("/user/login", credentials);
