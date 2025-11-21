import axios from 'axios';
import { getAuthToken } from '../utils/adminAuth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiService = {
  // Categories
  getCategories: () => api.get('/categories'),
  
  // Question Banks
  getQuestionBanks: (categoryId) => api.get(`/categories/${categoryId}/banks`),
  
  // Bank Info
  getBankInfo: (categoryId) => api.get(`/categories/${categoryId}/bank-info`),
  
  // Generate Questions
  generateQuestions: (categoryId) =>
    api.post(`/categories/${categoryId}/generate`),
  
  // Add Questions
  addQuestions: (categoryId, questions, bankId = null) =>
    api.post(`/categories/${categoryId}/questions`, { questions, bankId }),
};

export default api;

