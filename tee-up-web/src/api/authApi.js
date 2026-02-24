import axiosInstance from './axiosInstance';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Sign in with email and password. Works for all users (regular and admin).
 * Backend: POST /auth/login
 */
export const login = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

/**
 * Get current user profile. Works for any authenticated user.
 * Backend: GET /user/profile (requires Bearer token)
 */
export const getProfile = async () => {
  const response = await axiosInstance.get('/user/profile');
  return response.data;
};

/**
 * Create account. Backend sends verification email; user must verify before logging in.
 * Backend: POST /auth/register
 */
export const register = async (name, email, password, confirmPassword) => {
  const response = await axiosInstance.post('/auth/register', {
    name,
    email,
    password,
    confirmPassword,
  });
  return response.data;
};
