import axios from 'axios';
import { supabase } from '../supabaseClient';

// Use local backend during development, Railway in production
const isDev = import.meta.env.DEV;
const API_URL = isDev ? 'http://localhost:8000' : (import.meta.env.VITE_BACKEND_URL || 'https://petbuddy-production-b407.up.railway.app');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the Supabase JWT
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    if (config.headers && config.headers.set) {
      config.headers.set('Authorization', `Bearer ${session.access_token}`);
    } else {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return config;
});

// Pets endpoints
export const getPets = (params) => api.get('/api/pets/', { params });
export const getFeaturedPets = () => api.get('/api/pets/', { params: { limit: 3 } });
export const createPet = (petData) => api.post('/api/pets/', petData);
export const getPetById = (id) => api.get(`/api/pets/${id}`);
export const updatePet = (id, petData) => api.put(`/api/pets/${id}`, petData);
export const deletePet = (id) => api.delete(`/api/pets/${id}`);

// Users profile endpoints
export const getMyProfile = () => api.get('/api/users/me');
export const updateProfile = (profileData) => api.put('/api/users/profile', profileData);
export const uploadAvatar = (formData) => api.post('/api/users/avatar', formData);

// Store endpoints
export const getProducts = (params) => api.get('/api/store/products', { params });

// Adoption endpoints
export const submitAdoptionApplication = (applicationData) => api.post('/api/adoptions/', applicationData);
export const getMyAdoptionApplications = () => api.get('/api/adoptions/');

export const chatApi = {
  getConversations: () => api.get('/api/chat/conversations'),
  getMessages: (conversationId) => api.get(`/api/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, message) => api.post(`/api/chat/conversations/${conversationId}/messages`, { message }),
  markAsRead: (conversationId) => api.put(`/api/chat/conversations/${conversationId}/read`)
};

export default api;
