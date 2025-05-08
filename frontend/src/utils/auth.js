import axios from 'axios';

// Read from environment variable, fallback to localhost in dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';
export const register = async (userId, username, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { userId, username, password });
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.message || 'Registration failed');
  }
};

export const login = async (userId, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { userId, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.message || 'Login failed');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
};
