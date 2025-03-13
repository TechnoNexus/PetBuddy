import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPets = () => api.get('/pets');
export const createPet = (petData) => api.post('/pets', petData);
export const getPetById = (id) => api.get(`/pets/${id}`);
export const updatePet = (id, petData) => api.put(`/pets/${id}`, petData);
export const deletePet = (id) => api.delete(`/pets/${id}`);
export const chatApi = {
  getConversations: () => api.get('/conversations'),

  getMessages: (conversationId) =>
    api.get(`/conversations/${conversationId}/messages`),

  sendMessage: (conversationId, message) =>
    api.post(`/conversations/${conversationId}/messages`, { message }),

  markAsRead: (conversationId) =>
    api.put(`/conversations/${conversationId}/read`)
};

export default api;
