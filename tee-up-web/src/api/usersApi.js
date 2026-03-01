import axiosInstance from './axiosInstance';

/**
 * Get public user profile by id (for viewing other users' profiles).
 * Backend: GET /user/:id (no auth required)
 */
export const getPublicUser = async (userId) => {
  const response = await axiosInstance.get(`/user/${userId}`);
  return response.data;
};

/**
 * Get public user profile with stats (listing count, rating, reviews).
 * Backend: GET /user/:id/profile
 */
export const getPublicUserProfile = async (userId) => {
  const response = await axiosInstance.get(`/user/${userId}/profile`);
  return response.data;
};

// Get all users (superadmin only)
export const getAllUsers = async (search = '') => {
  const params = search ? { search } : {};
  const response = await axiosInstance.get('/user/admin/users', { params });
  return response.data;
};

// Get user by ID (admin) – backend route is GET /user/admin/user/:id
export const getUserById = async (userId) => {
  const response = await axiosInstance.get(`/user/admin/user/${userId}`);
  return response.data;
};

// Suspend user (admin/superadmin only)
export const suspendUser = async (userId, duration, reason) => {
  const response = await axiosInstance.post(`/user/admin/suspend/${userId}`, {
    duration: duration || null,
    reason: reason || ''
  });
  return response.data;
};

// Unsuspend user (admin/superadmin only)
export const unsuspendUser = async (userId) => {
  const response = await axiosInstance.post(`/user/admin/unsuspend/${userId}`);
  return response.data;
};

// Get suspension logs
export const getSuspensionLogs = async (userId = null) => {
  const params = userId ? { userId } : {};
  const response = await axiosInstance.get('/user/admin/suspension-logs', { params });
  return response.data;
};

// Delete user (superadmin only)
export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/user/admin/delete/${userId}`);
  return response.data;
};

// Update user (admin/superadmin only)
export const updateUser = async (userId, userData) => {
  // Check if userData is FormData (for file upload) or regular object
  const config = userData instanceof FormData 
    ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    : {};
  
  const response = await axiosInstance.put(`/user/admin/update/${userId}`, userData, config);
  return response.data;
};

