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
 * Get current user's profile stats (auth required).
 * Backend: GET /user/profile/stats
 */
export const getProfileStats = async () => {
  const response = await axiosInstance.get('/user/profile/stats');
  return response.data;
};

/**
 * Update current user profile (auth required).
 * Backend: PUT /user/update (multipart/form-data)
 */
export const updateProfile = async ({ name, bio, profileImageFile }) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('bio', bio ?? '');
  if (profileImageFile instanceof File) {
    formData.append('profile_image', profileImageFile);
  }

  const response = await axiosInstance.put('/user/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data?.user ?? null;
};

/**
 * Change password for local accounts.
 * Backend: PUT /auth/change-password
 */
export const changePassword = async ({ currentPassword, newPassword, confirmNewPassword }) => {
  const response = await axiosInstance.put('/auth/change-password', {
    currentPassword,
    newPassword,
    confirmNewPassword,
  });
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
