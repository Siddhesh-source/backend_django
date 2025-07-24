import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://your-django-server:8000/api';  // Replace with your Django server URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await api.post('/auth/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;

        await AsyncStorage.setItem('token', access);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (error) {
        // If refresh token fails, logout user
        await AsyncStorage.multiRemove(['token', 'refreshToken']);
        // Redirect to login screen here
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { access_token, refresh_token } = response.data;
      
      await AsyncStorage.setItem('token', access_token);
      await AsyncStorage.setItem('refreshToken', refresh_token);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/registration/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout/');
      await AsyncStorage.multiRemove(['token', 'refreshToken']);
    } catch (error) {
      throw error;
    }
  },

  getUser: async () => {
    try {
      const response = await api.get('/auth/user/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api; 