import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Auth Functions ---
export const registerUser = (userData) =>
  apiClient.post("/user/register", userData);
export const loginUser = (credentials) =>
  apiClient.post("/user/login", credentials);

// --- User & Contact Functions ---
export const getAllUsers = () => apiClient.get("/user/all");
export const getUserById = (userId) => apiClient.get(`/user/${userId}`);

// --- Group Functions ---
export const createGroup = (groupData) =>
  apiClient.post("/user/creategroup", groupData);
export const getUserGroups = () => apiClient.get("/user/groups");
// NEW: Function to get details of a single group
export const getGroupById = (groupId) =>
  apiClient.get(`/user/group/details/${groupId}`);

// --- Message Functions ---
export const createMessage = (messageData) =>
  apiClient.post("/user/messages", messageData);
// UPDATED: This function now handles both DM and group history
export const getChatHistory = (id, isGroupChat, pageNo = 1) => {
  const endpoint = isGroupChat
    ? `/user/group/messages/${id}?pageNo=${pageNo}`
    : `/user/roomname/${id}?pageNo=${pageNo}`;
  return apiClient.get(endpoint);
};
export const deleteMessage = (messageId) =>
  apiClient.patch(`/user/delete/${messageId}`);
export const editMessage = (messageId, newText) =>
  apiClient.patch(`/user/edit/${messageId}`, { text: newText });
export const addUserToGroup = (groupId, userIds, tempId) => {
  return apiClient.patch(`/user/group/add/${groupId}`, { userIds, tempId });
};
export const renameGroup = (groupId, newGroupName, tempId) => {
  return apiClient.patch(`/user/groupName/${groupId}`, {
    groupName: newGroupName,
    tempId: tempId,
  });
};
export const leaveGroup = (groupId, tempId) => {
  return apiClient.patch(`/user/groups/${groupId}/leave`, { tempId });
};
