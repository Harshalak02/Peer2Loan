import axios from 'axios';

// Use direct URL since proxy might not be working
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyToken: () => api.get('/auth/verify'),
};

// In frontend/src/services/api.js - update the getUserGroups function
export const groupService = {
  createGroup: (groupData) => api.post('/groups', groupData),
  getUserGroups: async () => {
    try {
      const response = await api.get('/groups/my-groups');
      console.log('Groups API response:', response.data); // Debug log
      return response;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  },
  getGroup: async (id) => {
    try {
      const response = await api.get(`/groups/${id}`);
      console.log('Group details response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching group details:', error);
      throw error;
    }
  },
  startGroup: (groupId) => api.post(`/groups/${groupId}/start`),
};

export const cycleService = {
  getGroupCycles: (groupId) => api.get(`/cycles/group/${groupId}`),
  getCurrentCycle: (groupId) => api.get(`/cycles/group/${groupId}/current`),
};

export const paymentService = {
  recordPayment: (paymentData) => {
    // If paymentData is a FormData instance, set proper headers
    if (paymentData instanceof FormData) {
      return api.post('/payments', paymentData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/payments', paymentData);
  },
  verifyPayment: (data) => api.post('/payments/verify', data),
};

export const invitationService = {
  sendInvitation: (invitationData) => api.post('/invitations/send', invitationData),
  joinGroup: (accessCode) => api.post('/invitations/join', { accessCode }),
  getMyInvitations: () => api.get('/invitations/my-invitations'),
  getGroupInvitations: (groupId) => api.get(`/invitations/group/${groupId}`),
};
// Add this to your api.js file
export const joinRequestService = {
  getGroupInfo: (accessCode) => api.get(`/join-requests/group-info/${accessCode}`),
  requestJoin: (requestData) => api.post('/join-requests/request-join', requestData),
  getPendingRequests: (groupId) => api.get(`/join-requests/pending-requests/${groupId}`),
  approveRequest: (invitationId) => api.post(`/join-requests/approve/${invitationId}`),
  rejectRequest: (invitationId) => api.post(`/join-requests/reject/${invitationId}`),
};
export default api;